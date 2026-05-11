import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  BUILT_IN_EXTRACTION_KEYS,
  DEFAULT_AGENT_ISSUE_CONFIG,
  DEFAULT_ISSUE_TYPES,
} from "./extraction/schema";
import { readBuzzStaffRole, requireBuzzAdmin } from "./lib/auth";

const issueTypeValidator = v.object({
  key: v.string(),
  label: v.string(),
  color: v.optional(v.string()),
});

const extractionFieldValidator = v.object({
  key: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
});

const agentIssueConfigValidator = v.object({
  issueCreationCriteria: v.string(),
  issueTypeGuidance: v.optional(v.string()),
  allowedIssueTypes: v.array(v.string()),
  extractionFields: v.array(extractionFieldValidator),
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

function normalizeIssueConfig(
  config: typeof agentIssueConfigValidator.type,
): typeof agentIssueConfigValidator.type {
  const allowed: string[] = [];
  const seenAllowed = new Set<string>();
  for (const raw of config.allowedIssueTypes) {
    const key = raw.trim();
    if (!key || seenAllowed.has(key)) continue;
    if (!isConvexRecordKey(key)) {
      throw new Error(
        `Invalid allowed issue type "${key}". Keys must be non-empty ASCII strings and cannot start with "$" or "_".`,
      );
    }
    seenAllowed.add(key);
    allowed.push(key);
  }

  const fields: (typeof extractionFieldValidator.type)[] = [];
  const seenFields = new Set<string>();
  for (const raw of config.extractionFields) {
    const key = raw.key.trim();
    const label = raw.label.trim();
    if (!key && !label) continue;
    if (!isConvexRecordKey(key)) {
      throw new Error(
        `Invalid extraction field key "${key}". Keys must be non-empty ASCII strings and cannot start with "$" or "_".`,
      );
    }
    if (!label) {
      throw new Error(`Extraction field "${key}" needs a label`);
    }
    if (seenFields.has(key)) {
      throw new Error(`Duplicate extraction field key "${key}"`);
    }
    seenFields.add(key);
    const description = raw.description?.trim();
    fields.push({
      key,
      label,
      description: description ? description : undefined,
    });
  }

  // Built-in keys must remain present — they back the issue-column mapping
  // in createIssueFromConversation. If the admin's submitted config drops
  // one, re-insert it from the default config rather than rejecting the
  // save outright.
  for (const builtInKey of BUILT_IN_EXTRACTION_KEYS) {
    if (seenFields.has(builtInKey)) continue;
    const defaultEntry = DEFAULT_AGENT_ISSUE_CONFIG.extractionFields.find(
      (f) => f.key === builtInKey,
    );
    if (!defaultEntry) continue;
    fields.push(defaultEntry);
    seenFields.add(builtInKey);
  }

  return {
    issueCreationCriteria: config.issueCreationCriteria.trim(),
    issueTypeGuidance: config.issueTypeGuidance?.trim() || undefined,
    allowedIssueTypes: allowed,
    extractionFields: fields,
  };
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

    const agentsByOrg = new Map<string, number>();
    for (const agent of agents) {
      if (agent.softDeleted) continue;
      agentsByOrg.set(agent.orgId, (agentsByOrg.get(agent.orgId) ?? 0) + 1);
    }

    return {
      role,
      counts: [
        { table: "users", count: users.length },
        { table: "orgs", count: orgs.length },
        { table: "agents", count: agents.length },
        { table: "issues", count: issues.length },
      ],
      orgs: activeOrgs.map((org) => ({
        _id: org._id,
        name: org.name,
        slug: org.slug,
        clerkId: org.clerkId,
        imageUrl: org.imageUrl,
        agentCount: agentsByOrg.get(org._id) ?? 0,
        issueTypeCount: org.issueTypes?.length ?? 0,
      })),
    };
  },
});

export const org = query({
  args: { orgId: v.id("orgs") },
  handler: async (ctx, { orgId }) => {
    await requireBuzzAdmin(ctx);
    const org = await ctx.db.get(orgId);
    if (!org || org.softDeleted) return null;

    const agents = await ctx.db
      .query("agents")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    return {
      org,
      agents: agents
        .filter((agent) => !agent.softDeleted)
        .sort((a, b) => a.name.localeCompare(b.name)),
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

export const moveIssueType = mutation({
  args: {
    orgId: v.id("orgs"),
    key: v.string(),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, { orgId, key, direction }) => {
    await requireBuzzAdmin(ctx);
    const org = await ctx.db.get(orgId);
    if (!org || org.softDeleted) throw new Error("Org not found");

    const issueTypes = org.issueTypes ?? [];
    const index = issueTypes.findIndex((type) => type.key === key);
    if (index === -1) throw new Error(`Issue type "${key}" not found`);

    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= issueTypes.length) return;

    const next = [...issueTypes];
    const a = next[index];
    const b = next[swapWith];
    if (!a || !b) return;
    next[index] = b;
    next[swapWith] = a;
    await ctx.db.patch(orgId, { issueTypes: next });
  },
});

export const updateIssueType = mutation({
  args: {
    orgId: v.id("orgs"),
    key: v.string(),
    label: v.optional(v.string()),
    color: v.optional(v.string()),
    newKey: v.optional(v.string()),
  },
  handler: async (ctx, { orgId, key, label, color, newKey }) => {
    await requireBuzzAdmin(ctx);
    const org = await ctx.db.get(orgId);
    if (!org || org.softDeleted) throw new Error("Org not found");

    const issueTypes = org.issueTypes ?? [];
    const index = issueTypes.findIndex((type) => type.key === key);
    const current = index >= 0 ? issueTypes[index] : undefined;
    if (!current) throw new Error(`Issue type "${key}" not found`);

    const nextKey = newKey?.trim() || current.key;
    const nextLabel = label?.trim() || current.label;
    const nextColor =
      color !== undefined ? color.trim() || undefined : current.color;

    const next = { key: nextKey, label: nextLabel, color: nextColor };
    assertValidIssueType(next);

    if (
      nextKey !== current.key &&
      issueTypes.some((type, i) => i !== index && type.key === nextKey)
    ) {
      throw new Error(`Issue type "${nextKey}" already exists`);
    }

    const updated = [...issueTypes];
    updated[index] = next;
    await ctx.db.patch(orgId, { issueTypes: updated });

    if (nextKey !== current.key) {
      const agents = await ctx.db
        .query("agents")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
      for (const agent of agents) {
        if (!agent.issueConfig?.allowedIssueTypes.includes(current.key))
          continue;
        await ctx.db.patch(agent._id, {
          issueConfig: {
            ...agent.issueConfig,
            allowedIssueTypes: agent.issueConfig.allowedIssueTypes.map(
              (typeKey) => (typeKey === current.key ? nextKey : typeKey),
            ),
          },
        });
      }
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

    const allowedIssueTypes =
      org.issueTypes && org.issueTypes.length > 0
        ? org.issueTypes.map((type) => type.key)
        : DEFAULT_ISSUE_TYPES.map((type) => type.key);

    return await ctx.db.insert("agents", {
      orgId: args.orgId,
      name: args.name.trim(),
      elevenlabsAgentId: args.elevenlabsAgentId.trim(),
      issueConfig: {
        ...DEFAULT_AGENT_ISSUE_CONFIG,
        allowedIssueTypes,
      },
      softDeleted: false,
    });
  },
});

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    elevenlabsAgentId: v.optional(v.string()),
    issueConfig: v.optional(v.union(agentIssueConfigValidator, v.null())),
  },
  handler: async (ctx, { agentId, name, elevenlabsAgentId, issueConfig }) => {
    await requireBuzzAdmin(ctx);
    const agent = await ctx.db.get(agentId);
    if (!agent || agent.softDeleted) throw new Error("Agent not found");

    const patch: Partial<typeof agent> = {};

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Agent name is required");
      patch.name = trimmed;
    }

    if (elevenlabsAgentId !== undefined) {
      const trimmed = elevenlabsAgentId.trim();
      if (!trimmed) throw new Error("ElevenLabs agent id is required");
      if (trimmed !== agent.elevenlabsAgentId) {
        const conflict = await ctx.db
          .query("agents")
          .withIndex("by_elevenlabs_agent_id", (q) =>
            q.eq("elevenlabsAgentId", trimmed),
          )
          .filter((q) => q.eq(q.field("softDeleted"), false))
          .collect();
        if (conflict.some((row) => row._id !== agentId)) {
          throw new Error(
            "An agent with this ElevenLabs agent id already exists",
          );
        }
      }
      patch.elevenlabsAgentId = trimmed;
    }

    if (issueConfig !== undefined) {
      patch.issueConfig =
        issueConfig === null ? undefined : normalizeIssueConfig(issueConfig);
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(agentId, patch);
    }
  },
});

export const deleteAgent = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, { agentId }) => {
    await requireBuzzAdmin(ctx);
    const agent = await ctx.db.get(agentId);
    if (!agent) throw new Error("Agent not found");
    await ctx.db.patch(agentId, { softDeleted: true });
  },
});
