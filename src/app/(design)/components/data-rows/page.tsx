import {
  ComponentBlock,
  PageHeader,
} from "@/app/(design)/components/_shared/helpers";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { DetailRow } from "@/components/ui/detail-row";
import { Icon } from "@/components/ui/icon";
import { LabelSmall } from "@/components/ui/label-small";
import { TableHead, TableHeader } from "@/components/ui/table-header";
import { TableCell, TableRow } from "@/components/ui/table-row";
import { TimelineEvent } from "@/components/ui/timeline-event";

export default function DataRowsPage() {
  return (
    <>
      <PageHeader
        description="Rows, cells, detail rows, chat bubbles, and timeline events."
        title="Data Rows"
      />

      <ComponentBlock
        description="Column labels row with bottom border. Compose with TableHead cells."
        label="Table Header"
      >
        <TableHeader>
          <TableHead className="w-40">Date</TableHead>
          <TableHead className="w-48">Agent</TableHead>
          <TableHead className="w-32">Duration</TableHead>
          <TableHead className="w-48">Address</TableHead>
          <TableHead className="flex-1">Pass / Fail</TableHead>
        </TableHeader>
      </ComponentBlock>

      <ComponentBlock
        description="Icon + label. Used inside Status / Details cards. Placeholder state shows a greyed-out 'Add X' affordance."
        label="Detail Row"
      >
        <div className="flex w-80 flex-col">
          <DetailRow icon={<Icon name="home" size="sm" />}>
            59 Wakefield Road, HX3 8AQ
          </DetailRow>
          <DetailRow icon={<Icon name="phone" size="sm" />}>
            07729 420529
          </DetailRow>
          <DetailRow icon={<Icon name="user" size="sm" />} state="placeholder">
            Unassigned
          </DetailRow>
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Transcript speech bubble. Incoming = grey left. Outgoing = white-with-border right."
        label="Chat Bubble"
      >
        <div className="flex flex-col gap-md">
          <div className="flex">
            <ChatBubble variant="incoming">
              Hi, Relocate Property management how can I help you?
            </ChatBubble>
          </div>
          <div className="flex justify-end">
            <ChatBubble variant="outgoing">
              Oh, hi. Yeah, I&apos;d like to report, um, a rat in my kitchen.
            </ChatBubble>
          </div>
          <div className="flex">
            <ChatBubble variant="incoming">
              Right, okay. That sounds unpleasant. Can I get your name please?
            </ChatBubble>
          </div>
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Data row for tables. Default / Hover / Selected states. Compose with TableCell + Label inside cells."
        label="Table Row"
      >
        <div className="overflow-hidden rounded-md border border-border">
          <TableHeader>
            <TableHead className="w-40">Date</TableHead>
            <TableHead className="w-48">Agent</TableHead>
            <TableHead className="w-24">Duration</TableHead>
            <TableHead className="w-48">Address</TableHead>
            <TableHead className="flex-1">Pass / Fail</TableHead>
          </TableHeader>
          <TableRow>
            <TableCell className="w-40">22nd April 2026</TableCell>
            <TableCell className="w-48">Property Management</TableCell>
            <TableCell className="w-24">1:28</TableCell>
            <TableCell className="w-48">59 Wakefield Rd</TableCell>
            <TableCell className="flex-1">
              <LabelSmall variant="success">Pass</LabelSmall>
            </TableCell>
          </TableRow>
          <TableRow selected>
            <TableCell className="w-40">22nd April 2026</TableCell>
            <TableCell className="w-48">Property Management</TableCell>
            <TableCell className="w-24">1:28</TableCell>
            <TableCell className="w-48">59 Wakefield Rd</TableCell>
            <TableCell className="flex-1">
              <LabelSmall variant="success">Pass</LabelSmall>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="w-40">22nd April 2026</TableCell>
            <TableCell className="w-48">Property Management</TableCell>
            <TableCell className="w-24">1:28</TableCell>
            <TableCell className="w-48">59 Wakefield Rd</TableCell>
            <TableCell className="flex-1">
              <LabelSmall variant="destructive">Failed</LabelSmall>
            </TableCell>
          </TableRow>
        </div>
        <p className="mt-md text-12 text-foreground-subtle">
          Hover any row for the hover state. The middle row is{" "}
          <code>selected</code>.
        </p>
      </ComponentBlock>

      <ComponentBlock
        description="Single event row. Avatar-led shows user name + body. Icon-led shows coloured icon tile + inline title/timestamp."
        label="Timeline Event"
      >
        <div className="flex flex-col gap-lg">
          <TimelineEvent
            authorAlt="Teresa"
            authorName="Teresa"
            body="Reached out to Steve from Union Plumbing"
            timestamp="2 days ago"
            variant="avatar-led"
          />
          <TimelineEvent
            icon={<Icon name="phone" size="sm" />}
            timestamp="2 days ago"
            title="Tenant reported issue"
            tone="purple"
            variant="icon-led"
          />
          <TimelineEvent
            icon={<Icon name="calendar" size="sm" />}
            timestamp="1 day ago"
            title="Issue scheduled"
            tone="orange"
            variant="icon-led"
          />
        </div>
      </ComponentBlock>
    </>
  );
}
