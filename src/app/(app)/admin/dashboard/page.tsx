"use client";

import { useQuery } from "convex/react";
import { PageContent } from "@/components/patterns/app-shell";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { LabelSmall } from "@/components/ui/label-small";
import { PageTitle } from "@/components/ui/page-title";
import { api } from "@/convex/_generated/api";

const skeletonKeys = ["users", "orgs", "agents", "issues"];

function formatTableName(table: string) {
  const label = table.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatCount(count: number) {
  return new Intl.NumberFormat().format(count);
}

function MetricCard({ count, table }: { count: number; table: string }) {
  return (
    <div className="flex min-h-24 flex-col justify-between rounded-lg border-[length:var(--border-hairline)] border-border bg-surface p-lg shadow-subtle">
      <span className="font-medium text-13 text-foreground-muted leading-120">
        {formatTableName(table)}
      </span>
      <span className="font-semibold text-20 text-foreground leading-120">
        {formatCount(count)}
      </span>
    </div>
  );
}

function MetricSkeleton({ table }: { table: string }) {
  return (
    <div className="flex min-h-24 animate-pulse flex-col justify-between rounded-lg border-[length:var(--border-hairline)] border-border bg-surface p-lg shadow-subtle">
      <span className="h-4 w-28 rounded-sm bg-hover" />
      <span className="h-6 w-12 rounded-sm bg-hover" />
      <span className="sr-only">{formatTableName(table)} loading</span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const viewer = useQuery(api.admin.viewer);
  const dashboard = useQuery(
    api.admin.dashboard,
    viewer?.isAdmin ? {} : "skip",
  );

  return (
    <PageContent
      header={
        <div className="flex h-12 items-center justify-between py-xs pr-md">
          <PageTitle icon={<Icon name="toolbox" size="md" />}>
            Admin Dashboard
          </PageTitle>
          {viewer?.role ? (
            <LabelSmall variant="info">{viewer.role}</LabelSmall>
          ) : null}
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-auto">
        {viewer?.isAdmin === false ? (
          <Card className="max-w-lg">
            <span className="text-14 text-foreground-muted leading-160">
              You do not have Buzz admin access.
            </span>
          </Card>
        ) : (
          <div className="grid auto-rows-min grid-cols-1 items-start gap-base md:grid-cols-2 xl:grid-cols-4">
            {dashboard
              ? dashboard.counts.map((item) => (
                  <MetricCard
                    count={item.count}
                    key={item.table}
                    table={item.table}
                  />
                ))
              : skeletonKeys.map((key) => (
                  <MetricSkeleton key={key} table={key} />
                ))}
          </div>
        )}
      </div>
    </PageContent>
  );
}
