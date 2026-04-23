"use client";

import { FilterChip } from "@/components/composed/filter-chip";
import { MetricCard, MetricCardGroup } from "@/components/composed/metric-card";
import { SearchInput } from "@/components/composed/search-input";
import { SectionBlock } from "@/components/composed/section-block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/composed/table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { IconCalendar } from "@/components/ui/icons";

type CallStatus = "success" | "failed";

interface CallLog {
  id: string;
  date: string;
  agent: string;
  duration: string;
  status: CallStatus;
}

const logs: CallLog[] = [
  {
    id: "1",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "2",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "3",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "4",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "5",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "6",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "7",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "8",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "9",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "failed",
  },
  {
    id: "10",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "11",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "12",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
  {
    id: "13",
    date: "Apr 18, 2026, 11:31 AM",
    agent: "Property Management",
    duration: "1:59",
    status: "success",
  },
];

const statusTone: Record<CallStatus, BadgeTone> = {
  success: "success",
  failed: "danger",
};

const statusLabel: Record<CallStatus, string> = {
  success: "Success",
  failed: "Failed",
};

export default function CallLogsPage() {
  return (
    <div className="flex flex-1 justify-center overflow-y-auto px-4 py-4">
      <div className="flex w-full max-w-content flex-col gap-6">
        <SectionBlock
          action={
            <div className="flex items-center gap-2">
              <SearchInput placeholder="Search" wrapperClassName="w-53" />
              <FilterChip icon={<IconCalendar />} label="This week" />
            </div>
          }
          title={<span className="text-lg">Overview</span>}
        >
          <MetricCardGroup>
            <MetricCard label="Calls" value={24} />
            <MetricCard label="Issues Recorded" value={23} />
            <MetricCard label="Open Issues" value={4} />
            <MetricCard label="Pass Rate" value="96%" />
          </MetricCardGroup>
        </SectionBlock>

        <SectionBlock title={<span className="text-base">Logs</span>}>
          <Table>
            <TableHeader>
              <TableRow interactive={false}>
                <TableHead className="w-[280px]">Date</TableHead>
                <TableHead className="w-[320px]">Agent</TableHead>
                <TableHead className="w-[280px]">Duration</TableHead>
                <TableHead>Call Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.agent}
                  </TableCell>
                  <TableCell>{log.duration}</TableCell>
                  <TableCell>
                    <Badge tone={statusTone[log.status]}>
                      {statusLabel[log.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBlock>
      </div>
    </div>
  );
}
