import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { requireUserAndOrg } from "./lib/auth";

export const STATUSES = [
  "new",
  "in-progress",
  "contractor-scheduled",
  "awaiting-follow-up",
  "closed",
] as const;

const statusValidator = v.union(
  v.literal("new"),
  v.literal("in-progress"),
  v.literal("contractor-scheduled"),
  v.literal("awaiting-follow-up"),
  v.literal("closed"),
);

type Status = (typeof STATUSES)[number];

const generatedSummaryValidator = v.object({
  cardSummary: v.string(),
  issue: v.union(v.string(), v.null()),
  symptoms: v.union(v.string(), v.null()),
  severitySignals: v.union(v.string(), v.null()),
  notes: v.union(v.string(), v.null()),
});

async function issueWithDetails(
  ctx: QueryCtx,
  issue: Doc<"issues">,
  viewerUserId: Doc<"users">["_id"],
) {
  const primaryConversation = await ctx.db.get(issue.primaryConversationId);
  const timeline = await ctx.db
    .query("issueUpdates")
    .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
    .order("asc")
    .take(100);
  const filteredTimeline = timeline.filter((t) => !t.softDeleted);
  const authorCache = new Map<Doc<"users">["_id"], Doc<"users"> | null>();
  const hydratedTimeline = await Promise.all(
    filteredTimeline.map(async (item) => {
      if (!item.authorUserId) {
        return { ...item, author: null, canManage: false };
      }
      let author = authorCache.get(item.authorUserId);
      if (author === undefined) {
        author = await ctx.db.get(item.authorUserId);
        authorCache.set(item.authorUserId, author);
      }
      return {
        ...item,
        author,
        canManage:
          item.kind === "comment" && item.authorUserId === viewerUserId,
      };
    }),
  );
  return {
    ...issue,
    publicId: issue.publicId ?? issue._id,
    primaryConversation,
    timeline: hydratedTimeline,
  };
}

export const listByStatus = query({
  args: { limitPerStatus: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { org } = await requireUserAndOrg(ctx);
    const limitPerStatus = Math.min(args.limitPerStatus ?? 100, 200);
    const grouped: Record<
      Status,
      Array<Doc<"issues"> & { publicId: string }>
    > = {
      new: [],
      "in-progress": [],
      "contractor-scheduled": [],
      "awaiting-follow-up": [],
      closed: [],
    };
    for (const status of STATUSES) {
      const rows = await ctx.db
        .query("issues")
        .withIndex("by_org_and_status", (q) =>
          q.eq("orgId", org._id).eq("status", status),
        )
        .order("desc")
        .take(limitPerStatus);
      grouped[status] = rows
        .filter((issue) => !issue.softDeleted)
        .map((issue) => ({
          ...issue,
          publicId: issue.publicId ?? issue._id,
        }));
    }
    return grouped;
  },
});

export const get = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.id);
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      throw new Error("Not found");
    }
    return await issueWithDetails(ctx, issue, user._id);
  },
});

export const getByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    let issue = await ctx.db
      .query("issues")
      .withIndex("by_org_and_public_id", (q) =>
        q.eq("orgId", org._id).eq("publicId", args.publicId),
      )
      .unique();
    if (!issue) {
      const legacyId = ctx.db.normalizeId("issues", args.publicId);
      issue = legacyId ? await ctx.db.get(legacyId) : null;
    }
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      return null;
    }
    return await issueWithDetails(ctx, issue, user._id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("issues"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.id);
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      throw new Error("Not found");
    }
    if (issue.status === args.status) return;
    const previous = issue.status;
    await ctx.db.patch(args.id, { status: args.status });
    await ctx.db.insert("issueUpdates", {
      orgId: org._id,
      issueId: args.id,
      kind: "status_change",
      authorUserId: user._id,
      metadata: { from: previous, to: args.status },
      dedupeKey: null,
      softDeleted: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("issues"),
    address: v.optional(v.union(v.string(), v.null())),
    contactName: v.optional(v.union(v.string(), v.null())),
    contactPhone: v.optional(v.union(v.string(), v.null())),
    contactEmail: v.optional(v.union(v.string(), v.null())),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.id);
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      throw new Error("Not found");
    }

    const patch: Partial<Doc<"issues">> = {};
    if (args.address !== undefined) patch.address = args.address;
    if (args.contactName !== undefined) patch.contactName = args.contactName;
    if (args.contactPhone !== undefined) patch.contactPhone = args.contactPhone;
    if (args.contactEmail !== undefined) patch.contactEmail = args.contactEmail;
    if (args.summary !== undefined) patch.summary = args.summary;
    await ctx.db.patch(args.id, patch);
  },
});

export const getForSummaryGeneration = internalQuery({
  args: { issueId: v.id("issues") },
  handler: async (ctx, { issueId }) => {
    const issue = await ctx.db.get(issueId);
    if (!issue || issue.softDeleted) return null;
    if (issue.summaryStatus === "llm-generated") return null;
    const conversation = await ctx.db.get(issue.primaryConversationId);
    if (!conversation || conversation.softDeleted) return null;
    return { issue, conversation };
  },
});

export const bumpSummaryGenerationAttempt = internalMutation({
  args: { issueId: v.id("issues") },
  returns: v.number(),
  handler: async (ctx, { issueId }) => {
    const issue = await ctx.db.get(issueId);
    if (!issue) throw new Error("Issue not found");
    const next = (issue.summaryAttempts ?? 0) + 1;
    await ctx.db.patch(issueId, {
      summaryAttempts: next,
      summaryStatus: "pending",
    });
    return next;
  },
});

export const applyGeneratedSummary = internalMutation({
  args: {
    issueId: v.id("issues"),
    summary: generatedSummaryValidator,
  },
  handler: async (ctx, { issueId, summary }) => {
    const issue = await ctx.db.get(issueId);
    if (!issue) throw new Error("Issue not found");

    const patch: Partial<Doc<"issues">> = {
      brief: {
        issue: summary.issue,
        symptoms: summary.symptoms,
        severitySignals: summary.severitySignals,
        notes: summary.notes,
      },
      summaryStatus: "llm-generated",
      lastSummaryError: undefined,
      summary: summary.cardSummary,
    };

    await ctx.db.patch(issueId, patch);
  },
});

export const recordSummaryGenerationError = internalMutation({
  args: {
    issueId: v.id("issues"),
    error: v.string(),
  },
  returns: v.object({
    capped: v.boolean(),
    attempts: v.number(),
  }),
  handler: async (ctx, { issueId, error }) => {
    const issue = await ctx.db.get(issueId);
    if (!issue) throw new Error("Issue not found");
    const attempts = issue.summaryAttempts ?? 0;
    const capped = attempts >= 3;
    await ctx.db.patch(issueId, {
      lastSummaryError: error,
      summaryStatus: capped ? "failed" : issue.summaryStatus,
    });
    return { capped, attempts };
  },
});
