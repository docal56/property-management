import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InputSize = "sm" | "md";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Visual height. `sm` = 32px (default), `md` = 40px. */
  size?: InputSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Render the field with the error visual (red border). */
  invalid?: boolean;
  /** Class names applied to the outer wrapper, not the <input>. */
  wrapperClassName?: string;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8",
  md: "h-10",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "sm",
    leadingIcon,
    trailingIcon,
    invalid,
    disabled,
    className,
    wrapperClassName,
    ...rest
  },
  ref,
) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-3 gap-2 bg-background border transition-colors",
        sizeClasses[size],
        invalid
          ? "border-danger focus-within:border-danger focus-within:ring-[3px] focus-within:ring-danger-soft"
          : "border-border-strong focus-within:border-info focus-within:ring-[3px] focus-within:ring-info-soft",
        disabled && "bg-muted border-border cursor-not-allowed",
        wrapperClassName,
      )}
    >
      {leadingIcon ? (
        <span
          aria-hidden
          className={cn(
            "inline-flex shrink-0 [&>svg]:size-4",
            disabled ? "text-disabled" : "text-subtle-foreground",
          )}
        >
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex-1 min-w-0 bg-transparent text-sm text-foreground outline-none",
          "placeholder:text-subtle-foreground",
          "disabled:text-disabled disabled:cursor-not-allowed",
          className,
        )}
        {...rest}
      />
      {trailingIcon ? (
        <span
          aria-hidden
          className={cn(
            "inline-flex shrink-0 [&>svg]:size-4",
            disabled ? "text-disabled" : "text-foreground",
          )}
        >
          {trailingIcon}
        </span>
      ) : null}
    </div>
  );
});
