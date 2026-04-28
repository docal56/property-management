"use client";

import { useClerk } from "@clerk/nextjs";
import { PageContent } from "@/components/patterns/app-shell";
import { PageHeaderList } from "@/components/patterns/page-header-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function SettingsPage() {
  const { openOrganizationProfile, openUserProfile, signOut } = useClerk();

  return (
    <PageContent
      header={
        <PageHeaderList
          title="Settings"
          titleIcon={<Icon name="settings" size="md" />}
        />
      }
    >
      <div className="flex min-h-0 flex-1 items-start gap-md p-lg">
        <Button onClick={() => openOrganizationProfile()} variant="secondary">
          Org Settings
        </Button>
        <Button onClick={() => openUserProfile()} variant="secondary">
          User Settings
        </Button>
        <Button
          onClick={() => void signOut({ redirectUrl: "/" })}
          variant="secondary"
        >
          Sign Out
        </Button>
      </div>
    </PageContent>
  );
}
