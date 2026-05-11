import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import {
  type Acceptance,
  AcceptanceSchema,
  type AgentIssueConfig,
  DEFAULT_AGENT_ISSUE_CONFIG,
  DEFAULT_ISSUE_TYPES,
  type ExtractionResults,
  extractionResultsSchemaForConfig,
  type IssueTypes,
} from "./schema";

const MAX_ATTEMPTS = 3;
// TODO: Remove or re-gate this after debugging extraction misses.
// These logs include prompt content and caller details.
const EXTRACTION_DEBUG_ENABLED = true;

type ExtractionValue = string | number | boolean | null;

const ACCEPTANCE_SYSTEM_PROMPT = `You decide whether a completed phone call should create a Buzz issue.

Use the agent's issue creation criteria, org issue taxonomy, and configured issue type keys. Return only the structured output.

# Rules
- shouldCreateIssue is true only when staff should follow up from this call.
- shouldCreateIssue is false for spam, wrong numbers, silent calls, test calls, duplicate no-action calls, or calls where no request/enquiry was made.
- reason is null when shouldCreateIssue is true.
- reason is a short snake_case value when shouldCreateIssue is false.
- issueTypes must contain only issue type keys from the agent issue config's allowedIssueTypes.
- issueTypes may contain multiple values when the call covered multiple use cases.
- Use the agent's issue type guidance when choosing issueTypes.
- confidence describes your confidence in the acceptance decision.`;

const EXTRACTION_SYSTEM_PROMPT = `You extract structured fields from a completed phone-call transcript.

Use only the configured extraction field keys from the agent issue config. Fill a field only when the value is supported by the transcript or call metadata. Return null for unknown values.

# Rules
- Do not invent values.
- Keep field values concise and factual.
- Use the configured field keys exactly.
- The fields object must include every configured extraction field key exactly once.
- Use null for configured fields that are unknown or not present.
- Review the transcript directly for every configured field.
- If a value is stated by the caller or repeated back by the agent, fill the matching configured field.
- Use call metadata only as fallback context. For phone/contact fields, prefer a callback number stated in the transcript over the inbound fromNumber.
- It is fine for some fields to be null.
- notes should contain useful extra context for staff, or null when there is none.`;

function issueTypesForOrg(org: Doc<"orgs"> | null): IssueTypes {
  return org?.issueTypes ?? DEFAULT_ISSUE_TYPES;
}

function agentIssueConfigForAgent(
  agent: Doc<"agents"> | null,
  issueTypes: IssueTypes,
): AgentIssueConfig {
  if (!agent?.issueConfig) {
    return {
      ...DEFAULT_AGENT_ISSUE_CONFIG,
      allowedIssueTypes: issueTypes.map((type) => type.key),
    };
  }
  return agent.issueConfig;
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
  issueTypes: IssueTypes;
  agentIssueConfig: AgentIssueConfig;
  conversation: Doc<"conversations">;
  acceptance?: Acceptance;
}) {
  return [
    "Agent:",
    input.agent?.name ?? "Unknown agent",
    "",
    "Agent issue config:",
    JSON.stringify(input.agentIssueConfig, null, 2),
    "",
    "Org issue taxonomy:",
    JSON.stringify(input.issueTypes, null, 2),
    "",
    ...(input.acceptance
      ? ["Acceptance result:", JSON.stringify(input.acceptance, null, 2), ""]
      : []),
    "Call metadata:",
    JSON.stringify(
      {
        fromNumber: input.conversation.callFromNumber,
        toNumber: input.conversation.callToNumber,
        durationSecs: input.conversation.callDurationSecs,
        outcome: input.conversation.callSuccessful,
      },
      null,
      2,
    ),
    "",
    "Transcript:",
    input.transcript || "(empty)",
  ].join("\n");
}

function debugExtraction(
  phase: "acceptance" | "extraction",
  event: string,
  payload: Record<string, unknown>,
) {
  if (!EXTRACTION_DEBUG_ENABLED) return;
  console.log(`[buzz:${phase}:${event}] ${JSON.stringify(payload, null, 2)}`);
}

function allowedIssueTypeKeys(agentIssueConfig: AgentIssueConfig) {
  return new Set(agentIssueConfig.allowedIssueTypes);
}

function normalizeAcceptance(
  result: Acceptance,
  agentIssueConfig: AgentIssueConfig,
): Acceptance {
  const allowed = allowedIssueTypeKeys(agentIssueConfig);
  return {
    shouldCreateIssue: result.shouldCreateIssue,
    reason: result.shouldCreateIssue
      ? null
      : (result.reason ?? "not_actionable"),
    issueTypes: result.issueTypes.filter((type) => allowed.has(type)),
    confidence: result.confidence,
  };
}

function allowedFieldKeys(agentIssueConfig: AgentIssueConfig) {
  return new Set(agentIssueConfig.extractionFields.map((field) => field.key));
}

function normalizeExtraction(
  result: ExtractionResults,
  agentIssueConfig: AgentIssueConfig,
): ExtractionResults {
  const allowed = allowedFieldKeys(agentIssueConfig);
  const fields: Record<string, ExtractionValue> = {};
  for (const field of agentIssueConfig.extractionFields) {
    const value = result.fields[field.key];
    fields[field.key] =
      value === undefined || !allowed.has(field.key) ? null : value;
  }
  return {
    fields,
    notes: result.notes,
  };
}

export const runAcceptance = internalAction({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
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
      const org = await ctx.runQuery(
        internal.conversations.getOrgForExtraction,
        {
          orgId: conversation.orgId,
        },
      );
      const issueTypes = issueTypesForOrg(org);
      const agentIssueConfig = agentIssueConfigForAgent(agent, issueTypes);
      const prompt = userPrompt({
        transcript: transcriptFor(conversation),
        agent,
        issueTypes,
        agentIssueConfig,
        conversation,
      });
      debugExtraction("acceptance", "input", {
        conversationId,
        agentId: agent?._id ?? null,
        agentName: agent?.name ?? null,
        issueTypeKeys: issueTypes.map((type) => type.key),
        allowedIssueTypes: agentIssueConfig.allowedIssueTypes,
        extractionFieldKeys: agentIssueConfig.extractionFields.map(
          (field) => field.key,
        ),
        bodyTextLength: conversation.bodyText?.length ?? 0,
        messageCount: conversation.messages?.length ?? 0,
        prompt,
      });
      const result = await generateText({
        model: anthropic("claude-haiku-4-5"),
        system: ACCEPTANCE_SYSTEM_PROMPT,
        prompt,
        output: Output.object({ schema: AcceptanceSchema }),
      });
      debugExtraction("acceptance", "output", {
        conversationId,
        output: result.output,
      });

      await ctx.runMutation(internal.conversations.applyAcceptance, {
        conversationId,
        acceptanceResult: normalizeAcceptance(result.output, agentIssueConfig),
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
          { conversationId },
        );
      }
    }
  },
});

export const runExtraction = internalAction({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
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
      const org = await ctx.runQuery(
        internal.conversations.getOrgForExtraction,
        {
          orgId: conversation.orgId,
        },
      );
      const issueTypes = issueTypesForOrg(org);
      const agentIssueConfig = agentIssueConfigForAgent(agent, issueTypes);
      const prompt = userPrompt({
        transcript: transcriptFor(conversation),
        agent,
        issueTypes,
        agentIssueConfig,
        conversation,
        acceptance: conversation.acceptanceResult,
      });
      debugExtraction("extraction", "input", {
        conversationId,
        agentId: agent?._id ?? null,
        agentName: agent?.name ?? null,
        issueTypeKeys: issueTypes.map((type) => type.key),
        allowedIssueTypes: agentIssueConfig.allowedIssueTypes,
        extractionFieldKeys: agentIssueConfig.extractionFields.map(
          (field) => field.key,
        ),
        acceptanceResult: conversation.acceptanceResult,
        bodyTextLength: conversation.bodyText?.length ?? 0,
        messageCount: conversation.messages?.length ?? 0,
        prompt,
      });
      const result = await generateText({
        model: anthropic("claude-haiku-4-5"),
        system: EXTRACTION_SYSTEM_PROMPT,
        prompt,
        output: Output.object({
          schema: extractionResultsSchemaForConfig(agentIssueConfig),
        }),
      });
      const extractionResults = normalizeExtraction(
        result.output,
        agentIssueConfig,
      );
      debugExtraction("extraction", "output", {
        conversationId,
        rawOutput: result.output,
        normalizedOutput: extractionResults,
      });
      await ctx.runMutation(internal.conversations.applyExtractionResults, {
        conversationId,
        extractionResults,
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
          { conversationId },
        );
      }
    }
  },
});
