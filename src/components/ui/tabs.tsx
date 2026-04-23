"use client";

import { Tabs as RadixTabs } from "radix-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

export const Tabs = RadixTabs.Root;
export const TabsContent = RadixTabs.Content;

export const TabsList = forwardRef<
  ElementRef<typeof RadixTabs.List>,
  ComponentPropsWithoutRef<typeof RadixTabs.List>
>(function TabsList({ className, ...rest }, ref) {
  return (
    <RadixTabs.List
      className={cn("flex border-border border-b", className)}
      ref={ref}
      {...rest}
    />
  );
});

export const TabsTrigger = forwardRef<
  ElementRef<typeof RadixTabs.Trigger>,
  ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(function TabsTrigger({ className, ...rest }, ref) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-3 py-2 font-medium text-sm outline-none transition-colors",
        "text-muted-foreground hover:text-foreground",
        "data-[state=active]:-mb-px data-[state=active]:border-foreground data-[state=active]:border-b-2 data-[state=active]:text-foreground",
        "focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:text-disabled",
        "[&>svg]:size-4",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
});
