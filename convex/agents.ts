import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { requireUserAndOrg } from "./lib/auth";

const processingProfileValidator = v.object({
  acceptanceCriteria: v.string(),
  acceptedIntents: v.array(v.string()),
  extractionFields: v.array(
    v.object({
      key: v.string(),
      label: v.string(),
      description: v.optional(v.string()),
    }),
  ),
});

function isConvexRecordKey(key: string) {
  return key.length > 0 && /^[\x20-\x7E]+$/.test(key) && !/^[$_]/.test(key);
}

function assertValidProcessingProfile(
  profile: typeof processingProfileValidator.type | undefined,
) {
  if (!profile) return;
  for (const intent of profile.acceptedIntents) {
    if (!isConvexRecordKey(intent)) {
      throw new Error(
        `Invalid accepted intent "${intent}". Keys must be non-empty ASCII strings and cannot start with "$" or "_".`,
      );
    }
  }
  for (const field of profile.extractionFields) {
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
  externalId: string,
): Promise<Id<"agents"> | null> {
  const rows = await ctx.db
    .query("agents")
    .withIndex("by_elevenlabs_agent_id", (q) =>
      q.eq("elevenlabsAgentId", externalId),
    )
    .filter((q) => q.eq(q.field("softDeleted"), false))
    .collect();
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
    elevenlabsAgentId: v.string(),
    name: v.string(),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    processingProfile: v.optional(processingProfileValidator),
  },
  handler: async (ctx, args) => {
    const { org, orgCtx } = await requireUserAndOrg(ctx);
    requireAdmin(orgCtx.rol);

    const existingId = await findActiveByExternalId(
      ctx,
      args.elevenlabsAgentId,
    );
    if (existingId) {
      throw new Error("An agent with this elevenlabsAgentId already exists");
    }
    assertValidProcessingProfile(args.processingProfile);

    return await ctx.db.insert("agents", {
      orgId: org._id,
      elevenlabsAgentId: args.elevenlabsAgentId,
      name: args.name,
      department: args.department,
      phoneNumber: args.phoneNumber,
      processingProfile: args.processingProfile,
      softDeleted: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    processingProfile: v.optional(processingProfileValidator),
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
    if (args.department !== undefined) patch.department = args.department;
    if (args.phoneNumber !== undefined) patch.phoneNumber = args.phoneNumber;
    if (args.processingProfile !== undefined) {
      assertValidProcessingProfile(args.processingProfile);
      patch.processingProfile = args.processingProfile;
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
