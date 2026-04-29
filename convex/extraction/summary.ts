import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

const MAX_ATTEMPTS = 3;

const SummarySchema = z.object({
  cardSummary: z.string().trim().min(1),
  brief: z.object({
    issueTitle: z.string().trim().min(1).nullable(),
    details: z.string().trim().min(1).nullable(),
  }),
});

const SYSTEM_PROMPT = `You are summarising a phone call between a property tenant and an AI phone agent. The call is about a maintenance, repair, or property issue at the tenant's home.

Your summary will be read by a property manager who needs to triage the issue and arrange for someone to go out and resolve it.

# Output format

Return a structured object containing a short card summary, then a structured brief.

## Card summary

cardSummary: A two-sentence summary written in plain prose, suitable for a kanban board card. It should give the property manager an at-a-glance picture of the issue without needing to open the full brief.

The first sentence should describe what the tenant has reported. The second should add the most important context - usually one of: when it started, how bad it is, whether it's affecting the rest of the property, or any safety concern.

Example: "Tenant reported a broken hot tap. The issue started on Wednesday 16th April, but hot water is available elsewhere in the property."

## Full brief

Use the brief object with these fields. Return null for either field if there is no relevant information from the transcript.
- issueTitle: One-line description of what's wrong.
- details: A short paragraph covering everything the property manager needs to know to triage the issue: what the tenant is experiencing (what they can see, hear, smell, or feel; what's working and what isn't), how long it's been going on, anything affecting urgency (safety concerns, loss of essential services, damage spreading, vulnerable occupants), anything the tenant has been asked to do or has agreed to (e.g. sending photos, providing access), and any notes about getting into the property (best times, pets, parking, etc.). Use line breaks where applicable.

# Rules
- Stick to what's actually in the transcript. Do not infer or assume.
- Keep language plain and direct. No jargon.
- If the tenant's words are unclear or contradictory, leave the item out rather than guessing.
- Write in full sentences, not fragments. The property manager should be able to read the brief like a report, not a checklist.`;

export const runIssueSummary = internalAction({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, { issueId }) => {
    const payload = await ctx.runQuery(
      internal.issues.getForSummaryGeneration,
      { issueId },
    );
    if (!payload) return;
    if (
      payload.issue.summaryAttempts &&
      payload.issue.summaryAttempts >= MAX_ATTEMPTS
    ) {
      return;
    }

    const newAttempt: number = await ctx.runMutation(
      internal.issues.bumpSummaryGenerationAttempt,
      { issueId },
    );

    try {
      const transcript =
        payload.conversation.bodyText ??
        (payload.conversation.messages
          ? payload.conversation.messages
              .map((m) => `${m.senderName ?? m.role}: ${m.body}`)
              .join("\n")
          : "");

      const result = await generateText({
        model: anthropic("claude-haiku-4-5"),
        system: SYSTEM_PROMPT,
        prompt: ["Transcript:", transcript || "(empty)"].join("\n"),
        output: Output.object({ schema: SummarySchema }),
      });

      await ctx.runMutation(internal.issues.applyGeneratedSummary, {
        issueId,
        summary: result.output,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const { capped }: { capped: boolean; attempts: number } =
        await ctx.runMutation(internal.issues.recordSummaryGenerationError, {
          issueId,
          error: message,
        });
      if (!capped) {
        const delayMs = 2 ** newAttempt * 1000;
        await ctx.scheduler.runAfter(
          delayMs,
          internal.extraction.summary.runIssueSummary,
          { issueId },
        );
      }
    }
  },
});
