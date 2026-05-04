import {
  ComponentBlock,
  PageHeader,
} from "@/app/(design)/components/_shared/helpers";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Icon } from "@/components/ui/icon";
import { MainNavItem } from "@/components/ui/main-nav-item";
import { PageTitle } from "@/components/ui/page-title";

export default function NavigationPage() {
  return (
    <>
      <PageHeader
        description="Nav item, breadcrumb, and page title primitives."
        title="Navigation"
      />

      <ComponentBlock
        description="Sidebar nav entry. 3 states (Active / Hover / Default — hover is via CSS)."
        label="Main Nav Item"
      >
        <div className="flex w-60 flex-col gap-sm">
          <MainNavItem
            active
            icon={<Icon name="issues" size="md" />}
            label="Open Issues"
          />
          <MainNavItem
            icon={<Icon name="call-incoming" size="md" />}
            label="Call Logs"
          />
          <MainNavItem
            icon={<Icon name="settings" size="md" />}
            label="Settings"
          />
          <p className="text-12 text-foreground-subtle">
            Hover any default item to see the hover state.
          </p>
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Back arrow + parent link + separator + current page."
        label="Breadcrumb"
      >
        <Breadcrumb current="59 Wakefield Road, HX3 8AQ" parent="Open Issues" />
      </ComponentBlock>

      <ComponentBlock
        description="Page icon + title text. Used in page headers."
        label="Page Title"
      >
        <PageTitle icon={<Icon name="issues" size="md" />}>
          Open Issues
        </PageTitle>
      </ComponentBlock>
    </>
  );
}
