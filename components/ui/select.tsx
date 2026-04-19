"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { Select as RadixSelect } from "radix-ui";
import { cn } from "@/lib/utils";
import { IconChevronDown, IconCheck } from "@/components/ui/icons";

export const Select = RadixSelect.Root;
export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;

export type SelectTriggerSize = "sm" | "md";

export interface SelectTriggerProps
  extends ComponentPropsWithoutRef<typeof RadixSelect.Trigger> {
  /** Visual height. `sm` = 32px (default), `md` = 40px. */
  size?: SelectTriggerSize;
  invalid?: boolean;
}

const triggerSizeClasses: Record<SelectTriggerSize, string> = {
  sm: "h-8",
  md: "h-10",
};

export const SelectTrigger = forwardRef<
  ElementRef<typeof RadixSelect.Trigger>,
  SelectTriggerProps
>(function SelectTrigger(
  { className, children, invalid, size = "sm", ...rest },
  ref,
) {
  return (
    <RadixSelect.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-between w-full rounded-md px-3 gap-2 bg-background border text-sm text-foreground transition-colors",
        triggerSizeClasses[size],
        invalid
          ? "border-danger focus:border-danger focus:ring-[3px] focus:ring-danger-soft"
          : "border-border-strong focus:border-info focus:ring-[3px] focus:ring-info-soft",
        "data-[placeholder]:text-subtle-foreground",
        "disabled:bg-muted disabled:border-border disabled:text-disabled disabled:cursor-not-allowed",
        "outline-none",
        className,
      )}
      {...rest}
    >
      <span className="flex-1 min-w-0 text-left truncate">{children}</span>
      <RadixSelect.Icon asChild>
        <IconChevronDown
          aria-hidden
          className="size-4 shrink-0 text-foreground"
        />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
});

export const SelectContent = forwardRef<
  ElementRef<typeof RadixSelect.Content>,
  ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(function SelectContent(
  { className, children, position = "popper", sideOffset = 4, ...rest },
  ref,
) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        ref={ref}
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-background shadow-sm p-1",
          className,
        )}
        {...rest}
      >
        <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
});

export interface SelectItemProps
  extends ComponentPropsWithoutRef<typeof RadixSelect.Item> {
  children: ReactNode;
}

export const SelectItem = forwardRef<
  ElementRef<typeof RadixSelect.Item>,
  SelectItemProps
>(function SelectItem({ className, children, ...rest }, ref) {
  return (
    <RadixSelect.Item
      ref={ref}
      className={cn(
        "relative flex items-center h-8 rounded-sm px-2 gap-2 text-sm text-foreground cursor-pointer select-none outline-none",
        "data-[highlighted]:bg-subtle",
        "data-[state=checked]:bg-subtle",
        "data-[disabled]:text-disabled data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      <span className="inline-flex items-center justify-center shrink-0 size-4">
        <RadixSelect.ItemIndicator>
          <IconCheck className="size-4 text-foreground" strokeWidth={2} />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText asChild>
        <span className="flex-1 min-w-0 truncate">{children}</span>
      </RadixSelect.ItemText>
    </RadixSelect.Item>
  );
});
