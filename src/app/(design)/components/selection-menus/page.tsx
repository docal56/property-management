import {
  ComponentBlock,
  PageHeader,
  VariantCell,
} from "@/app/(design)/components/_shared/helpers";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownOption } from "@/components/ui/dropdown-option";
import { DropdownTrigger } from "@/components/ui/dropdown-trigger";
import { Icon } from "@/components/ui/icon";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";

export default function SelectionMenusPage() {
  return (
    <>
      <PageHeader
        description="Tabs and dropdown menus."
        title="Selection & Menus"
      />

      <ComponentBlock
        description="Single tab with active-state underline indicator. Wraps Radix Tabs."
        label="Tabs (Tab + TabList)"
      >
        <Tabs className="w-96" defaultValue="details">
          <TabList>
            <Tab value="details">Details</Tab>
            <Tab value="transcript">Call Transcript</Tab>
          </TabList>
          <TabPanel value="details">
            <p className="p-md text-14 text-foreground-muted">
              Details panel content.
            </p>
          </TabPanel>
          <TabPanel value="transcript">
            <p className="p-md text-14 text-foreground-muted">
              Transcript panel content.
            </p>
          </TabPanel>
        </Tabs>
      </ComponentBlock>

      <ComponentBlock
        description="Composes Dropdown Trigger + Dropdown Options inside a Radix menu. Click the trigger to open."
        label="Dropdown Menu"
      >
        <div className="flex flex-wrap items-center gap-lg">
          <VariantCell label="with header + icons">
            <DropdownMenu
              header="Status"
              trigger={
                <DropdownTrigger
                  leadingIcon={<Icon name="status-new" size="md" />}
                >
                  New Issue
                </DropdownTrigger>
              }
            >
              <DropdownOption
                icon={<Icon name="status-new" size="md" />}
                selected
              >
                New Issue
              </DropdownOption>
              <DropdownOption icon={<Icon name="calendar" size="md" />}>
                Contractor Scheduled
              </DropdownOption>
              <DropdownOption
                icon={<Icon name="status-in-progress" size="md" />}
              >
                In Progress
              </DropdownOption>
              <DropdownOption icon={<Icon name="completed" size="md" />}>
                Completed
              </DropdownOption>
            </DropdownMenu>
          </VariantCell>

          <VariantCell label="filter — no header">
            <DropdownMenu
              trigger={
                <DropdownTrigger
                  leadingIcon={<Icon name="calendar" size="md" />}
                >
                  All time
                </DropdownTrigger>
              }
            >
              <DropdownOption selected>All time</DropdownOption>
              <DropdownOption>This week</DropdownOption>
              <DropdownOption>Today</DropdownOption>
            </DropdownMenu>
          </VariantCell>
        </div>
      </ComponentBlock>
    </>
  );
}
