"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { PageContent } from "@/components/patterns/app-shell";
import { PageHeaderDetail } from "@/components/patterns/page-header-detail";
import { TabbedContent } from "@/components/patterns/tabbed-content";
import {
  type TimelineItem as PatternTimelineItem,
  TimelineView,
} from "@/components/patterns/timeline-view";
import { TranscriptView } from "@/components/patterns/transcript-view";
import { UpdateComposer } from "@/components/patterns/update-composer";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownOption } from "@/components/ui/dropdown-option";
import { DropdownTrigger } from "@/components/ui/dropdown-trigger";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Inline } from "@/components/ui/inline";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type IssueStatus = Doc<"issues">["status"];
type IssueListItem = Doc<"issues"> & { publicId: string };
type IssueUpdate = Doc<"issueUpdates"> & {
  author?: Doc<"users"> | null;
  canManage?: boolean;
};

const statusOrder: IssueStatus[] = [
  "new",
  "in-progress",
  "contractor-scheduled",
  "awaiting-follow-up",
  "closed",
];

function formatTimelineTime(value: number): string {
  const date = new Date(value);
  const now = new Date();
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? "st"
      : day % 10 === 2 && day % 100 !== 12
        ? "nd"
        : day % 10 === 3 && day % 100 !== 13
          ? "rd"
          : "th";
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  });
  const year =
    date.getFullYear() === now.getFullYear() ? "" : ` ${date.getFullYear()}`;
  return `${weekday} ${day}${suffix} ${month}${year}, ${time}`;
}

function formatDuration(seconds: number | null): string | undefined {
  if (seconds === null) return undefined;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function statusLabel(status: IssueStatus): string {
  switch (status) {
    case "new":
      return "New Issue";
    case "in-progress":
      return "In Progress";
    case "contractor-scheduled":
      return "Contractor Scheduled";
    case "awaiting-follow-up":
      return "Awaiting Follow-up";
    case "closed":
      return "Closed";
  }
}

function statusIcon(status: IssueStatus, size: "sm" | "md" = "md") {
  const name =
    status === "new"
      ? "status-new"
      : status === "in-progress"
        ? "status-in-progress"
        : status === "contractor-scheduled"
          ? "calendar"
          : status === "awaiting-follow-up"
            ? "status-waiting"
            : "completed";
  return <Icon name={name} size={size} />;
}

function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    value === "new" ||
    value === "in-progress" ||
    value === "contractor-scheduled" ||
    value === "awaiting-follow-up" ||
    value === "closed"
  );
}

function formatScheduledDate(value: string | null | undefined): string {
  if (!value) return "Add date work scheduled for";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toTelHref(value: string | null | undefined): string | undefined {
  const phone = value?.trim();
  if (!phone) return undefined;
  const normalized = phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

function toMailtoHref(value: string | null | undefined): string | undefined {
  const email = value?.trim();
  return email ? `mailto:${email}` : undefined;
}

function userDisplayName(user: Doc<"users"> | null | undefined): string {
  if (!user) return "Team update";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Team update";
}

function toPatternTimelineItem(
  item: IssueUpdate,
  reportedAtUnixSecs?: number,
  editControls?: {
    editingId: Id<"issueUpdates"> | null;
    editBody: string;
    onEditBodyChange: (value: string) => void;
    onStartEdit: (item: IssueUpdate) => void;
    onDelete: (item: IssueUpdate) => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
  },
): PatternTimelineItem {
  if (item.kind === "comment") {
    const authorName = userDisplayName(item.author);
    const editing = editControls?.editingId === item._id;
    const editBody = editControls?.editBody ?? "";
    return {
      id: item._id,
      variant: "avatar-led",
      authorName,
      authorAlt: authorName,
      authorImageSrc: item.author?.imageUrl ?? undefined,
      timestamp: item.editedAt
        ? `${formatTimelineTime(item._creationTime)} · edited`
        : formatTimelineTime(item._creationTime),
      actions:
        editing || !item.canManage ? null : (
          <div className="flex items-center gap-xxs">
            <IconButton
              aria-label="Edit update"
              icon={<Icon name="ai-edit" size="sm" />}
              onClick={() => editControls?.onStartEdit(item)}
              size="sm"
            />
            <IconButton
              aria-label="Delete update"
              className="text-destructive-foreground"
              icon={<Icon name="x" size="sm" />}
              onClick={() => editControls?.onDelete(item)}
              size="sm"
            />
          </div>
        ),
      body: editing ? (
        <div className="flex w-full flex-col gap-md">
          <Textarea
            className="min-h-20 w-full"
            onChange={(event) =>
              editControls?.onEditBodyChange(event.target.value)
            }
            value={editBody}
          />
          <div className="flex items-center justify-end gap-sm">
            <Button onClick={editControls?.onCancelEdit} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={editBody.trim().length === 0}
              onClick={editControls?.onSaveEdit}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        (item.body ?? "")
      ),
    };
  }

  const metadata = item.metadata as
    | { to?: IssueStatus | string | null }
    | undefined;
  const status = isIssueStatus(metadata?.to) ? metadata.to : undefined;
  const isCreated = item.kind === "created_from_call";
  if (item.kind === "contractor_change") {
    const contractor = typeof metadata?.to === "string" ? metadata.to : null;
    return {
      id: item._id,
      variant: "icon-led",
      title: contractor
        ? `Contractor set to ${contractor}`
        : "Contractor cleared",
      timestamp: formatTimelineTime(item._creationTime),
      tone: "orange",
      icon: <Icon name="contact" size="sm" />,
    };
  }
  if (item.kind === "scheduled_date_change") {
    const scheduledDate = typeof metadata?.to === "string" ? metadata.to : null;
    return {
      id: item._id,
      variant: "icon-led",
      title: scheduledDate
        ? `Scheduled date set to ${formatScheduledDate(scheduledDate)}`
        : "Scheduled date cleared",
      timestamp: formatTimelineTime(item._creationTime),
      tone: "orange",
      icon: <Icon name="calendar" size="sm" />,
    };
  }
  return {
    id: item._id,
    variant: "icon-led",
    title: isCreated
      ? "Tenant reported issue"
      : `Status changed to ${status ? statusLabel(status) : "new status"}`,
    timestamp: formatTimelineTime(
      isCreated && reportedAtUnixSecs
        ? reportedAtUnixSecs * 1000
        : item._creationTime,
    ),
    tone: isCreated ? "purple" : "orange",
    icon: isCreated ? (
      <Icon name="phone" size="sm" />
    ) : status ? (
      statusIcon(status, "sm")
    ) : (
      <Icon name="status-in-progress" size="sm" />
    ),
  };
}

function flattenIssues(
  grouped: Record<IssueStatus, IssueListItem[]> | undefined,
): IssueListItem[] {
  if (!grouped) return [];
  return statusOrder.flatMap((status) => grouped[status]);
}

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const issue = useQuery(api.issues.getByPublicId, { publicId: id });
  const groupedIssues = useQuery(api.issues.listByStatus, {
    limitPerStatus: 100,
  });
  const addComment = useMutation(api.issueUpdates.addComment);
  const editComment = useMutation(api.issueUpdates.editComment);
  const deleteComment = useMutation(api.issueUpdates.deleteComment);
  const updateStatus = useMutation(api.issues.updateStatus);
  const updateContractor = useMutation(api.issues.updateContractor);
  const updateScheduledDate = useMutation(api.issues.updateScheduledDate);
  const [update, setUpdate] = useState("");
  const [contractorName, setContractorName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [editingUpdateId, setEditingUpdateId] =
    useState<Id<"issueUpdates"> | null>(null);
  const [editBody, setEditBody] = useState("");
  const issueId = issue?._id;
  const issueContractorName = issue?.contractorName ?? "";
  const issueScheduledDate = issue?.scheduledDate ?? "";

  useEffect(() => {
    if (!issueId) return;
    setContractorName(issueContractorName);
    setScheduledDate(issueScheduledDate);
  }, [issueId, issueContractorName, issueScheduledDate]);

  const adjacent = useMemo(() => {
    const allIssues = flattenIssues(groupedIssues);
    const index = allIssues.findIndex((candidate) => candidate.publicId === id);
    if (index < 0) return {};
    return {
      prev: index > 0 ? allIssues[index - 1]?.publicId : undefined,
      next:
        index < allIssues.length - 1
          ? allIssues[index + 1]?.publicId
          : undefined,
    };
  }, [groupedIssues, id]);

  const sendUpdate = async () => {
    if (!issue) return;
    const body = update.trim();
    if (!body) return;
    await addComment({ issueId: issue._id, body });
    setUpdate("");
  };

  const startEditUpdate = (item: IssueUpdate) => {
    setEditingUpdateId(item._id);
    setEditBody(item.body ?? "");
  };

  const cancelEditUpdate = () => {
    setEditingUpdateId(null);
    setEditBody("");
  };

  const saveEditedUpdate = async () => {
    if (!editingUpdateId) return;
    const body = editBody.trim();
    if (!body) return;
    await editComment({ issueUpdateId: editingUpdateId, body });
    cancelEditUpdate();
  };

  const deleteUpdate = async (item: IssueUpdate) => {
    if (editingUpdateId === item._id) cancelEditUpdate();
    await deleteComment({ issueUpdateId: item._id });
  };

  const saveContractor = async () => {
    if (!issue) return;
    const next = contractorName.trim() || null;
    if ((issue.contractorName ?? null) === next) {
      setContractorName(next ?? "");
      return;
    }
    await updateContractor({ id: issue._id, contractorName: next });
  };

  const saveScheduledDate = async (value: string) => {
    if (!issue) return;
    const next = value || null;
    if ((issue.scheduledDate ?? null) === next) return;
    await updateScheduledDate({ id: issue._id, scheduledDate: next });
  };

  const copyTenantDetails = async () => {
    if (!issue || typeof navigator === "undefined") return;
    const details = [
      issue.address,
      issue.contactName,
      issue.contactPhone,
      issue.contactEmail,
    ].filter(Boolean);
    if (details.length === 0) return;
    await navigator.clipboard.writeText(details.join("\n"));
  };

  if (issue === undefined) {
    return (
      <PageContent
        header={
          <PageHeaderDetail
            current="Loading"
            onBack={() => router.push("/issues")}
            parent="Open Issues"
          />
        }
      >
        <div className="flex min-h-0 flex-1 items-center justify-center p-2xl text-14 text-foreground-muted">
          Loading issue...
        </div>
      </PageContent>
    );
  }

  if (issue === null) {
    return (
      <PageContent
        header={
          <PageHeaderDetail
            current="Not found"
            onBack={() => router.push("/issues")}
            parent="Open Issues"
          />
        }
      >
        <div className="flex min-h-0 flex-1 items-center justify-center p-2xl text-14 text-foreground-muted">
          Issue not found.
        </div>
      </PageContent>
    );
  }

  const timelineItems = issue.timeline.map((item) =>
    toPatternTimelineItem(item, issue.primaryConversation?.occurredAtUnixSecs, {
      editingId: editingUpdateId,
      editBody,
      onEditBodyChange: setEditBody,
      onStartEdit: startEditUpdate,
      onDelete: (item) => {
        void deleteUpdate(item);
      },
      onCancelEdit: cancelEditUpdate,
      onSaveEdit: () => {
        void saveEditedUpdate();
      },
    }),
  );
  const transcript =
    issue.primaryConversation?.messages?.map((message, index) => ({
      id: `${issue.primaryConversationId}:${index}`,
      variant:
        message.role === "agent"
          ? ("incoming" as const)
          : ("outgoing" as const),
      body: message.body,
    })) ?? [];
  const callDuration = formatDuration(
    issue.primaryConversation?.callDurationSecs ?? null,
  );
  const contactPhone = issue.contactPhone?.trim();
  const contactEmail = issue.contactEmail?.trim();
  const contactPhoneHref = toTelHref(contactPhone);
  const contactEmailHref = toMailtoHref(contactEmail);
  const briefSectionsBase = issue.brief
    ? [
        { id: "issue", title: "Issue", body: issue.brief.issue },
        { id: "symptoms", title: "Symptoms", body: issue.brief.symptoms },
        {
          id: "severity",
          title: "Severity signals",
          body: issue.brief.severitySignals,
        },
        { id: "notes", title: "Notes", body: issue.brief.notes },
      ].filter((section) => section.body)
    : [];
  const briefSections =
    briefSectionsBase.length > 0
      ? briefSectionsBase
      : [{ id: "issue", title: "Issue", body: issue.summary }];

  const detailsContent = (
    <div className="flex flex-col gap-2xl">
      <div className="flex flex-col gap-xl">
        {briefSections.map((section) => (
          <section className="flex flex-col gap-base" key={section.id}>
            <h2 className="font-medium text-14 text-foreground leading-120">
              {section.title}
            </h2>
            <p className="text-14 text-foreground-muted leading-160">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <TimelineView items={timelineItems} />
    </div>
  );

  const transcriptContent = (
    <TranscriptView callDuration={callDuration} messages={transcript} />
  );

  return (
    <PageContent
      header={
        <PageHeaderDetail
          current={issue.address ?? "No address"}
          onBack={() => router.push("/issues")}
          onNext={
            adjacent.next
              ? () => router.push(`/issues/${adjacent.next}`)
              : undefined
          }
          onPrev={
            adjacent.prev
              ? () => router.push(`/issues/${adjacent.prev}`)
              : undefined
          }
          parent="Open Issues"
        />
      }
      variant="detail"
    >
      <div className="flex min-h-0 flex-1 gap-md overflow-hidden pr-md pb-md">
        <section className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-surface shadow-subtle">
          <div className="mx-auto flex min-h-full w-full max-w-content flex-col px-lg py-xl">
            <TabbedContent
              className="gap-xl"
              tabs={[
                {
                  value: "details",
                  label: "Details",
                  content: detailsContent,
                },
                {
                  value: "transcript",
                  label: "Call Transcript",
                  content: transcriptContent,
                },
              ]}
            />
            <div className="mt-auto pt-3xl">
              <UpdateComposer
                mediaDisabled
                onSend={() => {
                  void sendUpdate();
                }}
                onValueChange={setUpdate}
                value={update}
              />
            </div>
          </div>
        </section>
        <aside className="flex w-side-panel-narrow shrink-0 flex-col gap-base overflow-y-auto">
          <div className="flex flex-col gap-xl rounded-lg border border-border bg-surface p-lg shadow-subtle">
            <h2 className="font-medium text-16 text-foreground leading-120">
              Issue Status
            </h2>
            <div className="flex flex-col gap-lg text-14 leading-120">
              <DropdownMenu
                trigger={
                  <DropdownTrigger
                    className="w-full justify-start"
                    leadingIcon={statusIcon(issue.status)}
                  >
                    {statusLabel(issue.status)}
                  </DropdownTrigger>
                }
              >
                {statusOrder.map((status) => (
                  <DropdownOption
                    icon={statusIcon(status)}
                    key={status}
                    onSelect={() => {
                      if (status !== issue.status) {
                        void updateStatus({ id: issue._id, status });
                      }
                    }}
                    selected={status === issue.status}
                  >
                    {statusLabel(status)}
                  </DropdownOption>
                ))}
              </DropdownMenu>
              <TextInput
                aria-label="Contractor"
                leadingIcon={<Icon name="contact" size="md" />}
                onBlur={() => {
                  void saveContractor();
                }}
                onChange={(event) => setContractorName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Add contractor"
                value={contractorName}
                wrapperClassName="w-full"
              />
              <TextInput
                aria-label="Date work scheduled for"
                leadingIcon={<Icon name="calendar" size="md" />}
                onChange={(event) => {
                  const next = event.target.value;
                  setScheduledDate(next);
                  void saveScheduledDate(next);
                }}
                title={
                  scheduledDate ? formatScheduledDate(scheduledDate) : undefined
                }
                type="date"
                value={scheduledDate}
                wrapperClassName="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xl rounded-lg border border-border bg-surface p-lg shadow-subtle">
            <div className="flex items-center justify-between gap-md">
              <h2 className="font-medium text-16 text-foreground leading-120">
                Tenant Details
              </h2>
              <IconButton
                aria-label="Copy tenant details"
                className="shrink-0"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  void copyTenantDetails();
                }}
                size="sm"
              />
            </div>
            <div className="flex flex-col gap-lg text-14 text-foreground-muted leading-120">
              <Inline icon={<Icon name="home" size="md" />}>
                {issue.address ?? "No address"}
              </Inline>
              <Inline icon={<Icon name="user" size="md" />}>
                {issue.contactName ?? "No contact name"}
              </Inline>
              <Inline icon={<Icon name="phone" size="md" />}>
                {contactPhoneHref ? (
                  <a
                    className="text-foreground underline-offset-2 hover:underline"
                    href={contactPhoneHref}
                  >
                    {contactPhone}
                  </a>
                ) : (
                  "No phone number"
                )}
              </Inline>
              <Inline icon={<Icon name="email" size="md" />}>
                {contactEmailHref ? (
                  <a
                    className="text-foreground underline-offset-2 hover:underline"
                    href={contactEmailHref}
                  >
                    {contactEmail}
                  </a>
                ) : (
                  "No email"
                )}
              </Inline>
            </div>
          </div>
        </aside>
      </div>
    </PageContent>
  );
}
