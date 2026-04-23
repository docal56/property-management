"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { IconEndArrowClose } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

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
      // biome-ignore lint/a11y/useSemanticElements: contains a nested interactive <Checkbox>; a real <button> can't contain interactive children
      <div
        className={cn(
          "flex h-10 cursor-pointer items-center gap-4 p-2 transition-colors",
          "border-subtle border-b last:border-b-0",
          "hover:bg-muted",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]",
          selected &&
            "border-info bg-background ring-1 ring-info ring-inset hover:bg-background",
          className,
        )}
        data-selected={selected || undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        ref={ref}
        role="button"
        tabIndex={0}
        {...rest}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: wrapper only stops click propagation so the nested checkbox can be toggled without opening the row */}
        <div
          className="inline-flex shrink-0 items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            aria-label={`Select issue at ${address}`}
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
          />
        </div>
        <span className="w-70 shrink-0 truncate font-medium text-foreground text-sm">
          {address}
        </span>
        <span className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
          {description}
        </span>
        <div className="flex w-21 shrink-0 justify-end">{badge}</div>
        <span className="w-14 shrink-0 text-right text-sm text-subtle-foreground">
          {timestamp}
        </span>
        <span
          aria-hidden
          className="inline-flex size-5 shrink-0 items-center justify-center text-foreground [&>svg]:size-4"
        >
          {(showArrow ?? selected) ? <IconEndArrowClose /> : null}
        </span>
      </div>
    );
  },
);
