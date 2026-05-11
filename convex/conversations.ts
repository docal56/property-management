import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { parseDataCollectionResults } from "./elevenlabs/dataCollection";
import { requireUserAndOrg } from "./lib/auth";
import { topBoardPosition } from "./lib/boardPositions";
import { createPublicId } from "./lib/publicIds";

const messageValidator = v.object({
  role: v.string(),
  body: v.string(),
  senderName: v.union(v.string(), v.null()),
  occurredAtUnixSecs: v.union(v.number(), v.null()),
  timeInCallSecs: v.union(v.number(), v.null()),
});

const normalizedValidator = v.object({
  channel: v.literal("call"),
  provider: v.literal("elevenlabs"),
  providerEventType: v.string(),
  kind: v.union(v.literal("transcription"), v.literal("initiation_failure")),
  providerConversationId: v.union(v.string(), v.null()),
  providerDedupeKey: v.string(),
  providerStatus: v.string(),
  occurredAtUnixSecs: v.number(),
  subject: v.union(v.string(), v.null()),
  bodyText: v.union(v.string(), v.null()),
  messages: v.union(v.array(messageValidator), v.null()),
  callAgentExternalId: v.union(v.string(), v.null()),
  callFromNumber: v.union(v.string(), v.null()),
  callToNumber: v.union(v.string(), v.null()),
  callDurationSecs: v.union(v.number(), v.null()),
  callSuccessful: v.union(
    v.literal("success"),
    v.literal("failure"),
    v.literal("unknown"),
    v.null(),
  ),
  dataCollectionResultsRaw: v.any(),
});

async function createUniqueIssuePublicId(ctx: MutationCtx, orgId: Id<"orgs">) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = createPublicId();
    const existing = await ctx.db
      .query("issues")
      .withIndex("by_org_and_public_id", (q) =>
        q.eq("orgId", orgId).eq("publicId", publicId),
      )
      .first();
    if (!existing) return publicId;
  }
  throw new Error("Could not allocate issue public id");
}

const extractedFieldsValidator = v.object({
  shouldCreateIssue: v.boolean(),
  reason: v.union(v.string(), v.null()),
  callerName: v.union(v.string(), v.null()),
  address: v.union(v.string(), v.null()),
  phoneNumber: v.union(v.string(), v.null()),
  issueSummary: v.optional(v.union(v.string(), v.null())),
});

const acceptanceResultValidator = v.object({
  shouldCreateIssue: v.boolean(),
  reason: v.union(v.string(), v.null()),
  intents: v.array(v.string()),
  confidence: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
});

const extractionResultsValidator = v.object({
  fields: v.record(
    v.string(),
    v.union(v.string(), v.number(), v.boolean(), v.null()),
  ),
  notes: v.union(v.string(), v.null()),
});

const partialFieldsValidator = v.object({
  callerName: v.union(v.string(), v.null()),
  address: v.union(v.string(), v.null()),
  phoneNumber: v.union(v.string(), v.null()),
});

async function loadActiveConversation(
  ctx: QueryCtx,
  id: Id<"conversations">,
  orgId: Id<"orgs">,
) {
  const doc = await ctx.db.get(id);
  if (!doc || doc.orgId !== orgId || doc.softDeleted) return null;
  return doc;
}

function fallbackIssueSummary(conversation: Doc<"conversations">) {
  if (conversation.extractionResults?.notes) {
    return conversation.extractionResults.notes;
  }
  if (conversation.extractedFields?.issueSummary) {
    return conversation.extractedFields.issueSummary;
  }
  if (conversation.bodyText) return conversation.bodyText;
  return "Summary pending.";
}

function extractionString(
  fields: Record<string, string | number | boolean | null> | undefined,
  keys: string[],
) {
  if (!fields) return null;
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
  return null;
}

function issueTypesForIntents(intents: string[] | undefined) {
  if (!intents) return undefined;
  const out = intents.filter((intent) => intent.trim().length > 0);
  return out.length > 0 ? Array.from(new Set(out)) : undefined;
}

function issuePatchFromExtraction(
  issue: Doc<"issues">,
  conversation: Doc<"conversations">,
) {
  const fields = conversation.extractedFields;
  const extractionFields = conversation.extractionResults?.fields;
  const patch: Partial<Doc<"issues">> = {
    acceptanceResult: conversation.acceptanceResult,
    extractionResults: conversation.extractionResults,
  };
  const types = issueTypesForIntents(conversation.acceptanceResult?.intents);
  if (types && (!issue.types || issue.types.length === 0)) {
    patch.types = types;
  }
  if (!issue.address) {
    patch.address =
      extractionString(extractionFields, [
        "address",
        "valuation_property_address",
        "property_address",
      ]) ??
      fields?.address ??
      null;
  }
  if (!issue.contactName) {
    patch.contactName =
      extractionString(extractionFields, ["name", "caller_name"]) ??
      fields?.callerName ??
      null;
  }
  if (!issue.contactPhone) {
    patch.contactPhone =
      extractionString(extractionFields, ["phone", "phone_number"]) ??
      fields?.phoneNumber ??
      conversation.callFromNumber;
  }
  if (!issue.contactEmail) {
    patch.contactEmail = extractionString(extractionFields, ["email"]);
  }
  if (
    issue.summary === "Summary pending." &&
    conversation.extractionResults?.notes
  ) {
    patch.summary = conversation.extractionResults.notes;
  }
  return patch;
}

async function issueForConversation(
  ctx: MutationCtx,
  conversation: Doc<"conversations">,
) {
  if (conversation.issueId) {
    const linkedIssue = await ctx.db.get(conversation.issueId);
    if (linkedIssue && linkedIssue.orgId === conversation.orgId) {
      return linkedIssue;
    }
  }

  const rows = await ctx.db
    .query("issues")
    .withIndex("by_primary_conversation", (q) =>
      q.eq("primaryConversationId", conversation._id),
    )
    .take(10);
  return rows.find((issue) => issue.orgId === conversation.orgId) ?? null;
}

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    channel: v.optional(v.string()),
    callAgentId: v.optional(v.id("agents")),
    callOutcome: v.optional(
      v.union(v.literal("success"), v.literal("failure"), v.literal("unknown")),
    ),
    dateRange: v.optional(
      v.object({ fromSecs: v.number(), toSecs: v.number() }),
    ),
  },
  handler: async (ctx, args) => {
    const { org } = await requireUserAndOrg(ctx);

    const dateRange = args.dateRange;
    const channel = args.channel;
    const callAgentId = args.callAgentId;
    const callOutcome = args.callOutcome;

    const baseQuery =
      channel && callAgentId && callOutcome
        ? ctx.db
            .query("conversations")
            .withIndex("by_org_sd_channel_agent_outcome_time", (q) => {
              const eq = q
                .eq("orgId", org._id)
                .eq("softDeleted", false)
                .eq("channel", channel)
                .eq("callAgentId", callAgentId)
                .eq("callSuccessful", callOutcome);
              return dateRange
                ? eq
                    .gte("occurredAtUnixSecs", dateRange.fromSecs)
                    .lte("occurredAtUnixSecs", dateRange.toSecs)
                : eq;
            })
            .order("desc")
        : channel && callAgentId
          ? ctx.db
              .query("conversations")
              .withIndex("by_org_sd_channel_agent_time", (q) => {
                const eq = q
                  .eq("orgId", org._id)
                  .eq("softDeleted", false)
                  .eq("channel", channel)
                  .eq("callAgentId", callAgentId);
                return dateRange
                  ? eq
                      .gte("occurredAtUnixSecs", dateRange.fromSecs)
                      .lte("occurredAtUnixSecs", dateRange.toSecs)
                  : eq;
              })
              .order("desc")
          : channel && callOutcome
            ? ctx.db
                .query("conversations")
                .withIndex("by_org_sd_channel_outcome_time", (q) => {
                  const eq = q
                    .eq("orgId", org._id)
                    .eq("softDeleted", false)
                    .eq("channel", channel)
                    .eq("callSuccessful", callOutcome);
                  return dateRange
                    ? eq
                        .gte("occurredAtUnixSecs", dateRange.fromSecs)
                        .lte("occurredAtUnixSecs", dateRange.toSecs)
                    : eq;
                })
                .order("desc")
            : callAgentId && callOutcome
              ? ctx.db
                  .query("conversations")
                  .withIndex("by_org_sd_agent_outcome_time", (q) => {
                    const eq = q
                      .eq("orgId", org._id)
                      .eq("softDeleted", false)
                      .eq("callAgentId", callAgentId)
                      .eq("callSuccessful", callOutcome);
                    return dateRange
                      ? eq
                          .gte("occurredAtUnixSecs", dateRange.fromSecs)
                          .lte("occurredAtUnixSecs", dateRange.toSecs)
                      : eq;
                  })
                  .order("desc")
              : channel
                ? ctx.db
                    .query("conversations")
                    .withIndex("by_org_sd_channel_time", (q) => {
                      const eq = q
                        .eq("orgId", org._id)
                        .eq("softDeleted", false)
                        .eq("channel", channel);
                      return dateRange
                        ? eq
                            .gte("occurredAtUnixSecs", dateRange.fromSecs)
                            .lte("occurredAtUnixSecs", dateRange.toSecs)
                        : eq;
                    })
                    .order("desc")
                : callAgentId
                  ? ctx.db
                      .query("conversations")
                      .withIndex("by_org_sd_agent_time", (q) => {
                        const eq = q
                          .eq("orgId", org._id)
                          .eq("softDeleted", false)
                          .eq("callAgentId", callAgentId);
                        return dateRange
                          ? eq
                              .gte("occurredAtUnixSecs", dateRange.fromSecs)
                              .lte("occurredAtUnixSecs", dateRange.toSecs)
                          : eq;
                      })
                      .order("desc")
                  : callOutcome
                    ? ctx.db
                        .query("conversations")
                        .withIndex("by_org_sd_outcome_time", (q) => {
                          const eq = q
                            .eq("orgId", org._id)
                            .eq("softDeleted", false)
                            .eq("callSuccessful", callOutcome);
                          return dateRange
                            ? eq
                                .gte("occurredAtUnixSecs", dateRange.fromSecs)
                                .lte("occurredAtUnixSecs", dateRange.toSecs)
                            : eq;
                        })
                        .order("desc")
                    : ctx.db
                        .query("conversations")
                        .withIndex("by_org_sd_time", (q) => {
                          const eq = q
                            .eq("orgId", org._id)
                            .eq("softDeleted", false);
                          return dateRange
                            ? eq
                                .gte("occurredAtUnixSecs", dateRange.fromSecs)
                                .lte("occurredAtUnixSecs", dateRange.toSecs)
                            : eq;
                        })
                        .order("desc");

    const page = await baseQuery.paginate(args.paginationOpts);

    const agentCache = new Map<Id<"agents">, Doc<"agents"> | null>();
    const issueCache = new Map<Id<"issues">, Doc<"issues"> | null>();
    const hydrated = await Promise.all(
      page.page.map(async (doc) => {
        let agent: Doc<"agents"> | null = null;
        let issue: Doc<"issues"> | null = null;
        if (doc.callAgentId) {
          if (agentCache.has(doc.callAgentId)) {
            agent = agentCache.get(doc.callAgentId) ?? null;
          } else {
            agent = await ctx.db.get(doc.callAgentId);
            agentCache.set(doc.callAgentId, agent);
          }
        }
        if (doc.issueId) {
          if (issueCache.has(doc.issueId)) {
            issue = issueCache.get(doc.issueId) ?? null;
          } else {
            const linkedIssue = await ctx.db.get(doc.issueId);
            issue =
              linkedIssue && linkedIssue.orgId === doc.orgId
                ? linkedIssue
                : null;
            issueCache.set(doc.issueId, issue);
          }
        }
        return { ...doc, agent, issue };
      }),
    );

    return { ...page, page: hydrated };
  },
});

export const createIssueFromCall = mutation({
  args: { conversationId: v.id("conversations") },
  returns: v.object({
    issueId: v.id("issues"),
    publicId: v.string(),
    created: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { org } = await requireUserAndOrg(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (
      !conversation ||
      conversation.orgId !== org._id ||
      conversation.softDeleted ||
      conversation.channel !== "call"
    ) {
      throw new Error("Not found");
    }

    const existingIssue = await issueForConversation(ctx, conversation);
    if (existingIssue) {
      let publicId = existingIssue.publicId;
      const patch: Partial<Doc<"issues">> = {};
      if (!publicId) {
        publicId = await createUniqueIssuePublicId(ctx, org._id);
        patch.publicId = publicId;
      }
      if (existingIssue.callAgentId !== conversation.callAgentId) {
        patch.callAgentId = conversation.callAgentId;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existingIssue._id, patch);
      }
      if (conversation.issueId !== existingIssue._id) {
        await ctx.db.patch(conversation._id, { issueId: existingIssue._id });
      }
      return { issueId: existingIssue._id, publicId, created: false };
    }

    const fields = conversation.extractedFields;
    const extractionFields = conversation.extractionResults?.fields;
    const newIssueId = await ctx.db.insert("issues", {
      orgId: org._id,
      publicId: await createUniqueIssuePublicId(ctx, org._id),
      primaryConversationId: conversation._id,
      callAgentId: conversation.callAgentId,
      status: "new",
      boardPosition: await topBoardPosition(ctx, org._id, "new"),
      source: "call",
      types: issueTypesForIntents(conversation.acceptanceResult?.intents),
      address:
        extractionString(extractionFields, [
          "address",
          "valuation_property_address",
          "property_address",
        ]) ??
        fields?.address ??
        conversation.subject,
      contactName:
        extractionString(extractionFields, ["name", "caller_name"]) ??
        fields?.callerName ??
        null,
      contactPhone:
        extractionString(extractionFields, ["phone", "phone_number"]) ??
        fields?.phoneNumber ??
        conversation.callFromNumber,
      contactEmail: extractionString(extractionFields, ["email"]),
      summary: fallbackIssueSummary(conversation),
      acceptanceResult: conversation.acceptanceResult,
      extractionResults: conversation.extractionResults,
      summaryStatus: "pending",
      summaryAttempts: 0,
      softDeleted: false,
    });

    await ctx.db.patch(conversation._id, { issueId: newIssueId });
    await ctx.scheduler.runAfter(
      0,
      internal.extraction.summary.runIssueSummary,
      { issueId: newIssueId },
    );

    const dedupeKey = `created_from_call:${conversation._id}`;
    const existingUpdate = await ctx.db
      .query("issueUpdates")
      .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", dedupeKey))
      .first();
    if (!existingUpdate) {
      await ctx.db.insert("issueUpdates", {
        orgId: org._id,
        issueId: newIssueId,
        kind: "created_from_call",
        dedupeKey,
        softDeleted: false,
      });
    }

    const issue = await ctx.db.get(newIssueId);
    if (!issue?.publicId) throw new Error("Issue public id was not set");
    return { issueId: newIssueId, publicId: issue.publicId, created: true };
  },
});

export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const { org } = await requireUserAndOrg(ctx);
    const doc = await loadActiveConversation(ctx, args.id, org._id);
    if (!doc) throw new Error("Not found");
    const agent = doc.callAgentId ? await ctx.db.get(doc.callAgentId) : null;
    return { ...doc, agent };
  },
});

async function findActiveAgentByExternalId(
  ctx: MutationCtx,
  externalId: string,
) {
  return await ctx.db
    .query("agents")
    .withIndex("by_elevenlabs_agent_id", (q) =>
      q.eq("elevenlabsAgentId", externalId),
    )
    .filter((q) => q.eq(q.field("softDeleted"), false))
    .collect();
}

async function findExistingByDedupe(
  ctx: MutationCtx,
  provider: string,
  dedupeKey: string,
) {
  return await ctx.db
    .query("conversations")
    .withIndex("by_provider_and_dedupe_key", (q) =>
      q.eq("provider", provider).eq("providerDedupeKey", dedupeKey),
    )
    .first();
}

export const ingestFromWebhook = internalMutation({
  args: {
    normalized: normalizedValidator,
    rawStorageId: v.optional(v.id("_storage")),
  },
  returns: v.object({
    outcome: v.union(
      v.literal("ingested"),
      v.literal("unknown_agent"),
      v.literal("duplicate_active_agent"),
    ),
  }),
  handler: async (ctx, { normalized, rawStorageId }) => {
    if (!normalized.callAgentExternalId) {
      return { outcome: "unknown_agent" as const };
    }

    const agents = await findActiveAgentByExternalId(
      ctx,
      normalized.callAgentExternalId,
    );
    const agent = agents[0];
    if (!agent) {
      return { outcome: "unknown_agent" as const };
    }
    const duplicateAgent = agents.length > 1;
    const orgId = agent.orgId;
    const outcome = {
      outcome: duplicateAgent
        ? ("duplicate_active_agent" as const)
        : ("ingested" as const),
    };

    const existing = await findExistingByDedupe(
      ctx,
      normalized.provider,
      normalized.providerDedupeKey,
    );

    const now = Date.now();
    const baseFields = {
      orgId,
      channel: normalized.channel,
      provider: normalized.provider,
      providerEventType: normalized.providerEventType,
      providerStatus: normalized.providerStatus,
      providerConversationId: normalized.providerConversationId,
      providerDedupeKey: normalized.providerDedupeKey,
      occurredAtUnixSecs: normalized.occurredAtUnixSecs,
      subject: normalized.subject,
      bodyText: normalized.bodyText,
      messages: normalized.messages,
      callAgentId: agent._id,
      callFromNumber: normalized.callFromNumber,
      callToNumber: normalized.callToNumber,
      callDurationSecs: normalized.callDurationSecs,
      callSuccessful: normalized.callSuccessful,
      webhookReceivedAt: now,
      rawWebhookStorageId: rawStorageId,
    };

    let conversationId: Id<"conversations">;
    if (existing) {
      // Patch raw fields; preserve extraction state and issueId.
      await ctx.db.patch(existing._id, baseFields);
      conversationId = existing._id;
      const isPlaceholderUpgrade =
        existing.extractionStatus === "not-applicable" &&
        normalized.kind === "transcription";
      if (!isPlaceholderUpgrade) return outcome;
    } else {
      conversationId = await ctx.db.insert("conversations", {
        ...baseFields,
        extractionStatus: "pending",
        extractionAttempts: 0,
        issueId: null,
        softDeleted: false,
      });
    }

    if (normalized.kind === "initiation_failure") {
      await ctx.db.patch(conversationId, {
        acceptanceResult: {
          shouldCreateIssue: false,
          reason: "call_initiation_failure",
          intents: [],
          confidence: "high",
        },
        extractionStatus: "not-applicable",
      });
      return outcome;
    }

    // transcription path — extraction routing
    const parsed = parseDataCollectionResults(
      normalized.dataCollectionResultsRaw,
    );

    let obviousReason: string | null = null;
    if (normalized.callSuccessful === "failure") {
      obviousReason = "call_failed";
    } else if (
      normalized.callDurationSecs !== null &&
      normalized.callDurationSecs < 5
    ) {
      obviousReason = "short_duration";
    } else if (
      normalized.messages === null ||
      normalized.messages.length === 0
    ) {
      obviousReason = "no_transcript";
    }

    if (obviousReason) {
      await ctx.db.patch(conversationId, {
        acceptanceResult: {
          shouldCreateIssue: false,
          reason: obviousReason,
          intents: [],
          confidence: "high",
        },
        extractedFields: {
          shouldCreateIssue: false,
          reason: obviousReason,
          callerName: null,
          address: null,
          phoneNumber: null,
        },
        extractionStatus: "elevenlabs-only",
      });
      return outcome;
    }

    await ctx.db.patch(conversationId, { extractionStatus: "pending" });
    await ctx.scheduler.runAfter(0, internal.extraction.llm.runAcceptance, {
      conversationId,
      partialFields: parsed,
    });

    return outcome;
  },
});

export const getForExtraction = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const doc = await ctx.db.get(conversationId);
    if (!doc) return null;
    return doc;
  },
});

export const getAgentForExtraction = internalQuery({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    const doc = await ctx.db.get(agentId);
    if (!doc || doc.softDeleted) return null;
    return doc;
  },
});

export const getOrgForExtraction = internalQuery({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, { orgId }) => {
    const doc = await ctx.db.get(orgId);
    if (!doc || doc.softDeleted) return null;
    return doc;
  },
});

export const bumpExtractionAttempt = internalMutation({
  args: { conversationId: v.id("conversations") },
  returns: v.number(),
  handler: async (ctx, { conversationId }) => {
    const doc = await ctx.db.get(conversationId);
    if (!doc) throw new Error("Conversation not found");
    const next = doc.extractionAttempts + 1;
    await ctx.db.patch(conversationId, { extractionAttempts: next });
    return next;
  },
});

export const applyExtraction = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    extractedFields: extractedFieldsValidator,
    extractionStatus: v.union(
      v.literal("elevenlabs-only"),
      v.literal("llm-filled"),
    ),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.conversationId);
    if (!doc) throw new Error("Conversation not found");
    await ctx.db.patch(args.conversationId, {
      extractedFields: args.extractedFields,
      extractionStatus: args.extractionStatus,
      lastExtractionError: undefined,
    });
    if (args.extractedFields.shouldCreateIssue && doc.issueId === null) {
      await ctx.scheduler.runAfter(
        0,
        internal.conversations.createIssueFromConversation,
        { conversationId: args.conversationId },
      );
    }
  },
});

export const applyAcceptance = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    acceptanceResult: acceptanceResultValidator,
    partialFields: partialFieldsValidator,
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.conversationId);
    if (!doc) throw new Error("Conversation not found");
    const legacyFields = {
      shouldCreateIssue: args.acceptanceResult.shouldCreateIssue,
      reason: args.acceptanceResult.reason,
      callerName: args.partialFields.callerName,
      address: args.partialFields.address,
      phoneNumber: args.partialFields.phoneNumber,
    };
    await ctx.db.patch(args.conversationId, {
      acceptanceResult: args.acceptanceResult,
      extractedFields: legacyFields,
      extractionAttempts: args.acceptanceResult.shouldCreateIssue
        ? 0
        : doc.extractionAttempts,
      extractionStatus: args.acceptanceResult.shouldCreateIssue
        ? "pending"
        : "llm-filled",
      lastExtractionError: undefined,
    });
    if (args.acceptanceResult.shouldCreateIssue) {
      await ctx.scheduler.runAfter(0, internal.extraction.llm.runExtraction, {
        conversationId: args.conversationId,
        partialFields: args.partialFields,
      });
    }
  },
});

export const applyExtractionResults = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    extractionResults: extractionResultsValidator,
    legacyFields: partialFieldsValidator,
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.conversationId);
    if (!doc) throw new Error("Conversation not found");
    const acceptance = doc.acceptanceResult;
    const legacyFields = {
      shouldCreateIssue: acceptance?.shouldCreateIssue ?? true,
      reason: acceptance?.reason ?? null,
      callerName: args.legacyFields.callerName,
      address: args.legacyFields.address,
      phoneNumber: args.legacyFields.phoneNumber,
    };
    const conversationPatch = {
      extractionResults: args.extractionResults,
      extractedFields: legacyFields,
      extractionStatus: "llm-filled" as const,
      lastExtractionError: undefined,
    };
    const updatedConversation = { ...doc, ...conversationPatch };
    await ctx.db.patch(args.conversationId, conversationPatch);
    if (!(acceptance?.shouldCreateIssue ?? true)) return;
    if (doc.issueId === null) {
      await ctx.scheduler.runAfter(
        0,
        internal.conversations.createIssueFromConversation,
        { conversationId: args.conversationId },
      );
      return;
    }

    const issue = await ctx.db.get(doc.issueId);
    if (issue && issue.orgId === doc.orgId) {
      await ctx.db.patch(
        issue._id,
        issuePatchFromExtraction(issue, updatedConversation),
      );
      if (issue.summaryStatus !== "llm-generated") {
        await ctx.scheduler.runAfter(
          0,
          internal.extraction.summary.runIssueSummary,
          { issueId: issue._id },
        );
      }
    }
  },
});

export const recordExtractionError = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    error: v.string(),
  },
  returns: v.object({
    capped: v.boolean(),
    attempts: v.number(),
  }),
  handler: async (ctx, { conversationId, error }) => {
    const doc = await ctx.db.get(conversationId);
    if (!doc) throw new Error("Conversation not found");
    const capped = doc.extractionAttempts >= 3;
    await ctx.db.patch(conversationId, {
      lastExtractionError: error,
      extractionStatus: capped ? "failed" : doc.extractionStatus,
    });
    return { capped, attempts: doc.extractionAttempts };
  },
});

export const createIssueFromConversation = internalMutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) return;
    if (conversation.issueId !== null) return;
    const fields = conversation.extractedFields;
    const acceptance = conversation.acceptanceResult;
    if (!fields && !acceptance) return;
    if (
      acceptance?.shouldCreateIssue === false ||
      fields?.shouldCreateIssue === false
    ) {
      console.log(
        `Skipping issue creation for ${conversationId}: ${acceptance?.reason ?? fields?.reason ?? "no reason"}`,
      );
      return;
    }

    const existingIssue = await ctx.db
      .query("issues")
      .withIndex("by_primary_conversation", (q) =>
        q.eq("primaryConversationId", conversationId),
      )
      .first();
    if (existingIssue) {
      const patch: Partial<Doc<"issues">> = {};
      if (!existingIssue.publicId) {
        patch.publicId = await createUniqueIssuePublicId(
          ctx,
          conversation.orgId,
        );
      }
      if (existingIssue.callAgentId !== conversation.callAgentId) {
        patch.callAgentId = conversation.callAgentId;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existingIssue._id, patch);
      }
      await ctx.db.patch(conversationId, { issueId: existingIssue._id });
      if (existingIssue.summaryStatus !== "llm-generated") {
        await ctx.scheduler.runAfter(
          0,
          internal.extraction.summary.runIssueSummary,
          { issueId: existingIssue._id },
        );
      }
      return;
    }

    const extractionFields = conversation.extractionResults?.fields;
    const newIssueId = await ctx.db.insert("issues", {
      orgId: conversation.orgId,
      primaryConversationId: conversationId,
      callAgentId: conversation.callAgentId,
      status: "new",
      boardPosition: await topBoardPosition(ctx, conversation.orgId, "new"),
      source: "call",
      types: issueTypesForIntents(acceptance?.intents),
      address:
        extractionString(extractionFields, [
          "address",
          "valuation_property_address",
          "property_address",
        ]) ??
        fields?.address ??
        null,
      contactName:
        extractionString(extractionFields, ["name", "caller_name"]) ??
        fields?.callerName ??
        null,
      contactPhone:
        extractionString(extractionFields, ["phone", "phone_number"]) ??
        fields?.phoneNumber ??
        conversation.callFromNumber,
      contactEmail: extractionString(extractionFields, ["email"]),
      summary: fallbackIssueSummary(conversation),
      acceptanceResult: acceptance,
      extractionResults: conversation.extractionResults,
      summaryStatus: "pending",
      summaryAttempts: 0,
      softDeleted: false,
    });
    await ctx.db.patch(newIssueId, {
      publicId: await createUniqueIssuePublicId(ctx, conversation.orgId),
    });

    await ctx.db.patch(conversationId, { issueId: newIssueId });
    await ctx.scheduler.runAfter(
      0,
      internal.extraction.summary.runIssueSummary,
      {
        issueId: newIssueId,
      },
    );

    const dedupeKey = `created_from_call:${conversationId}`;
    const existingUpdate = await ctx.db
      .query("issueUpdates")
      .withIndex("by_dedupe_key", (q) => q.eq("dedupeKey", dedupeKey))
      .first();
    if (!existingUpdate) {
      await ctx.db.insert("issueUpdates", {
        orgId: conversation.orgId,
        issueId: newIssueId,
        kind: "created_from_call",
        dedupeKey,
        softDeleted: false,
      });
    }
  },
});

export { partialFieldsValidator };
