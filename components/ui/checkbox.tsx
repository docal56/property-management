import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { IconCheck } from "@/components/ui/icons";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visual label rendered next to the box. */
  label?: string;
}

export function Checkbox({
  className,
  disabled,
  label,
  id,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2",
        disabled ? "cursor-not-allowed text-disabled" : "cursor-pointer",
        className,
      )}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        disabled={disabled}
        className="peer sr-only"
        {...rest}
      />
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center justify-center size-4.5 shrink-0 rounded-sm border bg-background border-border-strong text-inverse-foreground",
          "peer-hover:bg-subtle peer-hover:border-muted-foreground",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
          "peer-checked:bg-info peer-checked:border-info peer-checked:hover:bg-info peer-checked:hover:border-info",
          "peer-disabled:bg-subtle peer-disabled:border-border",
          "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
        )}
      >
        <IconCheck className="size-3" strokeWidth={3} />
      </span>
      {label ? <span className="text-base">{label}</span> : null}
    </label>
  );
}
