"use client";

import { Tooltip as RadixTooltip } from "radix-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = RadixTooltip.Provider;
export const TooltipRoot = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;

export const TooltipContent = forwardRef<
  ElementRef<typeof RadixTooltip.Content>,
  ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(function TooltipContent(
  { className, sideOffset = 6, children, ...rest },
  ref,
) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        className={cn(
          "z-50 inline-flex items-center gap-2 rounded-md bg-inverse px-2 py-1.5 text-inverse-foreground text-xs",
          "data-[state=closed]:animate-fade-out data-[state=delayed-open]:animate-fade-in",
          className,
        )}
        ref={ref}
        sideOffset={sideOffset}
        {...rest}
      >
        {children}
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
});

export interface TooltipShortcutProps
  extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/** Small pill rendered inside a TooltipContent to show a keyboard shortcut. */
export function TooltipShortcut({
  className,
  children,
  ...rest
}: TooltipShortcutProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded-sm bg-inverse/60 px-1.5 py-px font-normal text-border-strong text-xs",
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}

export interface TooltipProps {
  /** The content shown in the tooltip. */
  content: ReactNode;
  /** Optional keyboard shortcut text (e.g. "⌘K"). */
  shortcut?: ReactNode;
  /** The element that triggers the tooltip. Rendered via Radix asChild. */
  children: ReactNode;
  /** Delay before showing, in milliseconds. */
  delayDuration?: number;
  /** Placement relative to the trigger. */
  side?: "top" | "bottom" | "left" | "right";
}

/** Simple one-shot tooltip. Requires a TooltipProvider somewhere in the tree. */
export function Tooltip({
  content,
  shortcut,
  children,
  delayDuration,
  side = "top",
}: TooltipProps) {
  return (
    <RadixTooltip.Root delayDuration={delayDuration}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <TooltipContent side={side}>
        <span>{content}</span>
        {shortcut ? <TooltipShortcut>{shortcut}</TooltipShortcut> : null}
      </TooltipContent>
    </RadixTooltip.Root>
  );
}
