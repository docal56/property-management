"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/text-input";
import { cn } from "@/lib/utils";
import { navGroups } from "./_shared/nav";

function matches(
  query: string,
  ...haystack: Array<string | undefined>
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack.some((s) => s?.toLowerCase().includes(q));
}

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return navGroups;
    return navGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            matches(query, i.title, i.summary, g.title) ||
            (i.entries?.some((e) => matches(query, e)) ?? false),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-border border-r bg-surface">
      <div className="border-border border-b p-lg">
        <Link
          className="font-semibold text-16 text-foreground"
          href="/components"
        >
          Design System
        </Link>
      </div>
      <div className="border-border border-b p-md">
        <TextInput
          leadingIcon={<Icon name="search" size="sm" />}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          value={query}
          wrapperClassName="w-full"
        />
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-md">
        {filteredGroups.length === 0 ? (
          <p className="px-md py-base text-12 text-foreground-subtle">
            No results
          </p>
        ) : (
          filteredGroups.map((group) => (
            <div className="mb-lg" key={group.title}>
              <div className="px-md pt-xs pb-md font-medium text-12 text-foreground-subtle uppercase tracking-wide">
                {group.title}
              </div>
              <ul className="flex flex-col gap-xs">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center rounded-md px-md py-md font-medium text-14 leading-120",
                          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-selected text-foreground"
                            : "text-foreground-muted hover:bg-hover hover:text-foreground",
                        )}
                        href={item.href}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
