import type { InputHTMLAttributes } from "react";
import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

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
        className="peer sr-only"
        disabled={disabled}
        id={id}
        type="checkbox"
        {...rest}
      />
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-4.5 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-background text-inverse-foreground",
          "peer-hover:border-muted-foreground peer-hover:bg-subtle",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring peer-focus-visible:outline-offset-2",
          "peer-checked:border-info peer-checked:bg-info peer-checked:hover:border-info peer-checked:hover:bg-info",
          "peer-disabled:border-border peer-disabled:bg-subtle",
          "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
        )}
      >
        <IconCheck className="size-3" strokeWidth={3} />
      </span>
      {label ? <span className="text-base">{label}</span> : null}
    </label>
  );
}
