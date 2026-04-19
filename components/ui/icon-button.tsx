import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type IconButtonVariant = "secondary" | "ghost";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: IconButtonVariant;
  icon: ReactNode;
  /** Required — icon-only buttons must have an accessible label. */
  "aria-label": string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  secondary: cn(
    "bg-background text-foreground border border-border-strong",
    "hover:bg-subtle",
    "disabled:bg-muted disabled:text-disabled disabled:border-border",
  ),
  ghost: cn(
    "bg-transparent text-foreground",
    "hover:bg-subtle",
    "disabled:bg-transparent disabled:text-disabled",
  ),
};

export function IconButton({
  variant = "secondary",
  icon,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center size-8 shrink-0 rounded-md transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed",
        "[&>svg]:size-4",
        variantStyles[variant],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
