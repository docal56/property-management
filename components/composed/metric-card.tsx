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
        "flex rounded-md overflow-hidden bg-background border border-border",
        "[&>*+*]:border-l [&>*+*]:border-border",
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
    <div
      className={cn("flex flex-col flex-1 gap-3 p-4", className)}
      {...rest}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-medium leading-tight text-foreground">
        {value}
      </span>
    </div>
  );
}
