"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  ButtonGroup,
  ButtonGroupItem,
} from "@/components/composed/button-group";
import { SearchInput } from "@/components/composed/search-input";
import { FormField } from "@/components/composed/form-field";
import { FilterChip } from "@/components/composed/filter-chip";
import { MenuItem } from "@/components/composed/menu-item";
import { MenuSection } from "@/components/composed/menu-section";
import {
  MetricCard,
  MetricCardGroup,
} from "@/components/composed/metric-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/composed/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/composed/accordion";
import { AudioPlayer } from "@/components/composed/audio-player";
import { PageHeader } from "@/components/composed/page-header";
import { SectionBlock } from "@/components/composed/section-block";
import {
  SidePanel,
  SidePanelBody,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTrigger,
} from "@/components/composed/side-panel";
import { Toast } from "@/components/composed/toast";
import { EmptyState } from "@/components/composed/empty-state";
import { SidebarHeader } from "@/components/features/sidebar-header";
import { IssueListRow } from "@/components/features/issue-list-row";
import {
  TranscriptBubble,
  TranscriptList,
  TranscriptRow,
} from "@/components/features/transcript";
import {
  IconAddImage,
  IconArchive,
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCalendar,
  IconCallIncoming,
  IconCheck,
  IconCircleAlert,
  IconClose,
  IconContact,
  IconCopy,
  IconEmail,
  IconFilter,
  IconInbox,
  IconNote,
  IconPause,
  IconPlay,
  IconSearch,
  IconSettings,
  IconUploadMedia,
} from "@/components/ui/icons";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="flex flex-col gap-6 scroll-mt-6 border-t border-border pt-8"
    >
      <h2 className="text-2xl font-medium leading-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Example({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </div>
  );
}

export default function ComponentsPreviewPage() {
  const [checkedOne, setCheckedOne] = useState(false);
  const [checkedTwo, setCheckedTwo] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(1);
  const [playing, setPlaying] = useState(false);

  return (
    <TooltipProvider>
      <main className="min-h-dvh bg-muted px-8 pb-24 pt-12 text-foreground">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
          <header className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              Design System · Reloc8 Properties
            </div>
            <h1 className="text-2xl font-medium leading-tight">Components</h1>
            <p className="max-w-prose text-sm text-muted-foreground leading-normal">
              Runtime preview of every component in the library. Mirrors the
              Paper Components page.
            </p>
          </header>

          <Section id="atoms" title="01 · Atoms">
            <Example label="Avatar">
              <Avatar size="sm" initials="DO" />
              <Avatar size="md" initials="DO" />
              <Avatar
                size="md"
                initials="R8"
                style={{ backgroundColor: "#3dd8cf", color: "#1f1f1f" }}
              />
            </Example>
            <Example label="Badge — soft">
              <Badge tone="success">Success</Badge>
              <Badge tone="danger">Emergency</Badge>
              <Badge tone="info">Info</Badge>
              <Badge tone="neutral">Neutral</Badge>
            </Example>
            <Example label="Badge — solid">
              <Badge tone="success" variant="solid">
                Success
              </Badge>
              <Badge tone="danger" variant="solid">
                Emergency
              </Badge>
              <Badge tone="info" variant="solid">
                Info
              </Badge>
              <Badge tone="neutral" variant="solid">
                Neutral
              </Badge>
            </Example>
            <Example label="Checkbox">
              <Checkbox
                checked={checkedOne}
                onChange={(e) => setCheckedOne(e.currentTarget.checked)}
                label="Interactive"
              />
              <Checkbox
                checked={checkedTwo}
                onChange={(e) => setCheckedTwo(e.currentTarget.checked)}
                label="Checked"
              />
              <Checkbox disabled label="Disabled" />
            </Example>
            <Example label="Divider">
              <div className="flex w-60 flex-col gap-2">
                <Divider />
                <span className="text-xs text-subtle-foreground">
                  Horizontal
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Divider orientation="vertical" className="h-8" />
                <span className="text-xs text-subtle-foreground">Vertical</span>
              </div>
            </Example>
          </Section>

          <Section id="buttons" title="02 · Buttons">
            <Example label="Primary — states">
              <Button>Copy details</Button>
              <Button className="bg-info-foreground">Hover</Button>
              <Button disabled>Disabled</Button>
            </Example>
            <Example label="Primary — sizes">
              <Button size="sm">Small</Button>
              <Button>Medium</Button>
              <Button size="lg">Large</Button>
            </Example>
            <Example label="Secondary">
              <Button variant="secondary">Upload media</Button>
              <Button variant="secondary" className="bg-subtle">
                Hover
              </Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </Example>
            <Example label="Ghost">
              <Button variant="ghost">Cancel</Button>
              <Button variant="ghost" className="bg-subtle">
                Hover
              </Button>
              <Button variant="ghost" disabled>
                Disabled
              </Button>
            </Example>
            <Example label="Icon Button">
              <IconButton aria-label="Close" icon={<IconClose />} />
              <IconButton
                aria-label="Close"
                icon={<IconClose />}
                className="bg-subtle"
              />
              <IconButton
                variant="ghost"
                aria-label="Close"
                icon={<IconClose />}
              />
              <IconButton
                variant="ghost"
                aria-label="Close"
                icon={<IconClose />}
                className="bg-subtle"
              />
              <IconButton aria-label="Close" icon={<IconClose />} disabled />
            </Example>
            <Example label="Button Group">
              <ButtonGroup>
                <ButtonGroupItem aria-label="Previous" icon={<IconArrowUp />} />
                <ButtonGroupItem aria-label="Next" icon={<IconArrowDown />} />
              </ButtonGroup>
            </Example>
          </Section>

          <Section id="inputs" title="03 · Inputs & Form Controls">
            <Example label="Text Input">
              <Input
                wrapperClassName="w-60"
                placeholder="Add a contractor name"
              />
              <Input
                wrapperClassName="w-60"
                defaultValue="John Mason Plumbing"
              />
              <Input
                wrapperClassName="w-60"
                defaultValue="not-an-email"
                invalid
              />
              <Input
                wrapperClassName="w-60"
                defaultValue="Locked field"
                disabled
              />
            </Example>
            <Example label="Search Input">
              <SearchInput wrapperClassName="w-53" placeholder="Search" />
              <SearchInput
                wrapperClassName="w-53"
                defaultValue="Wakefield"
                trailingSlot={<IconClose />}
              />
            </Example>
            <Example label="Select">
              <Select>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="New Issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Issue</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">
                    Contractor Scheduled
                  </SelectItem>
                  <SelectItem value="follow-up">Awaiting Follow up</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </Example>
            <Example label="Form Field">
              <FormField label="Status" className="w-83">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="New Issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Issue</SelectItem>
                    <SelectItem value="progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Assigned to"
                helper="Optional — leave blank if no contractor is scheduled yet."
                className="w-83"
              >
                <Input placeholder="Add a contractor name" />
              </FormField>
              <FormField
                label="Contact number"
                error="Enter a complete UK phone number."
                className="w-83"
              >
                <Input defaultValue="07729" />
              </FormField>
            </Example>
            <Example label="Filter Chip">
              <FilterChip icon={<IconCalendar />} label="This week" />
              <FilterChip icon={<IconCalendar />} label="This week" active />
            </Example>
          </Section>

          <Section id="navigation" title="04 · Navigation">
            <Example label="Sidebar Header">
              <div className="w-56 rounded-md border border-border bg-background p-2">
                <SidebarHeader />
              </div>
            </Example>
            <Example label="Menu Item">
              <div className="flex w-56 flex-col gap-2">
                <MenuItem icon={<IconInbox />} label="Open Issues" />
                <MenuItem icon={<IconCallIncoming />} label="Call Logs" />
                <MenuItem icon={<IconInbox />} label="Open Issues" active />
                <MenuItem icon={<IconArchive />} label="Properties" disabled />
              </div>
            </Example>
            <Example label="Menu Section">
              <div className="w-56 rounded-md border border-border bg-background p-2">
                <MenuSection label="Calls">
                  <MenuItem icon={<IconInbox />} label="Open Issues" active />
                  <MenuItem icon={<IconCallIncoming />} label="Call Logs" />
                </MenuSection>
              </div>
            </Example>
            <Example label="Tabs — text">
              <Tabs defaultValue="overview" className="w-90">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-3 text-sm">
                  Overview content
                </TabsContent>
                <TabsContent value="notes" className="pt-3 text-sm">
                  Notes content
                </TabsContent>
                <TabsContent value="history" className="pt-3 text-sm">
                  History content
                </TabsContent>
              </Tabs>
            </Example>
            <Example label="Tabs — with icon">
              <Tabs defaultValue="list" className="w-90">
                <TabsList>
                  <TabsTrigger value="list">
                    <IconInbox />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="board">
                    <IconArchive />
                    Board View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Example>
          </Section>

          <Section id="data-display" title="05 · Data Display">
            <Example label="Metric Card">
              <MetricCardGroup className="w-full max-w-[1168px]">
                <MetricCard label="Calls" value={24} />
                <MetricCard label="Issues Recorded" value={23} />
                <MetricCard label="Open Issues" value={4} />
                <MetricCard label="Pass Rate" value="96%" />
              </MetricCardGroup>
            </Example>
            <Example label="Table">
              <Table className="w-full max-w-[1168px]">
                <TableHeader>
                  <TableRow interactive={false}>
                    <TableHead>Date</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Call Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Apr 18, 2026, 11:31 AM</TableCell>
                    <TableCell className="text-muted-foreground">
                      Property Management
                    </TableCell>
                    <TableCell>1:59</TableCell>
                    <TableCell>
                      <Badge tone="success">Success</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Apr 18, 2026, 10:14 AM</TableCell>
                    <TableCell className="text-muted-foreground">
                      Property Management
                    </TableCell>
                    <TableCell>0:47</TableCell>
                    <TableCell>
                      <Badge tone="danger">Failed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Apr 17, 2026, 4:02 PM</TableCell>
                    <TableCell className="text-muted-foreground">
                      Property Management
                    </TableCell>
                    <TableCell>2:21</TableCell>
                    <TableCell>
                      <Badge tone="success">Success</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Example>
            <Example label="List Row (Issue)">
              <div className="w-full max-w-[1168px] rounded-md border border-border bg-background overflow-hidden">
                {[0, 1, 2].map((i) => (
                  <IssueListRow
                    key={i}
                    address={`59 Wakefield Road HX${i + 3} 8AQ`}
                    description="The user contacted Reloc8 Property Management to report a boiler issue. The agent acknowledged the problem…"
                    timestamp="10:30am"
                    badge={
                      i === 1 ? (
                        <Badge tone="danger" variant="solid">
                          Emergency
                        </Badge>
                      ) : null
                    }
                    selected={selectedIssue === i}
                    onClick={() => setSelectedIssue(i)}
                  />
                ))}
              </div>
            </Example>
            <Example label="Accordion">
              <Accordion
                type="multiple"
                defaultValue={["new"]}
                className="flex w-full max-w-[1168px] flex-col gap-3"
              >
                <AccordionItem value="new">
                  <AccordionTrigger count={2}>New Issue</AccordionTrigger>
                  <AccordionContent>
                    <IssueListRow
                      address="59 Wakefield Road HX4 8AQ"
                      description="Broken hot tap, started Wed 16th April. Hot water available elsewhere in property."
                      timestamp="10:30am"
                    />
                    <IssueListRow
                      address="12 Beech Avenue LS1 3BX"
                      description="Tenant reports a draft through a ground-floor window seal. Photos attached."
                      timestamp="09:12am"
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="follow-up">
                  <AccordionTrigger count={5}>
                    Awaiting Follow up
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                      Empty example body.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Example>
            <Example label="Audio Player">
              <div className="w-172">
                <AudioPlayer
                  playing={playing}
                  currentTime={playing ? "0:42" : "0:00"}
                  duration="1:24"
                  progress={playing ? 0.5 : 0}
                  onPlayPauseClick={() => setPlaying((p) => !p)}
                />
              </div>
            </Example>
            <Example label="Transcript">
              <div className="flex items-start gap-8">
                <TranscriptBubble speaker="agent" meta="Agent · 0:00">
                  Hi, Reloc8 Property Management how can I help you?
                </TranscriptBubble>
                <TranscriptBubble speaker="caller" meta="Caller · 0:06">
                  Oh, hi. Yeah, I&rsquo;d like to report a leak in my kitchen.
                </TranscriptBubble>
              </div>
              <TranscriptList className="w-172">
                <TranscriptRow speaker="agent">
                  Hi, Reloc8 Property Management how can I help you?
                </TranscriptRow>
                <TranscriptRow speaker="caller">
                  Oh, hi. Yeah, I&rsquo;d like to report a rat in my kitchen.
                </TranscriptRow>
                <TranscriptRow speaker="agent">
                  Right, okay. That sounds unpleasant. Can I get your name
                  please?
                </TranscriptRow>
                <TranscriptRow speaker="caller">
                  Yeah, my name&rsquo;s Dave O&rsquo;Callaghan.
                </TranscriptRow>
              </TranscriptList>
            </Example>
          </Section>

          <Section id="layout" title="06 · Layout & Feedback">
            <Example label="Card">
              <Card variant="bordered" className="flex w-80 flex-col gap-3">
                <div className="text-sm text-muted-foreground">Bordered</div>
                <div className="text-base text-foreground leading-normal">
                  Default variant. Use for surfaces that sit on a muted
                  background.
                </div>
              </Card>
              <Card variant="elevated" className="flex w-80 flex-col gap-3">
                <div className="text-sm text-muted-foreground">Elevated</div>
                <div className="text-base text-foreground leading-normal">
                  Shadow variant. Use for overlays, popovers, active menu
                  items.
                </div>
              </Card>
              <Card variant="flat" className="flex w-80 flex-col gap-3">
                <div className="text-sm text-muted-foreground">Flat</div>
                <div className="text-base text-foreground leading-normal">
                  Muted background, no border. Use for grouping inside another
                  surface.
                </div>
              </Card>
            </Example>
            <Example label="Page Header">
              <div className="w-full max-w-[1200px] rounded-md border border-border bg-background overflow-hidden">
                <PageHeader
                  title="Open Issues"
                  actions={
                    <SearchInput wrapperClassName="w-53" placeholder="Search" />
                  }
                />
              </div>
              <div className="w-full max-w-[1200px] rounded-md border border-border bg-background overflow-hidden">
                <PageHeader
                  title="Call Logs · Overview"
                  actions={
                    <>
                      <SearchInput
                        wrapperClassName="w-53"
                        placeholder="Search"
                      />
                      <FilterChip icon={<IconCalendar />} label="This week" />
                    </>
                  }
                />
              </div>
            </Example>
            <Example label="Section Block">
              <SectionBlock
                title="Details"
                action={
                  <a href="#" className="hover:underline">
                    Edit
                  </a>
                }
                className="w-172"
              >
                <Card>
                  <div className="flex flex-col gap-2 text-base text-foreground">
                    <div>Address: 59 Wakefield Road HX4 8AQ</div>
                    <div>Name: Dave O&rsquo;Callaghan</div>
                    <div>Contact Number: 07729 420 529</div>
                  </div>
                </Card>
              </SectionBlock>
            </Example>
            <Example label="Side Panel">
              <SidePanel>
                <SidePanelTrigger asChild>
                  <Button variant="secondary">Open side panel</Button>
                </SidePanelTrigger>
                <SidePanelContent width="720px">
                  <SidePanelHeader
                    title="59 Wakefield Road HX4 8AQ"
                    controls={
                      <ButtonGroup>
                        <ButtonGroupItem
                          aria-label="Previous"
                          icon={<IconArrowUp />}
                        />
                        <ButtonGroupItem
                          aria-label="Next"
                          icon={<IconArrowDown />}
                        />
                      </ButtonGroup>
                    }
                  />
                  <SidePanelBody>
                    <p className="text-sm text-subtle-foreground">
                      Body slot — holds Form Fields, Section Blocks, etc.
                    </p>
                  </SidePanelBody>
                </SidePanelContent>
              </SidePanel>
            </Example>
            <Example label="Toast">
              <Toast icon={<IconCheck strokeWidth={2.5} />} onDismiss={() => {}}>
                Details copied to clipboard.
              </Toast>
              <Toast
                icon={<IconCircleAlert className="text-danger" />}
                onDismiss={() => {}}
              >
                Couldn&rsquo;t save. Try again.
              </Toast>
            </Example>
            <Example label="Tooltip">
              <Tooltip content="Copy details">
                <Button variant="secondary">Hover me</Button>
              </Tooltip>
              <Tooltip content="Search" shortcut="⌘K">
                <Button variant="secondary">With shortcut</Button>
              </Tooltip>
            </Example>
            <Example label="Empty State">
              <EmptyState
                icon={<IconInbox />}
                title="No follow-ups waiting"
                description="Issues that need another call or a check-in will appear here."
                action={<Button variant="secondary">Go to Open Issues</Button>}
              />
            </Example>
          </Section>

          <Section id="misc" title="Icons">
            <div className="grid grid-cols-6 gap-3">
              {[
                ["IconAddImage", IconAddImage],
                ["IconArchive", IconArchive],
                ["IconArrowDown", IconArrowDown],
                ["IconArrowRight", IconArrowRight],
                ["IconArrowUp", IconArrowUp],
                ["IconCalendar", IconCalendar],
                ["IconCallIncoming", IconCallIncoming],
                ["IconCheck", IconCheck],
                ["IconCircleAlert", IconCircleAlert],
                ["IconClose", IconClose],
                ["IconContact", IconContact],
                ["IconCopy", IconCopy],
                ["IconEmail", IconEmail],
                ["IconFilter", IconFilter],
                ["IconInbox", IconInbox],
                ["IconNote", IconNote],
                ["IconPause", IconPause],
                ["IconPlay", IconPlay],
                ["IconSearch", IconSearch],
                ["IconSettings", IconSettings],
                ["IconUploadMedia", IconUploadMedia],
              ].map(([name, Icon]) => {
                const IconComp = Icon as React.ComponentType<{
                  className?: string;
                }>;
                return (
                  <div
                    key={name as string}
                    className="flex flex-col items-center gap-2 rounded-md border border-border bg-background p-3"
                  >
                    <IconComp className="size-5 text-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {name as string}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </main>
    </TooltipProvider>
  );
}

