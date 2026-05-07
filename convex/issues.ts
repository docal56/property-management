import { v } from "convex/values";
import { internal } from "./_generated/api";
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
  "scheduled",
  "awaiting-follow-up",
  "closed",
] as const;

const statusValidator = v.union(
  v.literal("new"),
  v.literal("in-progress"),
  v.literal("scheduled"),
  v.literal("awaiting-follow-up"),
  v.literal("closed"),
);

const typeValidator = v.union(
  v.literal("rental"),
  v.literal("valuation"),
  v.literal("viewing"),
  v.literal("emergency"),
);

type Status = (typeof STATUSES)[number];
type IssueAssignee = Pick<
  Doc<"users">,
  "_id" | "firstName" | "lastName" | "email" | "imageUrl"
>;
type IssueListRow = Doc<"issues"> & {
  assignee: IssueAssignee | null;
  publicId: string;
};

const BOARD_POSITION_GAP = 1000;
const LEGACY_POSITION_BASE = 10_000_000_000_000;

const generatedSummaryValidator = v.object({
  types: v.array(typeValidator),
  cardSummary: v.string(),
  brief: v.object({
    issueTitle: v.union(v.string(), v.null()),
    details: v.union(v.string(), v.null()),
  }),
});

async function publicAssignee(
  ctx: QueryCtx,
  assigneeUserId: Doc<"users">["_id"] | null | undefined,
): Promise<IssueAssignee | null> {
  if (!assigneeUserId) return null;
  const user = await ctx.db.get(assigneeUserId);
  if (!user || user.softDeleted) return null;
  return {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    imageUrl: user.imageUrl,
    lastName: user.lastName,
  };
}

function assigneeDisplayName(assignee: IssueAssignee | null) {
  if (!assignee) return null;
  const name = [assignee.firstName, assignee.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || assignee.email;
}

function legacyBoardPosition(issue: Doc<"issues">) {
  return LEGACY_POSITION_BASE - issue._creationTime;
}

function issueBoardPosition(issue: Doc<"issues">) {
  return issue.boardPosition ?? legacyBoardPosition(issue);
}

function sortIssuesForBoard<T extends Doc<"issues">>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const positionDiff = issueBoardPosition(a) - issueBoardPosition(b);
    if (positionDiff !== 0) return positionDiff;
    return b._creationTime - a._creationTime;
  });
}

async function nextBoardPosition(
  ctx: QueryCtx,
  orgId: Doc<"orgs">["_id"],
  status: Status,
) {
  const rows = await ctx.db
    .query("issues")
    .withIndex("by_org_and_status_and_softDeleted", (q) =>
      q.eq("orgId", orgId).eq("status", status).eq("softDeleted", false),
    )
    .take(200);
  if (rows.length === 0) return BOARD_POSITION_GAP;
  return (
    Math.max(...rows.map((issue) => issueBoardPosition(issue))) +
    BOARD_POSITION_GAP
  );
}

async function listStatusRows(
  ctx: QueryCtx,
  orgId: Doc<"orgs">["_id"],
  status: Status,
  limit: number,
) {
  return await ctx.db
    .query("issues")
    .withIndex("by_org_and_status_and_softDeleted", (q) =>
      q.eq("orgId", orgId).eq("status", status).eq("softDeleted", false),
    )
    .order("desc")
    .take(limit);
}

async function listStatusRowsWithAssignees(
  ctx: QueryCtx,
  orgId: Doc<"orgs">["_id"],
  status: Status,
  limit: number,
) {
  const rows = await listStatusRows(ctx, orgId, status, limit);
  return await Promise.all(
    sortIssuesForBoard(rows).map(async (issue) => {
      const assignee = await publicAssignee(ctx, issue.assigneeUserId);
      return {
        ...issue,
        assignee,
        publicId: issue.publicId ?? issue._id,
      };
    }),
  );
}

async function issueWithDetails(
  ctx: QueryCtx,
  issue: Doc<"issues">,
  viewerUserId: Doc<"users">["_id"],
) {
  const primaryConversation = await ctx.db.get(issue.primaryConversationId);
  const assignee = await publicAssignee(ctx, issue.assigneeUserId);
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
    assignee,
    publicId: issue.publicId ?? issue._id,
    primaryConversation,
    timeline: hydratedTimeline,
  };
}

function issueTitle(issue: Doc<"issues">) {
  return (
    issue.brief?.issueTitle?.trim() ||
    issue.summary.trim() ||
    issue.address ||
    "Untitled issue"
  );
}

export const listByStatus = query({
  args: { limitPerStatus: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { org } = await requireUserAndOrg(ctx);
    const limitPerStatus = Math.min(args.limitPerStatus ?? 100, 200);
    const grouped: Record<Status, IssueListRow[]> = {
      new: [],
      "in-progress": [],
      scheduled: [],
      "awaiting-follow-up": [],
      closed: [],
    };
    for (const status of STATUSES) {
      grouped[status] = await listStatusRowsWithAssignees(
        ctx,
        org._id,
        status,
        limitPerStatus,
      );
    }
    return grouped;
  },
});

export const listDeleted = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { org } = await requireUserAndOrg(ctx);
    const limit = Math.min(args.limit ?? 100, 200);
    const rows = await ctx.db
      .query("issues")
      .withIndex("by_org_and_softDeleted_and_deletedAt", (q) =>
        q.eq("orgId", org._id).eq("softDeleted", true),
      )
      .order("desc")
      .take(limit);

    return rows.map((issue) => ({
      _id: issue._id,
      _creationTime: issue._creationTime,
      address: issue.address,
      brief: issue.brief,
      contactEmail: issue.contactEmail,
      contactName: issue.contactName,
      contactPhone: issue.contactPhone,
      deletedAt: issue.deletedAt,
      status: issue.status,
      summary: issue.summary,
      title: issueTitle(issue),
      publicId: issue.publicId ?? issue._id,
      types: issue.types ?? [],
    }));
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
    if (!issue || issue.orgId !== org._id) {
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
    await ctx.db.patch(args.id, {
      boardPosition: await nextBoardPosition(ctx, org._id, args.status),
      status: args.status,
    });
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

export const updateAssignee = mutation({
  args: {
    id: v.id("issues"),
    assigneeUserId: v.union(v.id("users"), v.null()),
  },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.id);
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      throw new Error("Not found");
    }

    const assigneeUserId = args.assigneeUserId;
    let nextAssignee: IssueAssignee | null = null;
    if (assigneeUserId) {
      const assignee = await ctx.db.get(assigneeUserId);
      if (!assignee || assignee.softDeleted) {
        throw new Error("Assignee not found");
      }
      nextAssignee = {
        _id: assignee._id,
        email: assignee.email,
        firstName: assignee.firstName,
        imageUrl: assignee.imageUrl,
        lastName: assignee.lastName,
      };
      const membership = await ctx.db
        .query("memberships")
        .withIndex("by_user_and_org", (q) =>
          q.eq("userId", assigneeUserId).eq("orgId", org._id),
        )
        .unique();
      if (!membership) throw new Error("Assignee not found");
    }

    const next = assigneeUserId;
    const previous = issue.assigneeUserId ?? null;
    if (previous === next) return;
    const previousAssignee = await publicAssignee(ctx, previous);
    await ctx.db.patch(args.id, { assigneeUserId: next });
    await ctx.db.insert("issueUpdates", {
      orgId: org._id,
      issueId: args.id,
      kind: "assignee_change",
      authorUserId: user._id,
      metadata: {
        from: previous,
        to: next,
        fromName: assigneeDisplayName(previousAssignee),
        toName: assigneeDisplayName(nextAssignee),
        toImageUrl: nextAssignee?.imageUrl ?? null,
      },
      dedupeKey: null,
      softDeleted: false,
    });
  },
});

export const moveOnBoard = mutation({
  args: {
    id: v.id("issues"),
    status: statusValidator,
    orderedIds: v.array(v.id("issues")),
  },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.id);
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      throw new Error("Not found");
    }
    if (!args.orderedIds.includes(args.id)) {
      throw new Error("Moved issue must be included in the ordered ids");
    }

    const seen = new Set<Doc<"issues">["_id"]>();
    const orderedIssues: Doc<"issues">[] = [];
    for (const orderedId of args.orderedIds) {
      if (seen.has(orderedId)) throw new Error("Duplicate issue id");
      seen.add(orderedId);
      const orderedIssue = await ctx.db.get(orderedId);
      if (
        !orderedIssue ||
        orderedIssue.orgId !== org._id ||
        orderedIssue.softDeleted
      ) {
        throw new Error("Not found");
      }
      if (orderedIssue._id !== args.id && orderedIssue.status !== args.status) {
        throw new Error("Ordered ids must belong to the target status");
      }
      orderedIssues.push(orderedIssue);
    }

    const previous = issue.status;
    for (const [index, orderedIssue] of orderedIssues.entries()) {
      const patch: Partial<Doc<"issues">> = {
        boardPosition: (index + 1) * BOARD_POSITION_GAP,
      };
      if (orderedIssue._id === args.id) patch.status = args.status;
      await ctx.db.patch(orderedIssue._id, patch);
    }

    if (previous !== args.status) {
      await ctx.db.insert("issueUpdates", {
        orgId: org._id,
        issueId: args.id,
        kind: "status_change",
        authorUserId: user._id,
        metadata: { from: previous, to: args.status },
        dedupeKey: null,
        softDeleted: false,
      });
    }
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

export const deleteIssue = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.id);
    if (!issue || issue.orgId !== org._id || issue.softDeleted) {
      throw new Error("Not found");
    }

    await ctx.db.patch(args.id, { deletedAt: Date.now(), softDeleted: true });
    await ctx.db.insert("issueUpdates", {
      orgId: org._id,
      issueId: args.id,
      kind: "issue_deleted",
      authorUserId: user._id,
      dedupeKey: null,
      softDeleted: false,
    });
  },
});

export const restoreIssue = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const { user, org } = await requireUserAndOrg(ctx);
    const issue = await ctx.db.get(args.id);
    if (!issue || issue.orgId !== org._id || !issue.softDeleted) {
      throw new Error("Not found");
    }

    await ctx.db.patch(args.id, { deletedAt: undefined, softDeleted: false });
    await ctx.db.insert("issueUpdates", {
      orgId: org._id,
      issueId: args.id,
      kind: "issue_restored",
      authorUserId: user._id,
      dedupeKey: null,
      softDeleted: false,
    });
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
      brief: summary.brief,
      types: Array.from(new Set(summary.types)),
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

export const retryFailedSummariesOnce = mutation({
  args: {
    issueIds: v.array(v.id("issues")),
  },
  returns: v.number(),
  handler: async (ctx, { issueIds }) => {
    let scheduled = 0;
    for (const issueId of issueIds) {
      const issue = await ctx.db.get(issueId);
      if (!issue || issue.softDeleted) continue;
      await ctx.db.patch(issueId, {
        lastSummaryError: undefined,
        summaryAttempts: 0,
        summaryStatus: "pending",
      });
      await ctx.scheduler.runAfter(
        0,
        internal.extraction.summary.runIssueSummary,
        { issueId },
      );
      scheduled += 1;
    }
    return scheduled;
  },
});
