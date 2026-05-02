"use client";

import { ClerkLoaded, ClerkLoading, OrganizationSwitcher } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/patterns/app-shell";
import { MainNav, type MainNavSection } from "@/components/patterns/main-nav";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const navSections: MainNavSection[] = [
  {
    id: "manage",
    title: "Manage",
    items: [
      {
        id: "issues",
        label: "Open Issues",
        href: "/issues",
        matchPaths: ["/issues"],
        icon: <Icon name="issues" size="md" />,
      },
      // {
      //   id: "enquiries",
      //   label: "Enquiries Inbox",
      //   href: "/enquiries",
      //   icon: <Icon name="inbox" size="md" />,
      // },
    ],
  },
  {
    id: "monitor",
    title: "Monitor",
    items: [
      {
        id: "calls",
        label: "Call Logs",
        href: "/calls",
        icon: <Icon name="call-incoming" size="md" />,
      },
      // {
      //   id: "tenants",
      //   label: "Tenants",
      //   href: "/tenants",
      //   icon: <Icon name="contacts" size="md" />,
      // },
    ],
  },
];

function OrganizationSlot() {
  return (
    <div className="min-w-0 flex-1 [&_.cl-organizationSwitcher]:w-full! [&_.cl-organizationSwitcherTrigger]:w-full! [&_.cl-rootBox]:w-full!">
      <ClerkLoading>
        <div className="h-9 w-full animate-pulse rounded-md bg-hover" />
      </ClerkLoading>
      <ClerkLoaded>
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/issues"
          afterSelectOrganizationUrl="/issues"
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "h-10 w-full justify-between rounded-md px-md py-md text-14 font-medium leading-120 text-foreground hover:bg-hover",
              organizationPreview: "min-w-0 flex-1",
              organizationPreviewTextContainer: "min-w-0",
              organizationPreviewMainIdentifier:
                "truncate text-14 font-medium leading-120 text-foreground",
              organizationSwitcherTriggerIcon: "text-foreground-muted",
            },
          }}
          hidePersonal
        />
      </ClerkLoaded>
    </div>
  );
}

function SidebarFooter() {
  const pathname = usePathname() ?? "";
  const adminViewer = useQuery(api.admin.viewer);
  const settingsActive = pathname === "/settings";
  const adminActive = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className="flex flex-col gap-base">
      {adminViewer?.isAdmin ? (
        <Link
          aria-current={adminActive ? "page" : undefined}
          className={cn(
            "flex h-10 w-full items-center gap-md rounded-md p-md",
            "border-[length:var(--border-hairline)] font-medium text-14 leading-120",
            "transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            adminActive
              ? "border-border bg-surface text-foreground shadow-subtle"
              : "border-transparent bg-transparent text-foreground-muted hover:bg-hover hover:text-foreground",
          )}
          href="/admin/dashboard"
        >
          <Icon name="toolbox" size="md" />
          <span className="min-w-0 flex-1 truncate text-left">Admin</span>
        </Link>
      ) : null}
      <div className="flex items-center gap-md">
        <OrganizationSlot />
        <Link
          aria-label="Settings"
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-md",
            "bg-transparent text-foreground-muted hover:bg-hover hover:text-foreground",
            "transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            settingsActive && "text-foreground",
          )}
          href="/settings"
        >
          <Icon name="settings" size="md" />
        </Link>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      nav={
        <MainNav
          footer={<SidebarFooter />}
          logo={<Logo />}
          sections={navSections}
        />
      }
    >
      {children}
    </AppShell>
  );
}
