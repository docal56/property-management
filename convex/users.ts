import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  ensureMembership,
  ensureOrgFromToken,
  ensureUserFromIdentity,
  findUserByClerkId,
  readOrgContext,
} from "./lib/auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await findUserByClerkId(ctx, identity.subject);
    return user && !user.softDeleted ? user : null;
  },
});

export const getMyOrgs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await findUserByClerkId(ctx, identity.subject);
    if (!user || user.softDeleted) return [];

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const rows = await Promise.all(
      memberships.map(async (m) => {
        const org = await ctx.db.get(m.orgId);
        return { membership: m, org };
      }),
    );
    return rows.filter(({ org }) => org && !org.softDeleted);
  },
});

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = await ensureUserFromIdentity(ctx, identity);

    const orgCtx = readOrgContext(identity);
    if (orgCtx) {
      const orgId = await ensureOrgFromToken(ctx, orgCtx);
      await ensureMembership(ctx, userId, orgId, orgCtx.rol);
    }

    return userId;
  },
});

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.union(v.string(), v.null()),
    lastName: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const existing = await findUserByClerkId(ctx, args.clerkId);
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, softDeleted: false });
      return existing._id;
    }
    return await ctx.db.insert("users", { ...args, softDeleted: false });
  },
});

export const softDeleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const existing = await findUserByClerkId(ctx, clerkId);
    if (!existing) return;
    await ctx.db.patch(existing._id, { softDeleted: true });
  },
});
