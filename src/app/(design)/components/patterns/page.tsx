import {
  ComponentBlock,
  PageHeader,
  Section,
} from "@/app/(design)/components/_shared/helpers";
import { AppShellDemo } from "@/components/patterns/_demos/app-shell-demo";
import { CallDetailSidePanelDemo } from "@/components/patterns/_demos/call-detail-side-panel-demo";
import { DataTableDemo } from "@/components/patterns/_demos/data-table-demo";
import { KanbanBoardDemo } from "@/components/patterns/_demos/kanban-board-demo";
import { MainNavDemo } from "@/components/patterns/_demos/main-nav-demo";
import { PageHeaderDetailDemo } from "@/components/patterns/_demos/page-header-detail-demo";
import { PageHeaderListDemo } from "@/components/patterns/_demos/page-header-list-demo";
import { SearchHeaderDemo } from "@/components/patterns/_demos/search-header-demo";
import { SidebarPanelDemo } from "@/components/patterns/_demos/sidebar-panel-demo";
import { TabbedContentDemo } from "@/components/patterns/_demos/tabbed-content-demo";
import { TimelineViewDemo } from "@/components/patterns/_demos/timeline-view-demo";
import { TranscriptViewDemo } from "@/components/patterns/_demos/transcript-view-demo";
import { UpdateComposerDemo } from "@/components/patterns/_demos/update-composer-demo";

export default function PatternsPage() {
  return (
    <>
      <PageHeader
        description="Composed building blocks made of primitives. The shapes behind every page in the app."
        title="Patterns"
      />

      <Section title="Navigation & Layout">
        <ComponentBlock
          bare
          description="Top-level layout. Three slots: Main Nav (left), Page Header (top of content), Main Container (body). Every (app) page renders inside this."
          label="App Shell"
        >
          <AppShellDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="App sidebar with logo, grouped nav sections, and real Next.js Links. Active state derives from the current pathname."
          label="Main Nav"
        >
          <MainNavDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Title + search input. Use on list views (Open Issues, Call Logs)."
          label="Page Header — List"
        >
          <PageHeaderListDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Breadcrumb back + up/down steppers. Use on detail views to page through records."
          label="Page Header — Detail"
        >
          <PageHeaderDetailDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Shown inside the Main Container when a search is active. Close button clears the query."
          label="Search Header"
        >
          <SearchHeaderDemo />
        </ComponentBlock>
      </Section>

      <Section title="Content Displays">
        <ComponentBlock
          bare
          description="Horizontal columns with drag-and-drop cards (@dnd-kit). Cards can be dragged between columns. The Completed column is collapsed by default — toggle it on to see the empty state."
          label="Kanban Board"
        >
          <KanbanBoardDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Stack of Cards each containing Detail Rows. Supports placeholder rows for 'Add X' affordances."
          label="Sidebar Panel"
        >
          <SidebarPanelDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Generic data table with toolbar (row count + filter triggers), header, and clickable rows. Click a row to toggle selection."
          label="Data Table"
        >
          <DataTableDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Thin wrapper over Tabs primitives — data-driven list of tabs with inline content."
          label="Tabbed Content"
        >
          <TabbedContentDemo />
        </ComponentBlock>
      </Section>

      <Section title="Activity & Communication">
        <ComponentBlock
          bare
          description="Vertical list of Timeline Events — avatar-led and icon-led entries interleaved."
          label="Timeline View"
        >
          <TimelineViewDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="List of Chat Bubbles. Incoming left-aligned, outgoing right-aligned."
          label="Transcript View"
        >
          <TranscriptViewDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Textarea + Add Media button + send. Send is disabled when the input is empty."
          label="Update Composer"
        >
          <UpdateComposerDemo />
        </ComponentBlock>

        <ComponentBlock
          bare
          description="Right-docked slide-in panel. Non-modal — the rest of the page stays interactive. Closes on Escape or the × button."
          label="Call Detail Side Panel"
        >
          <CallDetailSidePanelDemo />
        </ComponentBlock>
      </Section>
    </>
  );
}
