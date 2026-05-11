"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageContent } from "@/components/patterns/app-shell";
import {
  KanbanBoard,
  type KanbanCardData,
  type KanbanColumnDef,
} from "@/components/patterns/kanban-board";
import { PageHeaderList } from "@/components/patterns/page-header-list";
import { SearchHeader } from "@/components/patterns/search-header";
import { Icon } from "@/components/ui/icon";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { colorClasses } from "@/lib/issue-type-colors";
import { cn } from "@/lib/utils";

type IssueStatus = Doc<"issues">["status"];
type IssueAssignee = Pick<
  Doc<"users">,
  "email" | "firstName" | "imageUrl" | "lastName"
>;
type IssueListItem = Doc<"issues"> & {
  assignee: IssueAssignee | null;
  publicId: string;
};
type IssueTagType = NonNullable<Doc<"issues">["types"]>[number];
type IssueTypeFilter = {
  id: IssueTagType;
  label: string;
  dotClassName: string;
  chipClassName: string;
};

const issueStatusColumns: Array<{
  id: IssueStatus;
  title: string;
  defaultCollapsed?: boolean;
}> = [
  { id: "new", title: "Unassigned" },
  { id: "in-progress", title: "In Progress" },
  { id: "scheduled", title: "Scheduled" },
  { id: "awaiting-follow-up", title: "Awaiting Response" },
];

function getTypes(issue: IssueListItem): IssueTagType[] {
  return issue.types?.length ? Array.from(new Set(issue.types)) : [];
}

function titleizeType(type: string) {
  return type
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function fallbackFilterFor(type: IssueTagType): IssueTypeFilter {
  return {
    id: type,
    label: titleizeType(type),
    dotClassName: "bg-neutral-700",
    chipClassName: "bg-neutral-300 text-neutral-900",
  };
}

function buildTypeFilters(
  org: Doc<"orgs"> | null | undefined,
  issues: IssueListItem[],
): IssueTypeFilter[] {
  const filters = new Map<IssueTagType, IssueTypeFilter>();
  for (const type of org?.issueTypes ?? []) {
    const classes =
      colorClasses[type.color ?? ""] ?? fallbackFilterFor(type.key);
    filters.set(type.key, {
      id: type.key,
      label: type.label,
      dotClassName: classes.dotClassName,
      chipClassName: classes.chipClassName,
    });
  }
  for (const issue of issues) {
    for (const type of getTypes(issue)) {
      if (!filters.has(type)) filters.set(type, fallbackFilterFor(type));
    }
  }
  return Array.from(filters.values());
}

function TypeBadges({
  filtersById,
  types,
}: {
  filtersById: Map<IssueTagType, IssueTypeFilter>;
  types: IssueTagType[];
}) {
  const filters = types.flatMap((type) => {
    const filter = filtersById.get(type) ?? fallbackFilterFor(type);
    return filter ? [filter] : [];
  });
  if (filters.length === 0) return null;

  return (
    <span className="flex min-w-0 flex-wrap gap-sm">
      {filters.map((filter) => (
        <span
          className={cn(
            "inline-flex min-w-0 items-center gap-sm rounded-full py-[7px] pr-[10px] pl-md font-regular text-12 leading-120",
            filter.chipClassName,
          )}
          key={filter.id}
        >
          <span
            aria-hidden
            className={cn("size-sm shrink-0 rounded-full", filter.dotClassName)}
          />
          <span className="truncate">{filter.label}</span>
        </span>
      ))}
    </span>
  );
}

function formatLastContact(createdAt: number) {
  const date = new Date(createdAt);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const dayDelta = Math.round(
    (startOfToday - startOfDate) / (24 * 60 * 60 * 1000),
  );
  const time = date
    .toLocaleTimeString(undefined, {
      hour: "numeric",
      hour12: true,
      minute: "2-digit",
    })
    .toLowerCase()
    .replace(" ", "");

  if (dayDelta === 0) return `Today, ${time}`;
  if (dayDelta === 1) return `Yesterday, ${time}`;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function assigneeName(assignee: IssueAssignee): string {
  const fullName = [assignee.firstName, assignee.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || assignee.email;
}

function assigneeInitials(assignee: IssueAssignee): string {
  const names = [assignee.firstName, assignee.lastName].filter(Boolean);
  if (names.length > 0) {
    return names.map((name) => name?.[0] ?? "").join("");
  }
  return assignee.email[0] ?? "";
}

function issueToCard(
  issue: IssueListItem,
  filtersById: Map<IssueTagType, IssueTypeFilter>,
): KanbanCardData {
  return {
    id: issue._id,
    columnId: issue.status,
    assignee: issue.assignee
      ? {
          imageUrl: issue.assignee.imageUrl,
          initials: assigneeInitials(issue.assignee),
          name: assigneeName(issue.assignee),
        }
      : null,
    badge: <TypeBadges filtersById={filtersById} types={getTypes(issue)} />,
    title: issue.address ?? "No address",
    description: issue.summary,
    timestamp: `Last Contact: ${formatLastContact(issue._creationTime)}`,
  };
}

export default function OpenIssuesPage() {
  const router = useRouter();
  const groupedIssues = useQuery(api.issues.listByStatus, {
    limitPerStatus: 100,
  });
  const org = useQuery(api.orgs.getCurrent);
  const moveOnBoard = useMutation(api.issues.moveOnBoard);
  const [collapsedColumns, setCollapsedColumns] = useState<
    Record<IssueStatus, boolean>
  >(() => {
    const initial = {} as Record<IssueStatus, boolean>;
    for (const col of issueStatusColumns) {
      initial[col.id] = col.defaultCollapsed ?? false;
    }
    return initial;
  });
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Record<IssueTagType, boolean>>(
    {
      enquiry: true,
      emergency: true,
    },
  );

  const issues = useMemo(() => {
    if (!groupedIssues) return [];
    return issueStatusColumns.flatMap((column) => groupedIssues[column.id]);
  }, [groupedIssues]);

  const columns: KanbanColumnDef[] = useMemo(
    () =>
      issueStatusColumns.map((col) => ({
        id: col.id,
        title: col.title,
        collapsed: collapsedColumns[col.id],
      })),
    [collapsedColumns],
  );

  const typeFilters = useMemo(
    () => buildTypeFilters(org, issues),
    [org, issues],
  );
  const filtersById = useMemo(
    () => new Map(typeFilters.map((filter) => [filter.id, filter])),
    [typeFilters],
  );

  const filteredIssues = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((issue) => {
      const types = getTypes(issue);
      if (
        types.length > 0 &&
        !types.some((type) => activeTypes[type] ?? true)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        (issue.address ?? "").toLowerCase().includes(q) ||
        issue.summary.toLowerCase().includes(q)
      );
    });
  }, [activeTypes, issues, query]);

  const cards = useMemo(
    () => filteredIssues.map((issue) => issueToCard(issue, filtersById)),
    [filteredIssues, filtersById],
  );

  const issueById = useMemo(() => {
    const map = new Map<Id<"issues">, IssueListItem>();
    for (const issue of issues) map.set(issue._id, issue);
    return map;
  }, [issues]);

  return (
    <PageContent
      contentClassName="pb-0"
      header={
        <PageHeaderList
          onSearchChange={setQuery}
          searchPlaceholder="Search Issues"
          searchValue={query}
          title="Open Issues"
          titleIcon={<Icon name="issues" size="md" />}
        />
      }
    >
      {query.trim() ? (
        <SearchHeader onClear={() => setQuery("")} query={query.trim()} />
      ) : null}
      <div className="flex shrink-0 flex-col gap-base pt-xs pr-lg pb-lg pl-md">
        <div className="font-medium text-14 text-foreground leading-120">
          <span>Filter by Type</span>
        </div>
        <div className="flex flex-wrap items-center gap-md">
          {typeFilters.map((filter) => {
            const active = activeTypes[filter.id] ?? true;
            return (
              <button
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-sm rounded-full py-[7px] pr-[10px] pl-md font-regular text-12 leading-120",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? filter.chipClassName
                    : "bg-neutral-300 text-neutral-800",
                )}
                key={filter.id}
                onClick={() =>
                  setActiveTypes((current) => ({
                    ...current,
                    [filter.id]: !(current[filter.id] ?? true),
                  }))
                }
                type="button"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-sm shrink-0 rounded-full",
                    active ? filter.dotClassName : "bg-neutral-700",
                  )}
                />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
      <KanbanBoard
        cards={cards}
        className="min-h-0 flex-1"
        columns={columns}
        onCardClick={(cardId) => {
          const issue = issueById.get(cardId as Id<"issues">);
          if (issue) router.push(`/issues/${issue.publicId}`);
        }}
        onCardMove={(cardId, toColumnId, orderedCardIds) =>
          moveOnBoard({
            id: cardId as Id<"issues">,
            status: toColumnId as IssueStatus,
            orderedIds: orderedCardIds as Array<Id<"issues">>,
          })
        }
        onColumnCollapseChange={(columnId, collapsed) =>
          setCollapsedColumns((curr) => ({
            ...curr,
            [columnId as IssueStatus]: collapsed,
          }))
        }
      />
    </PageContent>
  );
}
