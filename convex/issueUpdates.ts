import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUserAndOrg } from "./lib/auth";

export const addComment = mutation({
  args: {
    issueId: v.id("issues"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      throw new Error("Not found");
    }
    const trimmed = args.body.trim();
    if (trimmed.length === 0) throw new Error("Empty comment");
    await ctx.db.insert("issueUpdates", {
      orgId: org._id,
      issueId: args.issueId,
      kind: "comment",
      authorUserId: user._id,
      body: trimmed,
      dedupeKey: null,
      softDeleted: false,
    });
  },
});

export const editComment = mutation({
  args: {
    issueUpdateId: v.id("issueUpdates"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const update = await ctx.db.get(args.issueUpdateId);
    if (
      !update ||
      update.orgId !== org._id ||
      update.softDeleted ||
      update.kind !== "comment" ||
      update.authorUserId !== user._id
    ) {
      throw new Error("Not found");
    }
    const trimmed = args.body.trim();
    if (trimmed.length === 0) throw new Error("Empty comment");
    await ctx.db.patch(args.issueUpdateId, {
      body: trimmed,
      editedAt: Date.now(),
    });
  },
});

export const deleteComment = mutation({
  args: {
    issueUpdateId: v.id("issueUpdates"),
  },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const update = await ctx.db.get(args.issueUpdateId);
    if (
      !update ||
      update.orgId !== org._id ||
      update.softDeleted ||
      update.kind !== "comment" ||
      update.authorUserId !== user._id
    ) {
      throw new Error("Not found");
    }
    await ctx.db.patch(args.issueUpdateId, {
      softDeleted: true,
      editedAt: Date.now(),
    });
  },
});
