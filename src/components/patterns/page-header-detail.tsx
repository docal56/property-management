import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

type PageHeaderDetailProps = {
  parent: ReactNode;
  current: ReactNode;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  onRestore?: () => void;
  restoreDisabled?: boolean;
  className?: string;
};

const headerButtonClasses =
  "size-8 rounded-[8px] border-[length:var(--border-hairline)] border-border bg-surface p-0 text-foreground shadow-card hover:bg-neutral-100";

export function PageHeaderDetail({
  parent,
  current,
  onBack,
  onPrev,
  onNext,
  onDelete,
  deleteDisabled,
  onRestore,
  restoreDisabled,
  className,
}: PageHeaderDetailProps) {
  return (
    <div
      className={cn(
        "flex h-12 items-center justify-between py-md pr-md",
        className,
      )}
    >
      <Breadcrumb current={current} onBack={onBack} parent={parent} />
      <div className="flex shrink-0 items-center gap-md">
        {onRestore ? (
          <Button
            className="h-8 rounded-[8px] px-md py-0 text-13 shadow-card"
            disabled={restoreDisabled}
            onClick={onRestore}
            trailingIcon={<Icon name="refresh" size="sm" />}
            variant="secondary"
          >
            Restore
          </Button>
        ) : null}
        {onDelete ? (
          <IconButton
            aria-label="Delete"
            className={headerButtonClasses}
            disabled={deleteDisabled}
            icon={<Icon name="trash" size="md" />}
            onClick={onDelete}
          />
        ) : null}
        <IconButton
          aria-label="Previous"
          className={cn(headerButtonClasses, !onPrev && "bg-background")}
          disabled={!onPrev}
          icon={<Icon name="arrow-up" size="md" />}
          onClick={onPrev}
        />
        <IconButton
          aria-label="Next"
          className={cn(headerButtonClasses, !onNext && "bg-background")}
          disabled={!onNext}
          icon={<Icon name="arrow-down" size="md" />}
          onClick={onNext}
        />
      </div>
    </div>
  );
}
