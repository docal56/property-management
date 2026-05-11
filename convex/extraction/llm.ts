import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import {
  type Acceptance,
  AcceptanceSchema,
  DEFAULT_PROCESSING_PROFILE,
  type ExtractionResults,
  ExtractionResultsSchema,
  type ProcessingProfile,
  ProcessingProfileSchema,
} from "./schema";

const MAX_ATTEMPTS = 3;

const partialFieldsValidator = v.object({
  callerName: v.union(v.string(), v.null()),
  address: v.union(v.string(), v.null()),
  phoneNumber: v.union(v.string(), v.null()),
});

type PartialFields = {
  callerName: string | null;
  address: string | null;
  phoneNumber: string | null;
};

type ExtractionValue = string | number | boolean | null;

const ACCEPTANCE_SYSTEM_PROMPT = `You decide whether a completed phone call should create a Buzz issue.

Use the agent's acceptance criteria and configured intent keys. Return only the structured output.

# Rules
- shouldCreateIssue is true only when staff should follow up from this call.
- shouldCreateIssue is false for spam, wrong numbers, silent calls, test calls, duplicate no-action calls, or calls where no request/enquiry was made.
- reason is null when shouldCreateIssue is true.
- reason is a short snake_case value when shouldCreateIssue is false.
- intents must contain only keys from the agent profile.
- intents may contain multiple values when the call covered multiple use cases.
- confidence describes your confidence in the acceptance decision.`;

const EXTRACTION_SYSTEM_PROMPT = `You extract structured fields from a completed phone-call transcript.

Use only the configured extraction field keys from the agent profile. Fill a field only when the value is supported by the transcript or the already-known upstream hints. Return null for unknown values.

# Rules
- Do not invent values.
- Keep field values concise and factual.
- Use the configured field keys exactly.
- It is fine for most fields to be null.
- notes should contain useful extra context for staff, or null when there is none.`;

function profileForAgent(agent: Doc<"agents"> | null): ProcessingProfile {
  if (!agent?.processingProfile) return DEFAULT_PROCESSING_PROFILE;
  const parsed = ProcessingProfileSchema.safeParse(agent.processingProfile);
  return parsed.success ? parsed.data : DEFAULT_PROCESSING_PROFILE;
}

function transcriptFor(conversation: Doc<"conversations">) {
  return (
    conversation.bodyText ??
    (conversation.messages
      ? conversation.messages
          .map((m) => `${m.senderName ?? m.role}: ${m.body}`)
          .join("\n")
      : "")
  );
}

function userPrompt(input: {
  transcript: string;
  agent: Doc<"agents"> | null;
  profile: ProcessingProfile;
  partialFields: PartialFields;
  acceptance?: Acceptance;
}) {
  return [
    "Agent:",
    input.agent?.name ?? "Unknown agent",
    "",
    "Agent processing profile:",
    JSON.stringify(input.profile, null, 2),
    "",
    ...(input.acceptance
      ? ["Acceptance result:", JSON.stringify(input.acceptance, null, 2), ""]
      : []),
    "Already-known upstream fields (null means missing):",
    JSON.stringify(input.partialFields, null, 2),
    "",
    "Transcript:",
    input.transcript || "(empty)",
  ].join("\n");
}

function allowedIntentKeys(profile: ProcessingProfile) {
  return new Set(profile.intents.map((intent) => intent.key));
}

function normalizeAcceptance(
  result: Acceptance,
  profile: ProcessingProfile,
): Acceptance {
  const allowed = allowedIntentKeys(profile);
  return {
    shouldCreateIssue: result.shouldCreateIssue,
    reason: result.shouldCreateIssue
      ? null
      : (result.reason ?? "not_actionable"),
    intents: result.intents.filter((intent) => allowed.has(intent)),
    confidence: result.confidence,
  };
}

function allowedFieldKeys(profile: ProcessingProfile) {
  return new Set(profile.extractionFields.map((field) => field.key));
}

function normalizeExtraction(
  result: ExtractionResults,
  profile: ProcessingProfile,
): ExtractionResults {
  const allowed = allowedFieldKeys(profile);
  const fields: Record<string, ExtractionValue> = {};
  for (const field of profile.extractionFields) {
    const value = result.fields[field.key];
    fields[field.key] =
      value === undefined || !allowed.has(field.key) ? null : value;
  }
  return {
    fields,
    notes: result.notes,
  };
}

function stringField(
  fields: Record<string, ExtractionValue>,
  keys: string[],
  fallback: string | null,
) {
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }
  return fallback;
}

export const runAcceptance = internalAction({
  args: {
    conversationId: v.id("conversations"),
    partialFields: partialFieldsValidator,
  },
  handler: async (ctx, { conversationId, partialFields }) => {
    const conversation = await ctx.runQuery(
      internal.conversations.getForExtraction,
      { conversationId },
    );
    if (!conversation) return;
    if (conversation.extractionAttempts >= MAX_ATTEMPTS) return;

    const newAttempt: number = await ctx.runMutation(
      internal.conversations.bumpExtractionAttempt,
      { conversationId },
    );

    try {
      const agent = conversation.callAgentId
        ? await ctx.runQuery(internal.conversations.getAgentForExtraction, {
            agentId: conversation.callAgentId,
          })
        : null;
      const profile = profileForAgent(agent);
      const result = await generateText({
        model: anthropic("claude-haiku-4-5"),
        system: ACCEPTANCE_SYSTEM_PROMPT,
        prompt: userPrompt({
          transcript: transcriptFor(conversation),
          agent,
          profile,
          partialFields,
        }),
        output: Output.object({ schema: AcceptanceSchema }),
      });

      await ctx.runMutation(internal.conversations.applyAcceptance, {
        conversationId,
        acceptanceResult: normalizeAcceptance(result.output, profile),
        partialFields,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const { capped }: { capped: boolean; attempts: number } =
        await ctx.runMutation(internal.conversations.recordExtractionError, {
          conversationId,
          error: message,
        });
      if (!capped) {
        const delayMs = 2 ** newAttempt * 1000;
        await ctx.scheduler.runAfter(
          delayMs,
          internal.extraction.llm.runAcceptance,
          { conversationId, partialFields },
        );
      }
    }
  },
});

export const runExtraction = internalAction({
  args: {
    conversationId: v.id("conversations"),
    partialFields: partialFieldsValidator,
  },
  handler: async (ctx, { conversationId, partialFields }) => {
    const conversation = await ctx.runQuery(
      internal.conversations.getForExtraction,
      { conversationId },
    );
    if (!conversation?.acceptanceResult?.shouldCreateIssue) return;
    if (conversation.extractionAttempts >= MAX_ATTEMPTS) return;

    const newAttempt: number = await ctx.runMutation(
      internal.conversations.bumpExtractionAttempt,
      { conversationId },
    );

    try {
      const agent = conversation.callAgentId
        ? await ctx.runQuery(internal.conversations.getAgentForExtraction, {
            agentId: conversation.callAgentId,
          })
        : null;
      const profile = profileForAgent(agent);
      const result = await generateText({
        model: anthropic("claude-haiku-4-5"),
        system: EXTRACTION_SYSTEM_PROMPT,
        prompt: userPrompt({
          transcript: transcriptFor(conversation),
          agent,
          profile,
          partialFields,
          acceptance: conversation.acceptanceResult,
        }),
        output: Output.object({ schema: ExtractionResultsSchema }),
      });
      const extractionResults = normalizeExtraction(result.output, profile);
      await ctx.runMutation(internal.conversations.applyExtractionResults, {
        conversationId,
        extractionResults,
        legacyFields: {
          callerName: stringField(
            extractionResults.fields,
            ["name", "caller_name"],
            partialFields.callerName,
          ),
          address: stringField(
            extractionResults.fields,
            ["address", "valuation_property_address", "property_address"],
            partialFields.address,
          ),
          phoneNumber: stringField(
            extractionResults.fields,
            ["phone", "phone_number"],
            partialFields.phoneNumber,
          ),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const { capped }: { capped: boolean; attempts: number } =
        await ctx.runMutation(internal.conversations.recordExtractionError, {
          conversationId,
          error: message,
        });
      if (!capped) {
        const delayMs = 2 ** newAttempt * 1000;
        await ctx.scheduler.runAfter(
          delayMs,
          internal.extraction.llm.runExtraction,
          { conversationId, partialFields },
        );
      }
    }
  },
});

export const runLLMFill = internalAction({
  args: {
    conversationId: v.id("conversations"),
    partialFields: partialFieldsValidator,
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.extraction.llm.runAcceptance,
      args,
    );
  },
});
