"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Avatar as RadixAvatar } from "radix-ui";
import { type ReactNode, use, useMemo, useState } from "react";
import { PageContent } from "@/components/patterns/app-shell";
import { PageHeaderDetail } from "@/components/patterns/page-header-detail";
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
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type IssueStatus = Doc<"issues">["status"];
type IssueListItem = Doc<"issues"> & { publicId: string };
type IssueTagType = NonNullable<Doc<"issues">["types"]>[number];
type AssigneeUser = Pick<
  Doc<"users">,
  "_id" | "email" | "firstName" | "imageUrl" | "lastName"
>;
type IssueUpdate = Doc<"issueUpdates"> & {
  author?: Doc<"users"> | null;
  canManage?: boolean;
};

const statusOrder: IssueStatus[] = [
  "new",
  "in-progress",
  "scheduled",
  "awaiting-follow-up",
  "closed",
];

const typeFilters: Array<{
  id: IssueTagType;
  label: string;
  dotClassName: string;
  chipClassName: string;
}> = [
  {
    id: "rental",
    label: "Rental Issue",
    dotClassName: "bg-[#6D2AF4]",
    chipClassName: "bg-[#F8F5FF] text-[#4E1FAD]",
  },
  {
    id: "valuation",
    label: "Valuation Request",
    dotClassName: "bg-blue-300",
    chipClassName: "bg-blue-100 text-blue-400",
  },
  {
    id: "viewing",
    label: "Book a Viewing",
    dotClassName: "bg-[#F47E2A]",
    chipClassName: "bg-[#FFF9F5] text-[#AD5A1F]",
  },
  {
    id: "emergency",
    label: "Rental Emergency",
    dotClassName: "bg-[#F42A31]",
    chipClassName: "bg-[#FFF5F5] text-[#AD1F23]",
  },
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

function formatCallTime(value: number): string {
  const date = new Date(value);
  const day = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  });
  return `${day}, ${time}`;
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
      return "Unassigned";
    case "in-progress":
      return "In Progress";
    case "scheduled":
      return "Scheduled";
    case "awaiting-follow-up":
      return "Awaiting Response";
    case "closed":
      return "Closed";
  }
}

function statusIcon(status: IssueStatus, size: "sm" | "md" | "lg" = "md") {
  const name =
    status === "new"
      ? "status-new"
      : status === "in-progress"
        ? "status-in-progress"
        : status === "scheduled"
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
    value === "scheduled" ||
    value === "awaiting-follow-up" ||
    value === "closed"
  );
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

function assigneeDisplayName(user: AssigneeUser | null | undefined): string {
  if (!user) return "Unassigned";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email;
}

function assigneeInitials(user: AssigneeUser | null | undefined): string {
  if (!user) return "";
  const names = [user.firstName, user.lastName].filter(Boolean);
  const initials =
    names.length > 0
      ? names.map((name) => name?.[0] ?? "").join("")
      : user.email[0];
  return (initials ?? "").slice(0, 2).toUpperCase();
}

function AssigneeAvatar({
  user,
  className,
}: {
  user: AssigneeUser | null | undefined;
  className?: string;
}) {
  const label = assigneeDisplayName(user);
  return (
    <RadixAvatar.Root
      className={cn(
        "inline-flex size-6 shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-border bg-border align-middle",
        className,
      )}
    >
      {user?.imageUrl ? (
        <RadixAvatar.Image
          alt={label}
          className="size-full object-cover"
          src={user.imageUrl}
        />
      ) : null}
      <RadixAvatar.Fallback
        aria-label={label}
        className="flex size-full items-center justify-center bg-purple-100 font-medium text-10 text-purple-300 leading-none"
        delayMs={0}
      >
        {user ? assigneeInitials(user) : <Icon name="user" size="sm" />}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

function getTypes(issue: Doc<"issues">): IssueTagType[] {
  return issue.types?.length ? Array.from(new Set(issue.types)) : [];
}

function TypeBadges({ types }: { types: IssueTagType[] }) {
  const filters = types.flatMap((type) => {
    const filter = typeFilters.find((item) => item.id === type);
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

function DetailRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-row items-center">
      <span className="w-[160px] shrink-0 font-medium text-13 text-foreground-muted leading-120">
        {label}
      </span>
      <div className="flex size-6 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div className="ml-lg flex min-w-0 flex-1 items-center">{children}</div>
    </div>
  );
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
  assigneesById?: Map<string, AssigneeUser>,
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
    | {
        to?: IssueStatus | string | null;
        toName?: string | null;
        toImageUrl?: string | null;
      }
    | undefined;
  const status = isIssueStatus(metadata?.to) ? metadata.to : undefined;
  const isCreated = item.kind === "created_from_call";
  if (item.kind === "assignee_change") {
    const assigneeUser =
      typeof metadata?.to === "string"
        ? assigneesById?.get(metadata.to)
        : undefined;
    const assignee =
      metadata?.toName?.trim() ||
      (assigneeUser ? assigneeDisplayName(assigneeUser) : null);
    const assigneeImageUrl = metadata?.toImageUrl ?? assigneeUser?.imageUrl;
    return {
      id: item._id,
      variant: "icon-led",
      title: assignee ? `Assigned to ${assignee}` : "Assignee cleared",
      timestamp: formatTimelineTime(item._creationTime),
      tone: "purple",
      icon: <Icon name="user" size="sm" />,
      iconImageSrc: assignee ? (assigneeImageUrl ?? undefined) : undefined,
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
  const assignableUsers = useQuery(api.users.listAssignable);
  const addComment = useMutation(api.issueUpdates.addComment);
  const editComment = useMutation(api.issueUpdates.editComment);
  const deleteComment = useMutation(api.issueUpdates.deleteComment);
  const updateStatus = useMutation(api.issues.updateStatus);
  const updateAssignee = useMutation(api.issues.updateAssignee);
  const [update, setUpdate] = useState("");
  const [editingUpdateId, setEditingUpdateId] =
    useState<Id<"issueUpdates"> | null>(null);
  const [editBody, setEditBody] = useState("");

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

  const assignees = assignableUsers ?? [];
  const assigneesById = new Map(
    assignees.map((assignee) => [assignee._id, assignee]),
  );
  const timelineItems = issue.timeline.map((item) =>
    toPatternTimelineItem(
      item,
      issue.primaryConversation?.occurredAtUnixSecs,
      {
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
      },
      assigneesById,
    ),
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
  const issueTitle =
    issue.brief?.issueTitle?.trim() ||
    issue.summary.trim() ||
    issue.address ||
    "Untitled issue";
  const issueDescription = issue.brief?.details?.trim() || issue.summary;
  const issueTypes = getTypes(issue);
  const callTime = formatCallTime(
    (issue.primaryConversation?.occurredAtUnixSecs ??
      issue._creationTime / 1000) * 1000,
  );
  const selectedAssignee = issue.assignee ?? null;

  const transcriptContent = (
    <div className="flex flex-col gap-xl px-3xl py-xl">
      {transcript.length > 0 ? (
        <TranscriptView callDuration={callDuration} messages={transcript} />
      ) : (
        <p className="text-14 text-foreground-muted leading-160">
          No call description available.
        </p>
      )}
    </div>
  );

  return (
    <PageContent
      header={
        <PageHeaderDetail
          current={issue.address ?? "No address"}
          onBack={() => router.push("/issues")}
          onDelete={() => {
            /* TODO: wire up issue delete */
          }}
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
      <div className="min-h-0 flex-1 pr-md pb-md">
        <div className="flex h-full min-h-0 overflow-hidden rounded-lg border border-border bg-surface shadow-subtle">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-content flex-col">
              <Tabs
                className="flex min-h-0 flex-1 flex-col gap-xl"
                defaultValue="activity"
              >
                <div className="flex flex-col gap-3xl pt-3xl pr-md pl-md">
                  <div className="flex flex-col gap-2xl">
                    <div className="flex flex-col gap-xl">
                      <TypeBadges types={issueTypes} />
                      <h1 className="w-full font-medium text-[24px] text-foreground text-wrap-balance leading-120">
                        {issueTitle}
                      </h1>
                    </div>
                    <p className="w-full whitespace-pre-line font-regular text-14 text-foreground-muted leading-150">
                      {issueDescription}
                    </p>
                  </div>
                  <TabList>
                    <Tab className="first:pl-0" value="activity">
                      Activity
                    </Tab>
                    <Tab value="call-description">Call Description</Tab>
                  </TabList>
                </div>
                <TabPanel
                  className="flex min-h-0 flex-1 flex-col data-[state=active]:flex"
                  value="activity"
                >
                  <div className="min-h-0 flex-1 overflow-y-auto py-xl pr-md pl-md">
                    <TimelineView items={timelineItems} title={null} />
                  </div>
                  <div className="shrink-0 p-md">
                    <UpdateComposer
                      mediaDisabled
                      onSend={() => {
                        void sendUpdate();
                      }}
                      onValueChange={setUpdate}
                      value={update}
                    />
                  </div>
                </TabPanel>
                <TabPanel
                  className="min-h-0 flex-1 overflow-y-auto"
                  value="call-description"
                >
                  {transcriptContent}
                </TabPanel>
              </Tabs>
            </div>
          </section>
          <aside className="flex w-side-panel-narrow shrink-0 flex-col gap-xl overflow-y-auto overflow-x-hidden border-border border-l py-lg">
            <section className="flex flex-col gap-base pr-lg pl-xl">
              <div className="flex items-center justify-between gap-md">
                <h2 className="flex-1 font-medium text-[15px] text-foreground-muted leading-120">
                  Tenant
                </h2>
                <Button
                  className="shrink-0 px-md py-sm text-12"
                  onClick={() => {
                    void copyTenantDetails();
                  }}
                  trailingIcon={<Icon name="copy" size="sm" />}
                  variant="secondary"
                >
                  Copy
                </Button>
              </div>
              <div className="flex flex-col gap-base font-regular text-13 text-foreground leading-120">
                <p>{issue.contactName ?? "No contact name"}</p>
                <p>{issue.address ?? "No address"}</p>
                <p>
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
                </p>
                <p>
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
                </p>
              </div>
            </section>
            <div
              aria-hidden="true"
              className="h-[length:var(--border-hairline)] w-full bg-border"
            />
            <section className="flex flex-col gap-[20px] pr-lg pl-xl">
              <h2 className="font-medium text-[15px] text-foreground-muted leading-120">
                Details
              </h2>
              <div className="flex flex-col gap-lg">
                <DetailRow
                  icon={<Icon name="clock" size="lg" />}
                  label="Call time"
                >
                  <span className="truncate font-regular text-13 text-foreground leading-120">
                    {callTime}
                  </span>
                </DetailRow>
                <DetailRow
                  icon={statusIcon(issue.status, "lg")}
                  label="Status"
                >
                  <DropdownMenu
                    className="w-72"
                    trigger={
                      <DropdownTrigger className="m-0 flex h-auto w-full justify-between whitespace-nowrap border-0 bg-transparent p-0 font-regular text-13 text-foreground leading-120 hover:bg-transparent data-[state=open]:bg-transparent [&>span]:whitespace-nowrap">
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
                </DetailRow>
                <DetailRow
                  icon={
                    <AssigneeAvatar
                      className="size-6"
                      user={selectedAssignee}
                    />
                  }
                  label="Assignee"
                >
                  <DropdownMenu
                    className="w-72"
                    trigger={
                      <DropdownTrigger className="m-0 flex h-auto w-full justify-between whitespace-nowrap border-0 bg-transparent p-0 font-regular text-13 text-foreground leading-120 hover:bg-transparent data-[state=open]:bg-transparent [&>span]:whitespace-nowrap">
                        {assigneeDisplayName(selectedAssignee)}
                      </DropdownTrigger>
                    }
                  >
                    <DropdownOption
                      icon={<AssigneeAvatar user={null} />}
                      onSelect={() => {
                        if (issue.assigneeUserId) {
                          void updateAssignee({
                            id: issue._id,
                            assigneeUserId: null,
                          });
                        }
                      }}
                      selected={!issue.assigneeUserId}
                    >
                      Unassigned
                    </DropdownOption>
                    {assignees.map((assignee) => (
                      <DropdownOption
                        icon={<AssigneeAvatar user={assignee} />}
                        key={assignee._id}
                        onSelect={() => {
                          if (assignee._id !== issue.assigneeUserId) {
                            void updateAssignee({
                              id: issue._id,
                              assigneeUserId: assignee._id,
                            });
                          }
                        }}
                        selected={assignee._id === issue.assigneeUserId}
                      >
                        {assigneeDisplayName(assignee)}
                      </DropdownOption>
                    ))}
                  </DropdownMenu>
                </DetailRow>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
