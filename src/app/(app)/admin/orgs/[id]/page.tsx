"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { PageContent } from "@/components/patterns/app-shell";
import { PageHeaderDetail } from "@/components/patterns/page-header-detail";
import { Card } from "@/components/ui/card";
import { LabelSmall } from "@/components/ui/label-small";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AgentsSection } from "../../_components/agents-section";
import { IssueTypesSection } from "../../_components/issue-types-section";

function isLikelyConvexId(value: string) {
  return /^[a-z0-9]{20,}$/.test(value);
}

export default function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const viewer = useQuery(api.admin.viewer);
  const validId = isLikelyConvexId(id);
  const orgId = id as Id<"orgs">;
  const detail = useQuery(
    api.admin.org,
    viewer?.isAdmin && validId ? { orgId } : "skip",
  );

  const goBack = () => router.push("/admin/dashboard");

  if (viewer?.isAdmin === false) {
    return (
      <PageContent
        header={
          <PageHeaderDetail
            current="Org"
            onBack={goBack}
            parent="Admin Dashboard"
          />
        }
      >
        <Card className="max-w-lg">
          <span className="text-14 text-foreground-muted leading-160">
            You do not have Buzz admin access.
          </span>
        </Card>
      </PageContent>
    );
  }

  if (validId && detail === undefined) {
    return (
      <PageContent
        header={
          <PageHeaderDetail
            current="Org"
            onBack={goBack}
            parent="Admin Dashboard"
          />
        }
      >
        <div className="h-80 animate-pulse rounded-lg border-[length:var(--border-hairline)] border-border bg-surface shadow-subtle" />
      </PageContent>
    );
  }

  if (!validId || detail === null) {
    return (
      <PageContent
        header={
          <PageHeaderDetail
            current="Org"
            onBack={goBack}
            parent="Admin Dashboard"
          />
        }
      >
        <Card className="max-w-lg">
          <span className="text-14 text-foreground-muted leading-160">
            Org not found.
          </span>
        </Card>
      </PageContent>
    );
  }

  if (!detail) return null;
  const { org, agents } = detail;
  const orgName = org.name ?? org.slug ?? "Untitled org";
  const issueTypes = org.issueTypes ?? [];

  return (
    <PageContent
      header={
        <PageHeaderDetail
          current={orgName}
          onBack={goBack}
          parent="Admin Dashboard"
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-auto">
        <Card
          className="gap-lg"
          header={
            <div className="flex min-w-0 flex-1 items-start justify-between gap-base">
              <div className="flex min-w-0 flex-col gap-xs">
                <span className="truncate">{orgName}</span>
                <span className="truncate font-mono font-normal text-12 text-foreground-muted leading-120">
                  {org.slug ?? org.clerkId}
                </span>
              </div>
              <div className="flex shrink-0 gap-xs">
                <LabelSmall className="bg-secondary text-foreground">
                  {agents.length} agents
                </LabelSmall>
                <LabelSmall className="bg-secondary text-foreground">
                  {issueTypes.length} types
                </LabelSmall>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-lg">
            <IssueTypesSection issueTypes={issueTypes} orgId={org._id} />
            <AgentsSection
              agents={agents}
              orgId={org._id}
              orgIssueTypes={issueTypes}
            />
          </div>
        </Card>
      </div>
    </PageContent>
  );
}
