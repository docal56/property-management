"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageContent } from "@/components/patterns/app-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PageTitle } from "@/components/ui/page-title";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function formatDate(value: number) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DeletedIssuesPage() {
  const router = useRouter();
  const deletedIssues = useQuery(api.issues.listDeleted, { limit: 100 });
  const restoreIssue = useMutation(api.issues.restoreIssue);
  const [restoringIds, setRestoringIds] = useState<Set<Id<"issues">>>(
    () => new Set(),
  );

  const restore = async (id: Id<"issues">) => {
    setRestoringIds((current) => new Set(current).add(id));
    try {
      await restoreIssue({ id });
    } finally {
      setRestoringIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <PageContent
      header={
        <div className="flex h-[58px] items-center justify-between py-xs pr-md">
          <PageTitle icon={<Icon name="archive" size="md" />}>
            Deleted Issues
          </PageTitle>
          <Button
            onClick={() => router.push("/issues")}
            trailingIcon={<Icon name="arrow-right" size="sm" />}
            variant="secondary"
          >
            Open issues
          </Button>
        </div>
      }
    >
      <div className="min-h-0 overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-border border-b bg-background">
              <th className="px-lg py-base text-left font-medium text-13 text-foreground-subtle leading-120">
                Issue
              </th>
              <th className="w-64 px-lg py-base text-left font-medium text-13 text-foreground-subtle leading-120">
                Tenant
              </th>
              <th className="w-44 px-lg py-base text-left font-medium text-13 text-foreground-subtle leading-120">
                Deleted
              </th>
              <th className="w-36 px-lg py-base text-right font-medium text-13 text-foreground-subtle leading-120">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {deletedIssues === undefined ? (
              <tr>
                <td
                  className="px-lg py-lg text-14 text-foreground-muted"
                  colSpan={4}
                >
                  Loading deleted issues...
                </td>
              </tr>
            ) : deletedIssues.length === 0 ? (
              <tr>
                <td
                  className="px-lg py-lg text-14 text-foreground-muted"
                  colSpan={4}
                >
                  No deleted issues.
                </td>
              </tr>
            ) : (
              deletedIssues.map((issue) => {
                const isRestoring = restoringIds.has(issue._id);
                const details = issue.brief?.details?.trim() || issue.summary;
                const tenantRows = [
                  ["name", issue.contactName],
                  ["address", issue.address],
                  ["email", issue.contactEmail],
                  ["phone", issue.contactPhone],
                ].flatMap(([key, value]) => (value ? [{ key, value }] : []));
                return (
                  <tr
                    className="border-border border-b last:border-b-0"
                    key={issue._id}
                  >
                    <td className="max-w-0 px-lg py-base">
                      <div className="flex min-w-0 flex-col gap-sm">
                        <button
                          className="min-w-0 truncate text-left font-medium text-14 text-foreground leading-120 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => {
                            router.push(`/issues/${issue.publicId}`);
                          }}
                          type="button"
                        >
                          {issue.title}
                        </button>
                        <p className="line-clamp-2 text-13 text-foreground-muted leading-150">
                          {details}
                        </p>
                      </div>
                    </td>
                    <td className="w-64 px-lg py-base">
                      {tenantRows.length > 0 ? (
                        <div className="flex flex-col gap-sm text-13 text-foreground-muted leading-120">
                          {tenantRows.map((tenantRow) => (
                            <p className="truncate" key={tenantRow.key}>
                              {tenantRow.value}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-13 text-foreground-muted leading-120">
                          No tenant details
                        </span>
                      )}
                    </td>
                    <td className="w-44 px-lg py-base text-13 text-foreground-muted leading-150">
                      {issue.deletedAt
                        ? formatDate(issue.deletedAt)
                        : "Unknown"}
                    </td>
                    <td className="w-36 px-lg py-base text-right">
                      <Button
                        className="px-md py-sm text-13"
                        disabled={isRestoring}
                        onClick={() => {
                          void restore(issue._id);
                        }}
                        variant="secondary"
                      >
                        {isRestoring ? "Restoring..." : "Restore"}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </PageContent>
  );
}
