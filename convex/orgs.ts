import { v } from "convex/values";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  query,
} from "./_generated/server";
import {
  findMembership,
  findOrgByClerkId,
  findUserByClerkId,
  readOrgContext,
  requireUserAndOrg,
} from "./lib/auth";

const issueTypesValidator = v.array(
  v.object({
    key: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  }),
);

function isConvexRecordKey(key: string) {
  return key.length > 0 && /^[\x20-\x7E]+$/.test(key) && !/^[$_]/.test(key);
}

function requireAdmin(role: string) {
  if (role !== "org:admin" && role !== "admin") {
    throw new Error("Forbidden");
  }
}

function assertValidIssueTypes(issueTypes: typeof issueTypesValidator.type) {
  const seen = new Set<string>();
  for (const type of issueTypes) {
    if (!isConvexRecordKey(type.key)) {
      throw new Error(
        `Invalid issue type key "${type.key}". Keys must be non-empty ASCII strings and cannot start with "$" or "_".`,
      );
    }
    if (seen.has(type.key)) {
      throw new Error(`Duplicate issue type key "${type.key}".`);
    }
    seen.add(type.key);
  }
}

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const orgCtx = readOrgContext(identity);
    if (!orgCtx) return null;
    const org = await findOrgByClerkId(ctx, orgCtx.id);
    return org && !org.softDeleted ? org : null;
  },
});

export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const orgCtx = readOrgContext(identity);
    return orgCtx?.rol ?? null;
  },
});

export const getCurrentMembership = query({
  args: {},
  handler: async (ctx) => {
    const { user, org } = await requireUserAndOrg(ctx);
    return await findMembership(ctx, user._id, org._id);
  },
});

export const updateIssueTypes = mutation({
  args: {
    issueTypes: issueTypesValidator,
  },
  handler: async (ctx, { issueTypes }) => {
    const { org, orgCtx } = await requireUserAndOrg(ctx);
    requireAdmin(orgCtx.rol);
    assertValidIssueTypes(issueTypes);
    await ctx.db.patch(org._id, { issueTypes });
  },
});

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.union(v.string(), v.null()),
    slug: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const existing = await findOrgByClerkId(ctx, args.clerkId);
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, softDeleted: false });
      return existing._id;
    }
    return await ctx.db.insert("orgs", { ...args, softDeleted: false });
  },
});

export const softDeleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const existing = await findOrgByClerkId(ctx, clerkId);
    if (!existing) return;
    await ctx.db.patch(existing._id, { softDeleted: true });
  },
});

async function resolveMembership(
  ctx: MutationCtx,
  clerkUserId: string,
  clerkOrgId: string,
) {
  const user = await findUserByClerkId(ctx, clerkUserId);
  const org = await findOrgByClerkId(ctx, clerkOrgId);
  if (!user || !org) return null;
  const membership = await findMembership(ctx, user._id, org._id);
  return { user, org, membership };
}

export const upsertMembershipFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, { clerkUserId, clerkOrgId, role }) => {
    const resolved = await resolveMembership(ctx, clerkUserId, clerkOrgId);
    if (!resolved) {
      console.warn(
        `Skipping membership upsert; user or org not yet synced (user=${clerkUserId}, org=${clerkOrgId})`,
      );
      return;
    }
    const { user, org, membership } = resolved;
    if (membership) {
      if (membership.role !== role)
        await ctx.db.patch(membership._id, { role });
      return membership._id;
    }
    return await ctx.db.insert("memberships", {
      userId: user._id,
      orgId: org._id,
      role,
    });
  },
});

export const deleteMembershipFromClerk = internalMutation({
  args: { clerkUserId: v.string(), clerkOrgId: v.string() },
  handler: async (ctx, { clerkUserId, clerkOrgId }) => {
    const resolved = await resolveMembership(ctx, clerkUserId, clerkOrgId);
    if (!resolved?.membership) return;
    await ctx.db.delete(resolved.membership._id);
  },
});
