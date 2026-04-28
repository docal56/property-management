import { v } from "convex/values";
import { internalMutation, type MutationCtx, query } from "./_generated/server";
import {
  findMembership,
  findOrgByClerkId,
  findUserByClerkId,
  readOrgContext,
  requireUserAndOrg,
} from "./lib/auth";

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
