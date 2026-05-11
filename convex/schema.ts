import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.union(v.string(), v.null()),
    lastName: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    softDeleted: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  orgs: defineTable({
    clerkId: v.string(),
    name: v.union(v.string(), v.null()),
    slug: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    issueTypes: v.optional(
      v.array(
        v.object({
          key: v.string(),
          label: v.string(),
          description: v.optional(v.string()),
          color: v.optional(v.string()),
        }),
      ),
    ),
    softDeleted: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_slug", ["slug"]),

  memberships: defineTable({
    userId: v.id("users"),
    orgId: v.id("orgs"),
    role: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_user_and_org", ["userId", "orgId"]),

  // Kept as JSON-like config for now so agent-specific call processing can
  // evolve before we commit to a form-builder schema.
  agents: defineTable({
    orgId: v.id("orgs"),
    elevenlabsAgentId: v.string(),
    name: v.string(),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    issueConfig: v.optional(
      v.object({
        issueCreationCriteria: v.string(),
        issueTypeGuidance: v.optional(v.string()),
        allowedIssueTypes: v.array(v.string()),
        extractionFields: v.array(
          v.object({
            key: v.string(),
            label: v.string(),
            description: v.optional(v.string()),
          }),
        ),
      }),
    ),
    softDeleted: v.boolean(),
  })
    .index("by_org", ["orgId"])
    .index("by_elevenlabs_agent_id", ["elevenlabsAgentId"])
    .index("by_org_and_elevenlabs_agent_id", ["orgId", "elevenlabsAgentId"]),

  conversations: defineTable({
    orgId: v.id("orgs"),

    channel: v.string(),
    provider: v.string(),
    providerEventType: v.string(),
    providerStatus: v.string(),
    providerConversationId: v.union(v.string(), v.null()),
    providerDedupeKey: v.string(),

    occurredAtUnixSecs: v.number(),

    subject: v.union(v.string(), v.null()),
    bodyText: v.union(v.string(), v.null()),
    messages: v.union(
      v.array(
        v.object({
          role: v.string(),
          body: v.string(),
          senderName: v.union(v.string(), v.null()),
          occurredAtUnixSecs: v.union(v.number(), v.null()),
          timeInCallSecs: v.union(v.number(), v.null()),
        }),
      ),
      v.null(),
    ),

    callAgentId: v.union(v.id("agents"), v.null()),
    callFromNumber: v.union(v.string(), v.null()),
    callToNumber: v.union(v.string(), v.null()),
    callDurationSecs: v.union(v.number(), v.null()),
    callSuccessful: v.union(
      v.literal("success"),
      v.literal("failure"),
      v.literal("unknown"),
      v.null(),
    ),

    acceptanceResult: v.optional(
      v.object({
        shouldCreateIssue: v.boolean(),
        reason: v.union(v.string(), v.null()),
        issueTypes: v.array(v.string()),
        confidence: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
        ),
      }),
    ),
    extractionResults: v.optional(
      v.object({
        fields: v.record(
          v.string(),
          v.union(v.string(), v.number(), v.boolean(), v.null()),
        ),
        notes: v.union(v.string(), v.null()),
      }),
    ),
    extractionStatus: v.union(
      v.literal("not-applicable"),
      v.literal("pending"),
      v.literal("elevenlabs-only"),
      v.literal("llm-filled"),
      v.literal("failed"),
    ),
    extractionAttempts: v.number(),
    lastExtractionError: v.optional(v.string()),

    webhookReceivedAt: v.number(),
    rawWebhookStorageId: v.optional(v.id("_storage")),

    softDeleted: v.boolean(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_occurred_at", ["orgId", "occurredAtUnixSecs"])
    .index("by_org_sd_time", ["orgId", "softDeleted", "occurredAtUnixSecs"])
    .index("by_org_and_channel_and_occurred_at", [
      "orgId",
      "channel",
      "occurredAtUnixSecs",
    ])
    .index("by_org_sd_channel_time", [
      "orgId",
      "softDeleted",
      "channel",
      "occurredAtUnixSecs",
    ])
    .index("by_org_sd_agent_time", [
      "orgId",
      "softDeleted",
      "callAgentId",
      "occurredAtUnixSecs",
    ])
    .index("by_org_sd_outcome_time", [
      "orgId",
      "softDeleted",
      "callSuccessful",
      "occurredAtUnixSecs",
    ])
    .index("by_org_sd_channel_agent_time", [
      "orgId",
      "softDeleted",
      "channel",
      "callAgentId",
      "occurredAtUnixSecs",
    ])
    .index("by_org_sd_channel_outcome_time", [
      "orgId",
      "softDeleted",
      "channel",
      "callSuccessful",
      "occurredAtUnixSecs",
    ])
    .index("by_org_sd_agent_outcome_time", [
      "orgId",
      "softDeleted",
      "callAgentId",
      "callSuccessful",
      "occurredAtUnixSecs",
    ])
    .index("by_org_sd_channel_agent_outcome_time", [
      "orgId",
      "softDeleted",
      "channel",
      "callAgentId",
      "callSuccessful",
      "occurredAtUnixSecs",
    ])
    .index("by_provider_and_dedupe_key", ["provider", "providerDedupeKey"])
    .index("by_call_agent", ["callAgentId"]),

  issues: defineTable({
    orgId: v.id("orgs"),
    publicId: v.optional(v.string()),
    primaryConversationId: v.id("conversations"),
    callAgentId: v.optional(v.union(v.id("agents"), v.null())),
    status: v.union(
      v.literal("new"),
      v.literal("in-progress"),
      v.literal("scheduled"),
      v.literal("awaiting-follow-up"),
      v.literal("closed"),
    ),
    boardPosition: v.optional(v.number()),
    source: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("chat"),
      v.literal("manual"),
    ),
    types: v.optional(v.array(v.string())),
    address: v.union(v.string(), v.null()),
    contactName: v.union(v.string(), v.null()),
    contactPhone: v.union(v.string(), v.null()),
    contactEmail: v.union(v.string(), v.null()),
    assigneeUserId: v.optional(v.union(v.id("users"), v.null())),
    summary: v.string(),
    brief: v.optional(
      v.object({
        issueTitle: v.union(v.string(), v.null()),
        details: v.union(v.string(), v.null()),
      }),
    ),
    acceptanceResult: v.optional(
      v.object({
        shouldCreateIssue: v.boolean(),
        reason: v.union(v.string(), v.null()),
        issueTypes: v.array(v.string()),
        confidence: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
        ),
      }),
    ),
    extractionResults: v.optional(
      v.object({
        fields: v.record(
          v.string(),
          v.union(v.string(), v.number(), v.boolean(), v.null()),
        ),
        notes: v.union(v.string(), v.null()),
      }),
    ),
    summaryStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("llm-generated"),
        v.literal("failed"),
      ),
    ),
    summaryAttempts: v.optional(v.number()),
    lastSummaryError: v.optional(v.string()),
    softDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_org", ["orgId"])
    .index("by_org_and_status", ["orgId", "status"])
    .index("by_org_and_softDeleted", ["orgId", "softDeleted"])
    .index("by_org_and_softDeleted_and_deletedAt", [
      "orgId",
      "softDeleted",
      "deletedAt",
    ])
    .index("by_org_and_status_and_softDeleted", [
      "orgId",
      "status",
      "softDeleted",
    ])
    .index("by_org_and_public_id", ["orgId", "publicId"])
    .index("by_org_and_call_agent", ["orgId", "callAgentId"])
    .index("by_primary_conversation", ["primaryConversationId"]),

  issueUpdates: defineTable({
    orgId: v.id("orgs"),
    issueId: v.id("issues"),
    kind: v.union(
      v.literal("comment"),
      v.literal("status_change"),
      v.literal("assignee_change"),
      v.literal("created_from_call"),
      v.literal("issue_deleted"),
      v.literal("issue_restored"),
    ),
    authorUserId: v.optional(v.id("users")),
    body: v.optional(v.string()),
    metadata: v.optional(v.any()),
    editedAt: v.optional(v.number()),
    dedupeKey: v.union(v.string(), v.null()),
    softDeleted: v.boolean(),
  })
    .index("by_issue", ["issueId"])
    .index("by_org", ["orgId"])
    .index("by_dedupe_key", ["dedupeKey"]),

  webhookEvents: defineTable({
    provider: v.string(),
    eventType: v.string(),
    providerConversationId: v.union(v.string(), v.null()),
    orgId: v.union(v.id("orgs"), v.null()),
    status: v.union(v.literal("ignored"), v.literal("error")),
    errorMessage: v.string(),
    rawPayloadStorageId: v.optional(v.id("_storage")),
  })
    .index("by_provider_conversation_id", ["providerConversationId"])
    .index("by_status", ["status"]),
});
