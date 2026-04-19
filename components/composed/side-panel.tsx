"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import { IconClose } from "@/components/ui/icons";

export const SidePanel = RadixDialog.Root;
export const SidePanelTrigger = RadixDialog.Trigger;
export const SidePanelClose = RadixDialog.Close;
export const SidePanelTitle = RadixDialog.Title;
export const SidePanelDescription = RadixDialog.Description;

export interface SidePanelContentProps
  extends ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  /** Panel width — accepts any CSS value. Default: 720px. */
  width?: string | number;
}

export const SidePanelContent = forwardRef<
  ElementRef<typeof RadixDialog.Content>,
  SidePanelContentProps
>(function SidePanelContent(
  { className, width = "720px", style, children, ...rest },
  ref,
) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-inverse/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
      <RadixDialog.Content
        ref={ref}
        aria-describedby={undefined}
        style={{ width, ...style }}
        className={cn(
          "fixed right-0 top-0 z-50 h-dvh flex flex-col bg-background border-l border-border shadow-sm rounded-l-md overflow-hidden outline-none",
          "data-[state=open]:animate-slide-in-right",
          "data-[state=closed]:animate-slide-out-right",
          className,
        )}
        {...rest}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});

export interface SidePanelHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** Trailing controls — e.g. prev/next ButtonGroup, Close button. */
  controls?: ReactNode;
  /** Show an auto-wired Close button on the right. */
  showCloseButton?: boolean;
}

export function SidePanelHeader({
  title,
  controls,
  showCloseButton = true,
  className,
  ...rest
}: SidePanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center h-14 px-4 gap-4 border-b border-border shrink-0",
        className,
      )}
      {...rest}
    >
      <SidePanelTitle className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
        {title}
      </SidePanelTitle>
      {controls ? (
        <div className="flex items-center gap-2 shrink-0">{controls}</div>
      ) : null}
      {showCloseButton ? (
        <SidePanelClose asChild>
          <IconButton
            variant="secondary"
            aria-label="Close panel"
            icon={<IconClose />}
          />
        </SidePanelClose>
      ) : null}
    </div>
  );
}

export function SidePanelBody({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col flex-1 gap-4 p-4 overflow-auto", className)}
      {...rest}
    />
  );
}
