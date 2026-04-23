import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 gap-1.5 text-sm",
  md: "h-8 px-3 gap-2 text-sm",
  lg: "h-10 px-4 gap-2 text-sm",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-info text-inverse-foreground",
    "hover:bg-info-foreground",
    "disabled:bg-disabled disabled:text-inverse-foreground",
  ),
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

export function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-md font-medium leading-snug transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      type={type}
      {...rest}
    >
      {leadingIcon ? (
        <span aria-hidden className="inline-flex shrink-0 [&>svg]:size-4">
          {leadingIcon}
        </span>
      ) : null}
      {children}
      {trailingIcon ? (
        <span aria-hidden className="inline-flex shrink-0 [&>svg]:size-4">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
}
