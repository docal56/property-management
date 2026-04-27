import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { ExtractionSchema } from "./schema";

const MAX_ATTEMPTS = 3;

const partialFieldsValidator = v.object({
  callerName: v.union(v.string(), v.null()),
  address: v.union(v.string(), v.null()),
  phoneNumber: v.union(v.string(), v.null()),
});

const SYSTEM_PROMPT = `You extract structured fields from a property-management phone-call transcript.

Return:
- shouldCreateIssue: true if the call describes a real maintenance/management request from a tenant or prospect, false for spam, wrong number, hang-ups, robocalls, repeat-of-already-handled, or anything that is not actionable.
- reason: only when shouldCreateIssue is false; a short snake_case-or-phrase reason (e.g. "spam", "wrong_number", "hangup", "no_request_made"). Null when shouldCreateIssue is true.
- callerName, address, phoneNumber: extract verbatim from the transcript when present, otherwise null.

Some fields may already be populated from the upstream extractor. Only return values that you can support from the transcript.`;

export const runLLMFill = internalAction({
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
      const transcript =
        conversation.bodyText ??
        (conversation.messages
          ? conversation.messages
              .map((m) => `${m.senderName ?? m.role}: ${m.body}`)
              .join("\n")
          : "");

      const userPrompt = [
        "Transcript:",
        transcript || "(empty)",
        "",
        "Already-known fields (null means missing):",
        JSON.stringify(partialFields, null, 2),
        "",
        "Caller phone (from telephony, may be null):",
        conversation.callFromNumber ?? "null",
      ].join("\n");

      const result = await generateText({
        model: anthropic("claude-haiku-4-5"),
        system: SYSTEM_PROMPT,
        prompt: userPrompt,
        output: Output.object({ schema: ExtractionSchema }),
      });

      const llm = result.output;

      const merged = {
        shouldCreateIssue: llm.shouldCreateIssue,
        reason: llm.reason,
        callerName: partialFields.callerName ?? llm.callerName,
        address: partialFields.address ?? llm.address,
        phoneNumber: partialFields.phoneNumber ?? llm.phoneNumber,
      };

      await ctx.runMutation(internal.conversations.applyExtraction, {
        conversationId,
        extractedFields: merged,
        extractionStatus: "llm-filled",
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
          internal.extraction.llm.runLLMFill,
          { conversationId, partialFields },
        );
      }
    }
  },
});
