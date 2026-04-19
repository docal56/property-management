"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { IconEndArrowClose } from "@/components/ui/icons";

export interface IssueListRowProps extends HTMLAttributes<HTMLDivElement> {
  address: string;
  description: string;
  timestamp: string;
  /** Render a Badge (or anything) in the tag slot. */
  badge?: ReactNode;
  selected?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Whether to show the trailing arrow-out icon (hidden when unselected). */
  showArrow?: boolean;
}

export const IssueListRow = forwardRef<HTMLDivElement, IssueListRowProps>(
  function IssueListRow(
    {
      address,
      description,
      timestamp,
      badge,
      selected,
      checked,
      onCheckedChange,
      showArrow,
      className,
      onClick,
      onKeyDown,
      ...rest
    },
    ref,
  ) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      // Enter opens the row. Space is reserved for the nested checkbox.
      if (event.key === "Enter") {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        data-selected={selected || undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center h-10 p-2 gap-4 transition-colors cursor-pointer",
          "border-b border-subtle last:border-b-0",
          "hover:bg-muted",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
          selected &&
            "bg-background border-info ring-1 ring-inset ring-info hover:bg-background",
          className,
        )}
        {...rest}
      >
        <div
          className="inline-flex items-center justify-center shrink-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
            aria-label={`Select issue at ${address}`}
          />
        </div>
        <span className="w-70 shrink-0 text-sm font-medium text-foreground truncate">
          {address}
        </span>
        <span className="flex-1 min-w-0 text-sm text-muted-foreground truncate">
          {description}
        </span>
        <div className="w-21 flex justify-end shrink-0">{badge}</div>
        <span className="w-14 shrink-0 text-right text-sm text-subtle-foreground">
          {timestamp}
        </span>
        <span
          aria-hidden
          className="inline-flex items-center justify-center shrink-0 size-5 [&>svg]:size-4 text-foreground"
        >
          {showArrow ?? selected ? <IconEndArrowClose /> : null}
        </span>
      </div>
    );
  },
);
