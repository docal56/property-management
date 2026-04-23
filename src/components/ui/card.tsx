import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "bordered" | "elevated" | "flat";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  bordered: "bg-background border border-border",
  elevated: "bg-background shadow-sm",
  flat: "bg-subtle",
};

export function Card({ variant = "bordered", className, ...rest }: CardProps) {
  return (
    <div
      className={cn("rounded-md p-4", variantStyles[variant], className)}
      {...rest}
    />
  );
}
