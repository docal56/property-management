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
    "border border-border-strong bg-background text-foreground",
    "hover:bg-subtle",
    "disabled:border-border disabled:bg-muted disabled:text-disabled",
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
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed",
        "[&>svg]:size-4",
        variantStyles[variant],
        className,
      )}
      type={type}
      {...rest}
    >
      {icon}
    </button>
  );
}
