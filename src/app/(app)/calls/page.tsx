"use client";

import { usePaginatedQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageContent } from "@/components/patterns/app-shell";
import { CallDetailSidePanel } from "@/components/patterns/call-detail-side-panel";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/patterns/data-table";
import { PageHeaderList } from "@/components/patterns/page-header-list";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownOption } from "@/components/ui/dropdown-option";
import { DropdownTrigger } from "@/components/ui/dropdown-trigger";
import { Icon } from "@/components/ui/icon";
import { LabelSmall } from "@/components/ui/label-small";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

type Conversation = Doc<"conversations"> & {
  agent: Doc<"agents"> | null;
  issue: Doc<"issues"> | null;
};

type CallRow = {
  id: string;
  conversation: Conversation;
  date: string;
  agent: string;
  duration: string;
  address: string;
  status: "pass" | "fail";
  issuePublicId?: string;
  summary: string;
  transcript: Array<{
    id: string;
    variant: "incoming" | "outgoing";
    body: string;
  }>;
};

type OutcomeFilter = "all" | "pass" | "failed";
type DateFilter = "all" | "week" | "today";
type CallOutcome = "success" | "failure" | "unknown";
type CallQueryArgs = {
  channel: "call";
  callOutcome?: CallOutcome;
  dateRange?: { fromSecs: number; toSecs: number };
};

const outcomeFilterLabels: Record<OutcomeFilter, string> = {
  all: "All outcomes",
  pass: "Pass",
  failed: "Failed",
};

const dateFilterLabels: Record<DateFilter, string> = {
  all: "All time",
  week: "This week",
  today: "Today",
};

function formatDate(unixSecs: number): string {
  return new Date(unixSecs * 1000).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function conversationToRow(conversation: Conversation): CallRow {
  const extracted = conversation.extractedFields;
  const address = extracted?.address ?? conversation.subject ?? "No address";
  return {
    id: conversation._id,
    conversation,
    date: formatDate(conversation.occurredAtUnixSecs),
    agent: conversation.agent?.name ?? "Unknown agent",
    duration: formatDuration(conversation.callDurationSecs),
    address,
    status: conversation.callSuccessful === "failure" ? "fail" : "pass",
    issuePublicId:
      conversation.issue?.publicId ?? conversation.issueId ?? undefined,
    summary:
      conversation.issue?.summary ??
      extracted?.issueSummary ??
      conversation.bodyText ??
      "No call summary available.",
    transcript:
      conversation.messages?.map((message, index) => ({
        id: `${conversation._id}:${index}`,
        variant:
          message.role === "agent"
            ? ("incoming" as const)
            : ("outgoing" as const),
        body: message.body,
      })) ?? [],
  };
}

function toCallOutcome(filter: OutcomeFilter): CallOutcome | undefined {
  if (filter === "pass") return "success";
  if (filter === "failed") return "failure";
  return undefined;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateRangeForFilter(filter: DateFilter) {
  if (filter === "all") return undefined;

  const toSecs = Math.ceil(Date.now() / 1000);
  const from = startOfToday();

  if (filter === "week") {
    const day = from.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    from.setDate(from.getDate() - daysSinceMonday);
  }

  return {
    fromSecs: Math.floor(from.getTime() / 1000),
    toSecs,
  };
}

const columns: DataTableColumn<CallRow>[] = [
  { id: "date", header: "Date", cell: (row) => row.date, className: "flex-1" },
  {
    id: "agent",
    header: "Agent",
    cell: (row) => row.agent,
    className: "flex-1",
  },
  {
    id: "duration",
    header: "Duration",
    cell: (row) => row.duration,
    className: "flex-1",
  },
  {
    id: "address",
    header: "Address",
    cell: (row) => row.address,
    className: "flex-1",
  },
  {
    id: "status",
    header: "Pass / Fail",
    className: "w-status-column",
    cell: (row) =>
      row.status === "pass" ? (
        <LabelSmall variant="success">Pass</LabelSmall>
      ) : (
        <LabelSmall variant="destructive">Failed</LabelSmall>
      ),
  },
];

export default function CallLogsPage() {
  const router = useRouter();
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const queryArgs = useMemo((): CallQueryArgs => {
    const callOutcome = toCallOutcome(outcomeFilter);
    const dateRange = dateRangeForFilter(dateFilter);
    return {
      channel: "call",
      ...(callOutcome ? { callOutcome } : {}),
      ...(dateRange ? { dateRange } : {}),
    };
  }, [outcomeFilter, dateFilter]);
  const { results: conversations } = usePaginatedQuery(
    api.conversations.list,
    queryArgs,
    { initialNumItems: 50 },
  );
  const [selectedCallId, setSelectedCallId] = useState<string | undefined>(
    undefined,
  );
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () => conversations.map((conversation) => conversationToRow(conversation)),
    [conversations],
  );

  const filteredCalls = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.address.toLowerCase().includes(q) ||
        c.agent.toLowerCase().includes(q) ||
        c.date.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const selectedCall = selectedCallId
    ? rows.find((call) => call.id === selectedCallId)
    : undefined;

  return (
    <PageContent
      header={
        <PageHeaderList
          onSearchChange={setQuery}
          searchPlaceholder="Search calls"
          searchValue={query}
          title="Call Logs"
          titleIcon={<Icon name="call-incoming" size="md" />}
        />
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DataTable
          columns={columns}
          countLabel={(c) => `${c} Calls`}
          emptyState="No calls found."
          filters={
            <>
              <DropdownMenu
                trigger={
                  <DropdownTrigger
                    leadingIcon={<Icon name="filter" size="sm" />}
                  >
                    {outcomeFilterLabels[outcomeFilter]}
                  </DropdownTrigger>
                }
              >
                <DropdownOption
                  onSelect={() => {
                    setOutcomeFilter("all");
                    setSelectedCallId(undefined);
                  }}
                  selected={outcomeFilter === "all"}
                >
                  All outcomes
                </DropdownOption>
                <DropdownOption
                  onSelect={() => {
                    setOutcomeFilter("pass");
                    setSelectedCallId(undefined);
                  }}
                  selected={outcomeFilter === "pass"}
                >
                  Pass
                </DropdownOption>
                <DropdownOption
                  onSelect={() => {
                    setOutcomeFilter("failed");
                    setSelectedCallId(undefined);
                  }}
                  selected={outcomeFilter === "failed"}
                >
                  Failed
                </DropdownOption>
              </DropdownMenu>
              <DropdownMenu
                trigger={
                  <DropdownTrigger
                    leadingIcon={<Icon name="calendar" size="sm" />}
                  >
                    {dateFilterLabels[dateFilter]}
                  </DropdownTrigger>
                }
              >
                <DropdownOption
                  onSelect={() => {
                    setDateFilter("all");
                    setSelectedCallId(undefined);
                  }}
                  selected={dateFilter === "all"}
                >
                  All time
                </DropdownOption>
                <DropdownOption
                  onSelect={() => {
                    setDateFilter("week");
                    setSelectedCallId(undefined);
                  }}
                  selected={dateFilter === "week"}
                >
                  This week
                </DropdownOption>
                <DropdownOption
                  onSelect={() => {
                    setDateFilter("today");
                    setSelectedCallId(undefined);
                  }}
                  selected={dateFilter === "today"}
                >
                  Today
                </DropdownOption>
              </DropdownMenu>
            </>
          }
          getRowId={(row) => row.id}
          onRowClick={(row) =>
            setSelectedCallId((curr) => (curr === row.id ? undefined : row.id))
          }
          rowCount={filteredCalls.length}
          rows={filteredCalls}
          selectedRowId={selectedCallId}
        />
      </div>
      <CallDetailSidePanel
        onClose={() => setSelectedCallId(undefined)}
        onViewIssue={
          selectedCall?.issuePublicId
            ? () => router.push(`/issues/${selectedCall.issuePublicId}`)
            : undefined
        }
        open={Boolean(selectedCall)}
        summary={selectedCall?.summary}
        title={selectedCall?.address ?? ""}
        transcript={selectedCall?.transcript}
      />
    </PageContent>
  );
}
