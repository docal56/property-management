"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { Tooltip as RadixTooltip } from "radix-ui";
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
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex items-center rounded-md py-1.5 px-2 gap-2 bg-inverse text-inverse-foreground text-xs",
          "data-[state=delayed-open]:animate-fade-in data-[state=closed]:animate-fade-out",
          className,
        )}
        {...rest}
      >
        {children}
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
});

export interface TooltipShortcutProps extends React.HTMLAttributes<HTMLElement> {
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
        "inline-flex items-center rounded-sm py-px px-1.5 bg-inverse/60 text-border-strong text-xs font-normal",
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
