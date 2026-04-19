"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { Accordion as RadixAccordion } from "radix-ui";
import { cn } from "@/lib/utils";
import { IconChevronRight } from "@/components/ui/icons";

export const Accordion = RadixAccordion.Root;

export const AccordionItem = forwardRef<
  ElementRef<typeof RadixAccordion.Item>,
  ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(function AccordionItem({ className, ...rest }, ref) {
  return (
    <RadixAccordion.Item
      ref={ref}
      className={cn(
        "rounded-md overflow-hidden bg-background border border-border",
        className,
      )}
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
          ref={ref}
          className={cn(
            "group flex items-center h-12 w-full px-4 gap-2 bg-muted text-sm font-medium text-foreground transition-colors outline-none",
            "data-[state=open]:border-b data-[state=open]:border-border",
            "hover:bg-subtle",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
            className,
          )}
          {...rest}
        >
          {icon ? (
            <span
              aria-hidden
              className="inline-flex items-center justify-center shrink-0 size-4 [&>svg]:size-4"
            >
              {icon}
            </span>
          ) : (
            <IconChevronRight
              aria-hidden
              className="size-4 shrink-0 text-foreground transition-transform group-data-[state=open]:rotate-90"
            />
          )}
          <span className="flex-1 min-w-0 text-left truncate">{children}</span>
          {count !== undefined ? (
            <span className="shrink-0 text-sm font-normal text-subtle-foreground">
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
      ref={ref}
      className={cn("overflow-hidden", className)}
      {...rest}
    >
      <div className="flex flex-col">{children}</div>
    </RadixAccordion.Content>
  );
});
