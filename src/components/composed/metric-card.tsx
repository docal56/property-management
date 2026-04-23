import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MetricCardGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
}

export function MetricCardGroup({
  children,
  className,
  ...rest
}: MetricCardGroupProps) {
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-md border border-border bg-background",
        "[&>*+*]:border-border [&>*+*]:border-l",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  className,
  ...rest
}: MetricCardProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-3 p-4", className)} {...rest}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-2xl text-foreground leading-tight">
        {value}
      </span>
    </div>
  );
}
