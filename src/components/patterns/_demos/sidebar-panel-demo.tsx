import { SidebarPanel } from "@/components/patterns/sidebar-panel";
import { Icon } from "@/components/ui/icon";
import { Inline } from "@/components/ui/inline";

export function SidebarPanelDemo() {
  return (
    <SidebarPanel
      cards={[
        {
          id: "status",
          title: "Status",
          rows: [
            {
              id: "status-new",
              label: (
                <Inline icon={<Icon name="status-new" size="md" />}>
                  New Issue
                </Inline>
              ),
            },
          ],
        },
        {
          id: "details",
          title: "Details",
          rows: [
            {
              id: "address",
              label: (
                <Inline icon={<Icon name="home" size="md" />}>
                  59 Wakefield Road, Hipperholme, HX3 8AQ
                </Inline>
              ),
            },
            {
              id: "reporter",
              label: (
                <Inline icon={<Icon name="user" size="md" />}>
                  Dave O&apos;Callaghan
                </Inline>
              ),
            },
            {
              id: "phone",
              label: (
                <Inline icon={<Icon name="phone" size="md" />}>
                  07792420529
                </Inline>
              ),
            },
            {
              id: "email",
              label: (
                <Inline icon={<Icon name="email" size="md" />}>
                  docal56@gmail.com
                </Inline>
              ),
            },
          ],
        },
      ]}
    />
  );
}
