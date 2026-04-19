"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/composed/search-input";
import { PageHeader } from "@/components/composed/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/composed/accordion";
import { IssueListRow } from "@/components/features/issue-list-row";
import {
  IssueDetailPanel,
  type IssueDetail,
  type IssueStatus,
} from "@/components/features/issue-detail-panel";

interface Issue {
  id: string;
  address: string;
  description: string;
  timestamp: string;
  emergency?: boolean;
  detail: IssueDetail;
}

interface IssueGroup {
  status: IssueStatus;
  label: string;
  issues: Issue[];
}

const description =
  "The user contacted Relocate Property Management to report a boiler issue. The agent acknowledged the problem, but the user interrupted. The agent then attempted to gather the user's details to proceed.";

const transcript: IssueDetail["transcript"] = [
  { speaker: "agent", text: "Hi, Relocate Property management how can I help you?" },
  { speaker: "caller", text: "Oh, hi. Yeah, I'd like to report, um, a rat in my kitchen." },
  { speaker: "agent", text: "Right, okay. That sounds unpleasant. Can I get your name please?" },
  { speaker: "caller", text: "Yeah, my name's Davo Callaghan." },
  {
    speaker: "agent",
    text: "Thanks, one moment. So you're at fifty nine Wakefield Road, Hipperholme, Halifax, is that right?...",
  },
  { speaker: "caller", text: "Yes that's right" },
  { speaker: "agent", text: "Right, so it is in the kitchen. When did you..." },
];

const detail = (id: string, status: IssueStatus): IssueDetail => ({
  id,
  address: "59 Wakefield Road HX4 8AQ",
  contactName: "Dave O'Callaghan",
  contactNumber: "07729420529",
  status,
  body: "Dave reported a broken hot tap. The issue started on weds 16th April, but hot water is available elsewhere in the property.",
  audio: { durationLabel: "1:24" },
  transcript,
});

const groups: IssueGroup[] = [
  {
    status: "new",
    label: "New Issue",
    issues: [
      {
        id: "new-1",
        address: "59 Wakefield Road HX3 8AQ",
        description,
        timestamp: "10:30am",
        emergency: true,
        detail: detail("new-1", "new"),
      },
      {
        id: "new-2",
        address: "59 Wakefield Road HX3 8AQ",
        description,
        timestamp: "10:30am",
        detail: detail("new-2", "new"),
      },
    ],
  },
  {
    status: "in-progress",
    label: "In Progress",
    issues: [
      { id: "ip-1", address: "59 Wakefield Road HX3 8AQ", description, timestamp: "10:30am", detail: detail("ip-1", "in-progress") },
      { id: "ip-2", address: "59 Wakefield Road HX3 8AQ", description, timestamp: "10:30am", detail: detail("ip-2", "in-progress") },
      { id: "ip-3", address: "59 Wakefield Road HX3 8AQ", description, timestamp: "10:30am", emergency: true, detail: detail("ip-3", "in-progress") },
      { id: "ip-4", address: "59 Wakefield Road HX3 8AQ", description, timestamp: "10:30am", detail: detail("ip-4", "in-progress") },
    ],
  },
  {
    status: "contractor-scheduled",
    label: "Contractor Scheduled",
    issues: [
      { id: "cs-1", address: "59 Wakefield Road HX3 8AQ", description, timestamp: "10:30am", detail: detail("cs-1", "contractor-scheduled") },
      { id: "cs-2", address: "59 Wakefield Road HX3 8AQ", description, timestamp: "10:30am", detail: detail("cs-2", "contractor-scheduled") },
    ],
  },
  { status: "awaiting-follow-up", label: "Awaiting Follow up", issues: [] },
  { status: "closed", label: "Closed", issues: [] },
];

export default function OpenIssuesPage() {
  const flatIssues = useMemo(() => groups.flatMap((g) => g.issues), []);

  const [selectedId, setSelectedId] = useState<string | null>("new-1");
  const [checked, setChecked] = useState<Set<string>>(new Set(["new-1"]));
  const [panelOpen, setPanelOpen] = useState(false);

  const toggleChecked = (id: string, isChecked: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (isChecked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const openIssue = (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
  };

  const currentIndex = selectedId
    ? flatIssues.findIndex((i) => i.id === selectedId)
    : -1;
  const selectedIssue = currentIndex >= 0 ? flatIssues[currentIndex] : null;

  const goPrev = () => {
    if (currentIndex > 0) setSelectedId(flatIssues[currentIndex - 1].id);
  };
  const goNext = () => {
    if (currentIndex >= 0 && currentIndex < flatIssues.length - 1) {
      setSelectedId(flatIssues[currentIndex + 1].id);
    }
  };

  return (
    <>
      <PageHeader
        title="Open Issues"
        actions={<SearchInput wrapperClassName="w-53" placeholder="Search" />}
      />
      <div className="flex flex-1 justify-center overflow-y-auto px-4 py-4">
        <div className="flex w-full max-w-content flex-col gap-4">
          <Accordion
            type="multiple"
            defaultValue={["new", "in-progress", "contractor-scheduled"]}
            className="flex flex-col gap-4"
          >
            {groups.map((group) => (
              <AccordionItem
                key={group.status}
                value={group.status}
                className="rounded-lg border-border-strong"
              >
                <AccordionTrigger className="bg-subtle px-5 py-2.5 h-auto data-[state=open]:border-border-strong">
                  {group.label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1 px-2 py-2">
                    {group.issues.map((issue) => (
                      <IssueListRow
                        key={issue.id}
                        address={issue.address}
                        description={issue.description}
                        timestamp={issue.timestamp}
                        badge={
                          issue.emergency ? (
                            <Badge tone="danger" variant="solid">
                              Emergency
                            </Badge>
                          ) : null
                        }
                        selected={selectedId === issue.id}
                        checked={checked.has(issue.id)}
                        onCheckedChange={(isChecked) =>
                          toggleChecked(issue.id, isChecked)
                        }
                        onClick={() => openIssue(issue.id)}
                        className={
                          selectedId === issue.id
                            ? "rounded-md bg-info-soft/30 shadow-sm cursor-pointer"
                            : "rounded-md border-b-0 cursor-pointer"
                        }
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <IssueDetailPanel
        issue={selectedIssue?.detail ?? null}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onPrevious={goPrev}
        onNext={goNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex >= 0 && currentIndex < flatIssues.length - 1}
      />
    </>
  );
}
