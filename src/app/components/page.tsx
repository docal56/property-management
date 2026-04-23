"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/composed/accordion";
import { AudioPlayer } from "@/components/composed/audio-player";
import {
  ButtonGroup,
  ButtonGroupItem,
} from "@/components/composed/button-group";
import { EmptyState } from "@/components/composed/empty-state";
import { FilterChip } from "@/components/composed/filter-chip";
import { FormField } from "@/components/composed/form-field";
import { MenuItem } from "@/components/composed/menu-item";
import { MenuSection } from "@/components/composed/menu-section";
import { MetricCard, MetricCardGroup } from "@/components/composed/metric-card";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { SectionBlock } from "@/components/composed/section-block";
import {
  SidePanel,
  SidePanelBody,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTrigger,
} from "@/components/composed/side-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/composed/table";
import { Toast } from "@/components/composed/toast";
import { IssueListRow } from "@/components/features/issue-list-row";
import { SidebarHeader } from "@/components/features/sidebar-header";
import {
  TranscriptBubble,
  TranscriptList,
  TranscriptRow,
} from "@/components/features/transcript";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { IconButton } from "@/components/ui/icon-button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

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
      className="flex scroll-mt-6 flex-col gap-6 border-border border-t pt-8"
      id={id}
    >
      <h2 className="font-medium text-2xl text-foreground leading-tight">
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
      <div className="font-medium text-muted-foreground text-sm">{label}</div>
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
      <main className="min-h-dvh bg-muted px-8 pt-12 pb-24 text-foreground">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
          <header className="flex flex-col gap-2">
            <div className="text-muted-foreground text-sm">
              Design System · Reloc8 Properties
            </div>
            <h1 className="font-medium text-2xl leading-tight">Components</h1>
            <p className="max-w-prose text-muted-foreground text-sm leading-normal">
              Runtime preview of every component in the library. Mirrors the
              Paper Components page.
            </p>
          </header>

          <Section id="atoms" title="01 · Atoms">
            <Example label="Avatar">
              <Avatar initials="DO" size="sm" />
              <Avatar initials="DO" size="md" />
              <Avatar
                initials="R8"
                size="md"
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
                label="Interactive"
                onChange={(e) => setCheckedOne(e.currentTarget.checked)}
              />
              <Checkbox
                checked={checkedTwo}
                label="Checked"
                onChange={(e) => setCheckedTwo(e.currentTarget.checked)}
              />
              <Checkbox disabled label="Disabled" />
            </Example>
            <Example label="Divider">
              <div className="flex w-60 flex-col gap-2">
                <Divider />
                <span className="text-subtle-foreground text-xs">
                  Horizontal
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Divider className="h-8" orientation="vertical" />
                <span className="text-subtle-foreground text-xs">Vertical</span>
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
              <Button className="bg-subtle" variant="secondary">
                Hover
              </Button>
              <Button disabled variant="secondary">
                Disabled
              </Button>
            </Example>
            <Example label="Ghost">
              <Button variant="ghost">Cancel</Button>
              <Button className="bg-subtle" variant="ghost">
                Hover
              </Button>
              <Button disabled variant="ghost">
                Disabled
              </Button>
            </Example>
            <Example label="Icon Button">
              <IconButton aria-label="Close" icon={<IconClose />} />
              <IconButton
                aria-label="Close"
                className="bg-subtle"
                icon={<IconClose />}
              />
              <IconButton
                aria-label="Close"
                icon={<IconClose />}
                variant="ghost"
              />
              <IconButton
                aria-label="Close"
                className="bg-subtle"
                icon={<IconClose />}
                variant="ghost"
              />
              <IconButton aria-label="Close" disabled icon={<IconClose />} />
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
                placeholder="Add a contractor name"
                wrapperClassName="w-60"
              />
              <Input
                defaultValue="John Mason Plumbing"
                wrapperClassName="w-60"
              />
              <Input
                defaultValue="not-an-email"
                invalid
                wrapperClassName="w-60"
              />
              <Input
                defaultValue="Locked field"
                disabled
                wrapperClassName="w-60"
              />
            </Example>
            <Example label="Search Input">
              <SearchInput placeholder="Search" wrapperClassName="w-53" />
              <SearchInput
                defaultValue="Wakefield"
                trailingSlot={<IconClose />}
                wrapperClassName="w-53"
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
              <FormField className="w-83" label="Status">
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
                className="w-83"
                helper="Optional — leave blank if no contractor is scheduled yet."
                label="Assigned to"
              >
                <Input placeholder="Add a contractor name" />
              </FormField>
              <FormField
                className="w-83"
                error="Enter a complete UK phone number."
                label="Contact number"
              >
                <Input defaultValue="07729" />
              </FormField>
            </Example>
            <Example label="Filter Chip">
              <FilterChip icon={<IconCalendar />} label="This week" />
              <FilterChip active icon={<IconCalendar />} label="This week" />
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
                <MenuItem active icon={<IconInbox />} label="Open Issues" />
                <MenuItem disabled icon={<IconArchive />} label="Properties" />
              </div>
            </Example>
            <Example label="Menu Section">
              <div className="w-56 rounded-md border border-border bg-background p-2">
                <MenuSection label="Calls">
                  <MenuItem active icon={<IconInbox />} label="Open Issues" />
                  <MenuItem icon={<IconCallIncoming />} label="Call Logs" />
                </MenuSection>
              </div>
            </Example>
            <Example label="Tabs — text">
              <Tabs className="w-90" defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent className="pt-3 text-sm" value="overview">
                  Overview content
                </TabsContent>
                <TabsContent className="pt-3 text-sm" value="notes">
                  Notes content
                </TabsContent>
                <TabsContent className="pt-3 text-sm" value="history">
                  History content
                </TabsContent>
              </Tabs>
            </Example>
            <Example label="Tabs — with icon">
              <Tabs className="w-90" defaultValue="list">
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
              <div className="w-full max-w-[1168px] overflow-hidden rounded-md border border-border bg-background">
                {[0, 1, 2].map((i) => (
                  <IssueListRow
                    address={`59 Wakefield Road HX${i + 3} 8AQ`}
                    badge={
                      i === 1 ? (
                        <Badge tone="danger" variant="solid">
                          Emergency
                        </Badge>
                      ) : null
                    }
                    description="The user contacted Reloc8 Property Management to report a boiler issue. The agent acknowledged the problem…"
                    key={i}
                    onClick={() => setSelectedIssue(i)}
                    selected={selectedIssue === i}
                    timestamp="10:30am"
                  />
                ))}
              </div>
            </Example>
            <Example label="Accordion">
              <Accordion
                className="flex w-full max-w-[1168px] flex-col gap-3"
                defaultValue={["new"]}
                type="multiple"
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
                    <div className="px-4 py-6 text-muted-foreground text-sm">
                      Empty example body.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Example>
            <Example label="Audio Player">
              <div className="w-172">
                <AudioPlayer
                  currentTime={playing ? "0:42" : "0:00"}
                  duration="1:24"
                  onPlayPauseClick={() => setPlaying((p) => !p)}
                  playing={playing}
                  progress={playing ? 0.5 : 0}
                />
              </div>
            </Example>
            <Example label="Transcript">
              <div className="flex items-start gap-8">
                <TranscriptBubble meta="Agent · 0:00" speaker="agent">
                  Hi, Reloc8 Property Management how can I help you?
                </TranscriptBubble>
                <TranscriptBubble meta="Caller · 0:06" speaker="caller">
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
              <Card className="flex w-80 flex-col gap-3" variant="bordered">
                <div className="text-muted-foreground text-sm">Bordered</div>
                <div className="text-base text-foreground leading-normal">
                  Default variant. Use for surfaces that sit on a muted
                  background.
                </div>
              </Card>
              <Card className="flex w-80 flex-col gap-3" variant="elevated">
                <div className="text-muted-foreground text-sm">Elevated</div>
                <div className="text-base text-foreground leading-normal">
                  Shadow variant. Use for overlays, popovers, active menu items.
                </div>
              </Card>
              <Card className="flex w-80 flex-col gap-3" variant="flat">
                <div className="text-muted-foreground text-sm">Flat</div>
                <div className="text-base text-foreground leading-normal">
                  Muted background, no border. Use for grouping inside another
                  surface.
                </div>
              </Card>
            </Example>
            <Example label="Page Header">
              <div className="w-full max-w-[1200px] overflow-hidden rounded-md border border-border bg-background">
                <PageHeader
                  actions={
                    <SearchInput placeholder="Search" wrapperClassName="w-53" />
                  }
                  title="Open Issues"
                />
              </div>
              <div className="w-full max-w-[1200px] overflow-hidden rounded-md border border-border bg-background">
                <PageHeader
                  actions={
                    <>
                      <SearchInput
                        placeholder="Search"
                        wrapperClassName="w-53"
                      />
                      <FilterChip icon={<IconCalendar />} label="This week" />
                    </>
                  }
                  title="Call Logs · Overview"
                />
              </div>
            </Example>
            <Example label="Section Block">
              <SectionBlock
                action={
                  <button className="hover:underline" type="button">
                    Edit
                  </button>
                }
                title="Details"
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
                    title="59 Wakefield Road HX4 8AQ"
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
              <Toast
                icon={<IconCheck strokeWidth={2.5} />}
                onDismiss={() => {}}
              >
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
                action={<Button variant="secondary">Go to Open Issues</Button>}
                description="Issues that need another call or a check-in will appear here."
                icon={<IconInbox />}
                title="No follow-ups waiting"
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
                    className="flex flex-col items-center gap-2 rounded-md border border-border bg-background p-3"
                    key={name as string}
                  >
                    <IconComp className="size-5 text-foreground" />
                    <span className="text-muted-foreground text-xs">
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
