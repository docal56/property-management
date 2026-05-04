import Link from "next/link";
import { PageHeader } from "./_shared/helpers";
import { navGroups } from "./_shared/nav";

export default function ComponentsOverviewPage() {
  return (
    <>
      <PageHeader
        description="Tokens, primitives, patterns, and icons — mirrored from Figma. Use the sidebar to jump between sections or search."
        title="Design System"
      />
      <div className="flex flex-col gap-2xl">
        {navGroups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-md font-semibold text-16 text-foreground">
              {group.title}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-md">
              {group.items.map((item) => (
                <Link
                  className="flex flex-col gap-xs rounded-md border border-border bg-surface p-lg transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={item.href}
                  key={item.href}
                >
                  <span className="font-medium text-14 text-foreground">
                    {item.title}
                  </span>
                  {item.summary ? (
                    <span className="text-12 text-foreground-subtle leading-160">
                      {item.summary}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
