import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { DEFAULT_AGENT_ISSUE_CONFIG } from "./extraction/schema";

type LegacyAcceptance = {
  shouldCreateIssue?: boolean;
  reason?: string | null;
  intents?: string[];
  issueTypes?: string[];
  confidence?: "low" | "medium" | "high";
};

type StoredAcceptance = {
  shouldCreateIssue: boolean;
  reason: string | null;
  issueTypes: string[];
  confidence: "low" | "medium" | "high";
};

type ExtractionField = {
  key: string;
  label: string;
  description?: string;
};

function normalizeAcceptance(value: LegacyAcceptance | undefined) {
  if (!value || typeof value !== "object") return value;
  const issueTypes = Array.isArray(value.issueTypes)
    ? value.issueTypes
    : Array.isArray(value.intents)
      ? value.intents
      : [];
  return {
    shouldCreateIssue: value.shouldCreateIssue ?? true,
    reason: value.reason ?? null,
    issueTypes,
    confidence: value.confidence ?? "medium",
  } satisfies StoredAcceptance;
}

function legacyAllowedIssueTypes(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const profile = value as {
    acceptedIntents?: unknown;
    intents?: unknown;
  };
  if (Array.isArray(profile.acceptedIntents)) {
    return profile.acceptedIntents.filter((item) => typeof item === "string");
  }
  if (Array.isArray(profile.intents)) {
    return profile.intents
      .map((item) =>
        item && typeof item === "object" && "key" in item
          ? (item as { key?: unknown }).key
          : item,
      )
      .filter((item) => typeof item === "string");
  }
  return [];
}

function legacyExtractionFields(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const fields = (value as { extractionFields?: unknown }).extractionFields;
  if (!Array.isArray(fields)) return [];
  return fields.filter(
    (field): field is ExtractionField =>
      field !== null &&
      typeof field === "object" &&
      typeof (field as ExtractionField).key === "string" &&
      typeof (field as ExtractionField).label === "string",
  );
}

export const inspectIssueConfigMigration = query({
  args: {},
  handler: async (ctx) => {
    const counts = {
      orgIssueConfig: 0,
      agentProcessingProfile: 0,
      conversationExtractedFields: 0,
      conversationIssueId: 0,
      conversationAcceptanceIntents: 0,
      issueExtractedFields: 0,
      issueAcceptanceIntents: 0,
    };

    for (const org of await ctx.db.query("orgs").collect()) {
      if ("issueConfig" in org) counts.orgIssueConfig += 1;
    }
    for (const agent of await ctx.db.query("agents").collect()) {
      if ("processingProfile" in agent) counts.agentProcessingProfile += 1;
    }
    for (const conversation of await ctx.db.query("conversations").collect()) {
      const row = conversation as typeof conversation & {
        acceptanceResult?: LegacyAcceptance;
        extractedFields?: unknown;
        issueId?: unknown;
      };
      if ("extractedFields" in row) counts.conversationExtractedFields += 1;
      if ("issueId" in row) counts.conversationIssueId += 1;
      if (row.acceptanceResult && "intents" in row.acceptanceResult) {
        counts.conversationAcceptanceIntents += 1;
      }
    }
    for (const issue of await ctx.db.query("issues").collect()) {
      const row = issue as typeof issue & {
        acceptanceResult?: LegacyAcceptance;
        extractedFields?: unknown;
      };
      if ("extractedFields" in row) counts.issueExtractedFields += 1;
      if (row.acceptanceResult && "intents" in row.acceptanceResult) {
        counts.issueAcceptanceIntents += 1;
      }
    }

    return counts;
  },
});

export const cleanupIssueConfigMigration = mutation({
  args: { confirm: v.literal("cleanup-issue-config-migration") },
  handler: async (ctx) => {
    const counts = {
      orgs: 0,
      agents: 0,
      conversations: 0,
      issues: 0,
    };

    for (const org of await ctx.db.query("orgs").collect()) {
      const legacyOrg = org as typeof org & {
        issueConfig?: { types?: unknown };
      };
      const patch: Partial<Doc<"orgs">> = {};
      if (!org.issueTypes && Array.isArray(legacyOrg.issueConfig?.types)) {
        patch.issueTypes = legacyOrg.issueConfig.types;
      }
      if ("issueConfig" in legacyOrg) patch.issueConfig = undefined;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(org._id, patch);
        counts.orgs += 1;
      }
    }

    for (const agent of await ctx.db.query("agents").collect()) {
      const legacyAgent = agent as typeof agent & {
        processingProfile?: unknown;
      };
      const patch: Partial<Doc<"agents">> = {};
      if (!agent.issueConfig && legacyAgent.processingProfile) {
        const profile = legacyAgent.processingProfile as {
          acceptanceCriteria?: unknown;
          issueCreationCriteria?: unknown;
        };
        const allowedIssueTypes = legacyAllowedIssueTypes(
          legacyAgent.processingProfile,
        );
        patch.issueConfig = {
          issueCreationCriteria:
            typeof profile.issueCreationCriteria === "string"
              ? profile.issueCreationCriteria
              : typeof profile.acceptanceCriteria === "string"
                ? profile.acceptanceCriteria
                : DEFAULT_AGENT_ISSUE_CONFIG.issueCreationCriteria,
          allowedIssueTypes:
            allowedIssueTypes.length > 0
              ? allowedIssueTypes
              : DEFAULT_AGENT_ISSUE_CONFIG.allowedIssueTypes,
          extractionFields: legacyExtractionFields(
            legacyAgent.processingProfile,
          ),
        };
      }
      if ("processingProfile" in legacyAgent)
        patch.processingProfile = undefined;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(agent._id, patch);
        counts.agents += 1;
      }
    }

    for (const conversation of await ctx.db.query("conversations").collect()) {
      const legacyConversation = conversation as typeof conversation & {
        acceptanceResult?: LegacyAcceptance;
        extractedFields?: {
          callerName?: string | null;
          address?: string | null;
          phoneNumber?: string | null;
          issueSummary?: string | null;
        };
        issueId?: unknown;
      };
      const patch: Partial<Doc<"conversations">> = {};
      const acceptance = normalizeAcceptance(
        legacyConversation.acceptanceResult,
      );
      if (acceptance !== legacyConversation.acceptanceResult) {
        patch.acceptanceResult = acceptance;
      }
      if (
        !conversation.extractionResults &&
        legacyConversation.extractedFields
      ) {
        patch.extractionResults = {
          fields: {
            name: legacyConversation.extractedFields.callerName ?? null,
            address: legacyConversation.extractedFields.address ?? null,
            phone: legacyConversation.extractedFields.phoneNumber ?? null,
          },
          notes: legacyConversation.extractedFields.issueSummary ?? null,
        };
      }
      if ("extractedFields" in legacyConversation) {
        patch.extractedFields = undefined;
      }
      if ("issueId" in legacyConversation) patch.issueId = undefined;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(conversation._id, patch);
        counts.conversations += 1;
      }
    }

    for (const issue of await ctx.db.query("issues").collect()) {
      const legacyIssue = issue as typeof issue & {
        acceptanceResult?: LegacyAcceptance;
        extractedFields?: unknown;
      };
      const patch: Partial<Doc<"issues">> = {};
      const acceptance = normalizeAcceptance(legacyIssue.acceptanceResult);
      if (acceptance !== legacyIssue.acceptanceResult) {
        patch.acceptanceResult = acceptance;
      }
      if ("extractedFields" in legacyIssue) patch.extractedFields = undefined;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(issue._id, patch);
        counts.issues += 1;
      }
    }

    return counts;
  },
});
