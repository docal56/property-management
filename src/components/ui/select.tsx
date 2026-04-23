"use client";

import { Select as RadixSelect } from "radix-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type ReactNode,
} from "react";
import { IconCheck, IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

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
      className={cn(
        "inline-flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-foreground text-sm transition-colors",
        triggerSizeClasses[size],
        invalid
          ? "border-danger focus:border-danger focus:ring-[3px] focus:ring-danger-soft"
          : "border-border-strong focus:border-info focus:ring-[3px] focus:ring-info-soft",
        "data-[placeholder]:text-subtle-foreground",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-disabled",
        "outline-none",
        className,
      )}
      ref={ref}
      {...rest}
    >
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
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
        className={cn(
          "z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-background p-1 shadow-sm",
          className,
        )}
        position={position}
        ref={ref}
        sideOffset={sideOffset}
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
      className={cn(
        "relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-sm px-2 text-foreground text-sm outline-none",
        "data-[highlighted]:bg-subtle",
        "data-[state=checked]:bg-subtle",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled",
        className,
      )}
      ref={ref}
      {...rest}
    >
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <IconCheck className="size-4 text-foreground" strokeWidth={2} />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText asChild>
        <span className="min-w-0 flex-1 truncate">{children}</span>
      </RadixSelect.ItemText>
    </RadixSelect.Item>
  );
});
