import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { requireUserAndOrg } from "./lib/auth";

const issueConfigValidator = v.object({
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
});

const agentProviderValidator = v.union(
  v.literal("elevenlabs"),
  v.literal("vapi"),
);

type AgentProvider = typeof agentProviderValidator.type;

function isConvexRecordKey(key: string) {
  return key.length > 0 && /^[\x20-\x7E]+$/.test(key) && !/^[$_]/.test(key);
}

function assertValidAgentIssueConfig(
  config: typeof issueConfigValidator.type | undefined,
) {
  if (!config) return;
  for (const issueType of config.allowedIssueTypes) {
    if (!isConvexRecordKey(issueType)) {
      throw new Error(
        `Invalid allowed issue type "${issueType}". Keys must be non-empty ASCII strings and cannot start with "$" or "_".`,
      );
    }
  }
  for (const field of config.extractionFields) {
    if (!isConvexRecordKey(field.key)) {
      throw new Error(
        `Invalid extraction field key "${field.key}". Keys must be non-empty ASCII strings and cannot start with "$" or "_".`,
      );
    }
  }
}

function requireAdmin(role: string) {
  if (role !== "org:admin" && role !== "admin") {
    throw new Error("Forbidden");
  }
}

async function findActiveByExternalId(
  ctx: MutationCtx,
  provider: AgentProvider,
  externalId: string,
): Promise<Id<"agents"> | null> {
  const rows = await ctx.db
    .query("agents")
    .withIndex("by_provider_and_provider_agent_id", (q) =>
      q.eq("provider", provider).eq("providerAgentId", externalId),
    )
    .filter((q) => q.eq(q.field("softDeleted"), false))
    .collect();
  if (provider === "elevenlabs") {
    const legacyRows = await ctx.db
      .query("agents")
      .withIndex("by_elevenlabs_agent_id", (q) =>
        q.eq("elevenlabsAgentId", externalId),
      )
      .filter((q) => q.eq(q.field("softDeleted"), false))
      .collect();
    for (const row of legacyRows) {
      if (!rows.some((existing) => existing._id === row._id)) rows.push(row);
    }
  }
  const first = rows[0];
  return first ? first._id : null;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requireUserAndOrg(ctx);
    const rows = await ctx.db
      .query("agents")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();
    return rows
      .filter((r) => !r.softDeleted)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    provider: agentProviderValidator,
    providerAgentId: v.string(),
    name: v.string(),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    issueConfig: v.optional(issueConfigValidator),
  },
  handler: async (ctx, args) => {
    const { org, orgCtx } = await requireUserAndOrg(ctx);
    requireAdmin(orgCtx.rol);

    const providerAgentId = args.providerAgentId.trim();
    if (!providerAgentId) throw new Error("Provider agent id is required");

    const existingId = await findActiveByExternalId(
      ctx,
      args.provider,
      providerAgentId,
    );
    if (existingId) {
      throw new Error("An agent with this providerAgentId already exists");
    }
    assertValidAgentIssueConfig(args.issueConfig);

    return await ctx.db.insert("agents", {
      orgId: org._id,
      provider: args.provider,
      providerAgentId,
      elevenlabsAgentId:
        args.provider === "elevenlabs" ? providerAgentId : undefined,
      name: args.name,
      department: args.department,
      phoneNumber: args.phoneNumber,
      issueConfig: args.issueConfig,
      softDeleted: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    provider: v.optional(agentProviderValidator),
    providerAgentId: v.optional(v.string()),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    issueConfig: v.optional(issueConfigValidator),
  },
  handler: async (ctx, args) => {
    const { org, orgCtx } = await requireUserAndOrg(ctx);
    requireAdmin(orgCtx.rol);

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.orgId !== org._id || doc.softDeleted) {
      throw new Error("Not found");
    }

    const patch: Partial<typeof doc> = {};
    if (args.name !== undefined) patch.name = args.name;
    const currentProvider = doc.provider ?? "elevenlabs";
    const currentProviderAgentId =
      doc.providerAgentId ?? doc.elevenlabsAgentId ?? "";
    const nextProvider = args.provider ?? currentProvider;
    if (args.provider !== undefined) patch.provider = args.provider;
    if (args.providerAgentId !== undefined || args.provider !== undefined) {
      const nextProviderAgentId =
        args.providerAgentId !== undefined
          ? args.providerAgentId.trim()
          : currentProviderAgentId;
      if (!nextProviderAgentId)
        throw new Error("Provider agent id is required");
      if (
        nextProvider !== currentProvider ||
        nextProviderAgentId !== currentProviderAgentId
      ) {
        const existingId = await findActiveByExternalId(
          ctx,
          nextProvider,
          nextProviderAgentId,
        );
        if (existingId && existingId !== args.id) {
          throw new Error("An agent with this providerAgentId already exists");
        }
      }
      patch.providerAgentId = nextProviderAgentId;
      patch.elevenlabsAgentId =
        nextProvider === "elevenlabs" ? nextProviderAgentId : undefined;
    }
    if (args.department !== undefined) patch.department = args.department;
    if (args.phoneNumber !== undefined) patch.phoneNumber = args.phoneNumber;
    if (args.issueConfig !== undefined) {
      assertValidAgentIssueConfig(args.issueConfig);
      patch.issueConfig = args.issueConfig;
    }
    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const { org, orgCtx } = await requireUserAndOrg(ctx);
    requireAdmin(orgCtx.rol);

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.orgId !== org._id) throw new Error("Not found");
    await ctx.db.patch(args.id, { softDeleted: true });
  },
});
