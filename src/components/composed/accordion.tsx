"use client";

import { Accordion as RadixAccordion } from "radix-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type ReactNode,
} from "react";
import { IconChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export const Accordion = RadixAccordion.Root;

export const AccordionItem = forwardRef<
  ElementRef<typeof RadixAccordion.Item>,
  ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(function AccordionItem({ className, ...rest }, ref) {
  return (
    <RadixAccordion.Item
      className={cn(
        "overflow-hidden rounded-md border border-border bg-background",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
});

export interface AccordionTriggerProps
  extends ComponentPropsWithoutRef<typeof RadixAccordion.Trigger> {
  icon?: ReactNode;
  /** Optional count shown on the right of the header. */
  count?: number | string;
}

export const AccordionTrigger = forwardRef<
  ElementRef<typeof RadixAccordion.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger(
  { className, children, icon, count, ...rest },
  ref,
) {
  return (
    <RadixAccordion.Header asChild>
      <div className="flex">
        <RadixAccordion.Trigger
          className={cn(
            "group flex h-12 w-full items-center gap-2 bg-muted px-4 font-medium text-foreground text-sm outline-none transition-colors",
            "data-[state=open]:border-border data-[state=open]:border-b",
            "hover:bg-subtle",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]",
            className,
          )}
          ref={ref}
          {...rest}
        >
          {icon ? (
            <span
              aria-hidden
              className="inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4"
            >
              {icon}
            </span>
          ) : (
            <IconChevronRight
              aria-hidden
              className="size-4 shrink-0 text-foreground transition-transform group-data-[state=open]:rotate-90"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-left">{children}</span>
          {count !== undefined ? (
            <span className="shrink-0 font-normal text-sm text-subtle-foreground">
              {count}
            </span>
          ) : null}
        </RadixAccordion.Trigger>
      </div>
    </RadixAccordion.Header>
  );
});

export const AccordionContent = forwardRef<
  ElementRef<typeof RadixAccordion.Content>,
  ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(function AccordionContent({ className, children, ...rest }, ref) {
  return (
    <RadixAccordion.Content
      className={cn("overflow-hidden", className)}
      ref={ref}
      {...rest}
    >
      <div className="flex flex-col">{children}</div>
    </RadixAccordion.Content>
  );
});
