import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { readBuzzStaffRole, requireBuzzAdmin } from "./lib/auth";

const issueTypeValidator = v.object({
  key: v.string(),
  label: v.string(),
  color: v.optional(v.string()),
});

function isConvexRecordKey(key: string) {
  return key.length > 0 && /^[\x20-\x7E]+$/.test(key) && !/^[$_]/.test(key);
}

function assertValidIssueType(type: typeof issueTypeValidator.type) {
  if (!isConvexRecordKey(type.key)) {
    throw new Error(
      `Invalid issue type key "${type.key}". Keys must be non-empty ASCII strings and cannot start with "$" or "_".`,
    );
  }
  if (!type.label.trim()) throw new Error("Issue type label is required");
}

function assertValidAgentInput(args: {
  name: string;
  elevenlabsAgentId: string;
}) {
  if (!args.name.trim()) throw new Error("Agent name is required");
  if (!args.elevenlabsAgentId.trim()) {
    throw new Error("ElevenLabs agent id is required");
  }
}

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isAdmin: false,
        role: null,
      };
    }
    const role = readBuzzStaffRole(identity);
    return {
      isAdmin: role !== null,
      role,
    };
  },
});

export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    const { role } = await requireBuzzAdmin(ctx);

    // POC only: keep this list small and low-volume. For larger admin metrics,
    // use cached snapshots or maintained counters instead of full-table collects.
    const [users, orgs, agents, issues] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("orgs").collect(),
      ctx.db.query("agents").collect(),
      ctx.db.query("issues").collect(),
    ]);

    const activeOrgs = orgs
      .filter((org) => !org.softDeleted)
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

    return {
      role,
      counts: [
        { table: "users", count: users.length },
        { table: "orgs", count: orgs.length },
        { table: "agents", count: agents.length },
        { table: "issues", count: issues.length },
      ],
      orgs: activeOrgs.map((org) => ({
        org,
        agents: agents
          .filter((agent) => agent.orgId === org._id && !agent.softDeleted)
          .sort((a, b) => a.name.localeCompare(b.name)),
      })),
    };
  },
});

export const addIssueType = mutation({
  args: {
    orgId: v.id("orgs"),
    issueType: issueTypeValidator,
  },
  handler: async (ctx, { orgId, issueType }) => {
    await requireBuzzAdmin(ctx);
    const org = await ctx.db.get(orgId);
    if (!org || org.softDeleted) throw new Error("Org not found");

    const nextType = {
      key: issueType.key.trim(),
      label: issueType.label.trim(),
      color: issueType.color?.trim() || undefined,
    };
    assertValidIssueType(nextType);

    const issueTypes = org.issueTypes ?? [];
    if (issueTypes.some((type) => type.key === nextType.key)) {
      throw new Error(`Issue type "${nextType.key}" already exists`);
    }

    await ctx.db.patch(orgId, {
      issueTypes: [...issueTypes, nextType],
    });
  },
});

export const deleteIssueType = mutation({
  args: {
    orgId: v.id("orgs"),
    key: v.string(),
  },
  handler: async (ctx, { orgId, key }) => {
    await requireBuzzAdmin(ctx);
    const org = await ctx.db.get(orgId);
    if (!org || org.softDeleted) throw new Error("Org not found");

    const nextIssueTypes = (org.issueTypes ?? []).filter(
      (type) => type.key !== key,
    );
    await ctx.db.patch(orgId, { issueTypes: nextIssueTypes });

    const agents = await ctx.db
      .query("agents")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();
    for (const agent of agents) {
      if (!agent.issueConfig?.allowedIssueTypes.includes(key)) continue;
      await ctx.db.patch(agent._id, {
        issueConfig: {
          ...agent.issueConfig,
          allowedIssueTypes: agent.issueConfig.allowedIssueTypes.filter(
            (typeKey) => typeKey !== key,
          ),
        },
      });
    }
  },
});

export const createAgent = mutation({
  args: {
    orgId: v.id("orgs"),
    name: v.string(),
    elevenlabsAgentId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireBuzzAdmin(ctx);
    assertValidAgentInput(args);

    const org = await ctx.db.get(args.orgId);
    if (!org || org.softDeleted) throw new Error("Org not found");

    const existing = await ctx.db
      .query("agents")
      .withIndex("by_elevenlabs_agent_id", (q) =>
        q.eq("elevenlabsAgentId", args.elevenlabsAgentId.trim()),
      )
      .filter((q) => q.eq(q.field("softDeleted"), false))
      .collect();
    if (existing.length > 0) {
      throw new Error("An agent with this ElevenLabs agent id already exists");
    }

    return await ctx.db.insert("agents", {
      orgId: args.orgId,
      name: args.name.trim(),
      elevenlabsAgentId: args.elevenlabsAgentId.trim(),
      softDeleted: false,
    });
  },
});
