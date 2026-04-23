"use client";

import { Dialog as RadixDialog } from "radix-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type ReactNode,
} from "react";
import { IconButton } from "@/components/ui/icon-button";
import { IconClose } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

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
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-inverse/40 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <RadixDialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed top-0 right-0 z-50 flex h-dvh flex-col overflow-hidden rounded-l-md border-border border-l bg-background shadow-sm outline-none",
          "data-[state=open]:animate-slide-in-right",
          "data-[state=closed]:animate-slide-out-right",
          className,
        )}
        ref={ref}
        style={{ width, ...style }}
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
        "flex h-14 shrink-0 items-center gap-4 border-border border-b px-4",
        className,
      )}
      {...rest}
    >
      <SidePanelTitle className="min-w-0 flex-1 truncate font-medium text-foreground text-sm">
        {title}
      </SidePanelTitle>
      {controls ? (
        <div className="flex shrink-0 items-center gap-2">{controls}</div>
      ) : null}
      {showCloseButton ? (
        <SidePanelClose asChild>
          <IconButton
            aria-label="Close panel"
            icon={<IconClose />}
            variant="secondary"
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
      className={cn("flex flex-1 flex-col gap-4 overflow-auto p-4", className)}
      {...rest}
    />
  );
}
