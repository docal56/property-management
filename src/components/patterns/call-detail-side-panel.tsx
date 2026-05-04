"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { SidePanelMedium } from "@/components/ui/side-panel";
import { cn } from "@/lib/utils";
import { type TranscriptMessage, TranscriptView } from "./transcript-view";

type CallDetailSidePanelProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  summary?: ReactNode;
  transcript?: TranscriptMessage[];
  onViewIssue?: () => void;
  onCreateIssue?: () => void;
  isCreatingIssue?: boolean;
  className?: string;
};

export function CallDetailSidePanel({
  open,
  onClose,
  title,
  summary,
  transcript = [],
  onViewIssue,
  onCreateIssue,
  isCreatingIssue = false,
  className,
}: CallDetailSidePanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <SidePanelMedium
      aria-hidden={!open}
      aria-label="Call detail"
      className={cn(
        "pointer-events-none fixed inset-y-0 right-0 z-40 gap-lg border-border border-l bg-surface transition-transform duration-200 ease-out",
        open ? "pointer-events-auto translate-x-0" : "translate-x-full",
        className,
      )}
      role="complementary"
    >
      <div className="flex items-center gap-md border-border border-b px-lg py-base">
        <h2 className="min-w-0 flex-1 truncate font-medium text-16 text-foreground">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-md">
          {onViewIssue ? (
            <Button onClick={onViewIssue} variant="secondary">
              View Issue
            </Button>
          ) : onCreateIssue ? (
            <Button
              disabled={isCreatingIssue}
              onClick={onCreateIssue}
              variant="secondary"
            >
              {isCreatingIssue ? "Creating..." : "Create Issue"}
            </Button>
          ) : null}
          <IconButton
            aria-label="Close"
            icon={<Icon name="x" size="sm" />}
            onClick={onClose}
            size="sm"
          />
        </div>
      </div>
      {summary ? (
        <div className="px-base">
          <Card header="Call Summary">
            <p className="text-14 text-foreground-muted leading-160">
              {summary}
            </p>
          </Card>
        </div>
      ) : null}
      {transcript.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-lg pb-lg">
          <TranscriptView messages={transcript} />
        </div>
      ) : null}
    </SidePanelMedium>
  );
}
