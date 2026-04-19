"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarHeader } from "@/components/features/sidebar-header";
import { MenuItem } from "@/components/composed/menu-item";
import { MenuSection } from "@/components/composed/menu-section";
import { IconCallIncoming, IconInbox } from "@/components/ui/icons";

const navItems = [
  { href: "/", label: "Open Issues", icon: <IconInbox /> },
  { href: "/call-logs", label: "Call Logs", icon: <IconCallIncoming /> },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-muted">
      <aside className="flex w-60 shrink-0 flex-col gap-3 border-r border-border bg-background p-2">
        <SidebarHeader />
        <MenuSection>
          {navItems.map((item) => (
            <MenuItem
              key={item.href}
              asChild
              active={pathname === item.href}
              icon={item.icon}
              label={item.label}
            >
              <Link href={item.href} />
            </MenuItem>
          ))}
        </MenuSection>
      </aside>
      <div className="flex flex-1 min-w-0 flex-col">{children}</div>
    </div>
  );
}
