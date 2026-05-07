import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const BOARD_POSITION_GAP = 1000;

const LEGACY_POSITION_BASE = 10_000_000_000_000;

type IssueStatus = Doc<"issues">["status"];
type BoardPositionCtx = QueryCtx | MutationCtx;

function legacyBoardPosition(issue: Doc<"issues">) {
  return LEGACY_POSITION_BASE - issue._creationTime;
}

export function issueBoardPosition(issue: Doc<"issues">) {
  return issue.boardPosition ?? legacyBoardPosition(issue);
}

export function sortIssuesForBoard<T extends Doc<"issues">>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const positionDiff = issueBoardPosition(a) - issueBoardPosition(b);
    if (positionDiff !== 0) return positionDiff;
    return b._creationTime - a._creationTime;
  });
}

export async function listIssuesForBoardStatus(
  ctx: BoardPositionCtx,
  orgId: Doc<"orgs">["_id"],
  status: IssueStatus,
) {
  const rows = await ctx.db
    .query("issues")
    .withIndex("by_org_and_status_and_softDeleted", (q) =>
      q.eq("orgId", orgId).eq("status", status).eq("softDeleted", false),
    )
    .collect();

  return sortIssuesForBoard(rows);
}

export async function topBoardPosition(
  ctx: BoardPositionCtx,
  orgId: Doc<"orgs">["_id"],
  status: IssueStatus,
) {
  const rows = await listIssuesForBoardStatus(ctx, orgId, status);
  const first = rows[0];
  return first
    ? issueBoardPosition(first) - BOARD_POSITION_GAP
    : BOARD_POSITION_GAP;
}

export async function bottomBoardPosition(
  ctx: BoardPositionCtx,
  orgId: Doc<"orgs">["_id"],
  status: IssueStatus,
) {
  const rows = await listIssuesForBoardStatus(ctx, orgId, status);
  const last = rows.at(-1);
  return last
    ? issueBoardPosition(last) + BOARD_POSITION_GAP
    : BOARD_POSITION_GAP;
}
