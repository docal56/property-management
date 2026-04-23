import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "danger" | "info" | "neutral";
export type BadgeVariant = "soft" | "solid";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
}

const toneStyles: Record<BadgeVariant, Record<BadgeTone, string>> = {
  soft: {
    success:
      "bg-success-soft text-success-foreground border-success-foreground",
    danger: "bg-danger-soft text-danger-foreground border-danger-foreground",
    info: "bg-info-soft text-info-foreground border-info-foreground",
    neutral: "bg-subtle text-muted-foreground border-border-strong",
  },
  solid: {
    success: "bg-success text-inverse-foreground border-transparent",
    danger: "bg-danger text-inverse-foreground border-transparent",
    info: "bg-info text-inverse-foreground border-transparent",
    neutral: "bg-inverse text-inverse-foreground border-transparent",
  },
};

export function Badge({
  tone = "neutral",
  variant = "soft",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-xs leading-snug",
        toneStyles[variant][tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
