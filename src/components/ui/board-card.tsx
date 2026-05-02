"use client";

import { Avatar as RadixAvatar } from "radix-ui";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";

export type BoardCardAssignee = {
  imageUrl?: string | null;
  initials?: string | null;
  name?: string | null;
};

type BoardCardProps = {
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  badge?: ReactNode;
  assignee?: BoardCardAssignee | null;
  selected?: boolean;
  showSelectionIndicator?: boolean;
  onClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

export function BoardCard({
  title,
  description,
  timestamp,
  badge,
  assignee,
  selected = false,
  showSelectionIndicator = false,
  onClick,
  onMenuClick,
  className,
}: BoardCardProps) {
  const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onMenuClick?.();
  };
  const assigneeName = assignee?.name?.trim() || "Assignee";
  const assigneeInitials = assignee?.initials?.trim().slice(0, 2).toUpperCase();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Board cards use div layout because some variants contain nested action buttons.
    <div
      className={cn(
        "relative flex w-board-card flex-col gap-base rounded-md bg-surface p-base",
        "border-[length:var(--border-hairline)] border-border",
        "shadow-card transition-shadow hover:shadow-hover",
        onClick && "cursor-pointer",
        "data-[selected]:ring-2 data-[selected]:ring-ring",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      data-selected={selected || undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {timestamp || showSelectionIndicator || onMenuClick ? (
        <div className="flex min-h-6 items-center gap-md">
          {timestamp ? (
            <span className="min-w-0 flex-1 truncate font-medium text-12 text-neutral-800 leading-120">
              {timestamp}
            </span>
          ) : (
            <span className="min-w-0 flex-1" />
          )}
          {showSelectionIndicator ? (
            <RadixAvatar.Root
              aria-label={assignee ? assigneeName : "Unassigned"}
              className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-500 bg-neutral-100",
                "font-medium text-12 text-neutral-800 leading-none",
                selected && "ring-2 ring-ring",
              )}
              role="img"
            >
              {assignee?.imageUrl ? (
                <RadixAvatar.Image
                  alt={assigneeName}
                  className="size-full object-cover"
                  src={assignee.imageUrl}
                />
              ) : null}
              <RadixAvatar.Fallback
                className="flex size-full items-center justify-center"
                delayMs={0}
              >
                {assigneeInitials}
              </RadixAvatar.Fallback>
            </RadixAvatar.Root>
          ) : null}
          {onMenuClick ? (
            <IconButton
              aria-label="Open card menu"
              className="-mt-md -mr-md"
              icon={<Icon name="menu" size="sm" />}
              onClick={handleMenuClick}
              size="sm"
            />
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-md">
        <h3 className="min-w-0 font-medium text-13 text-foreground leading-120">
          {title}
        </h3>
        {description ? (
          <p className="font-regular text-12 text-foreground-muted leading-160">
            {description}
          </p>
        ) : null}
      </div>
      {badge ? <div className="min-w-0">{badge}</div> : null}
    </div>
  );
}
