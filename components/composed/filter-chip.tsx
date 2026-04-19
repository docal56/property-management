import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@/components/ui/icons";

export interface FilterChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Leading icon (e.g. IconCalendar). */
  icon?: ReactNode;
  /** Visible label text. */
  label: string;
  /** Show as the active state (info-coloured border). */
  active?: boolean;
}

export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  function FilterChip(
    { icon, label, active, className, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center h-8 rounded-md pl-0.5 pr-1.5 bg-background border text-sm text-foreground transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:bg-muted disabled:border-border disabled:text-disabled disabled:cursor-not-allowed",
          active ? "border-info" : "border-border-strong hover:bg-subtle",
          className,
        )}
        {...rest}
      >
        <span className="inline-flex items-center px-1 gap-2">
          {icon ? (
            <span aria-hidden className="inline-flex shrink-0 [&>svg]:size-4">
              {icon}
            </span>
          ) : null}
          <span className="whitespace-nowrap">{label}</span>
        </span>
        <span
          aria-hidden
          className={cn(
            "self-center w-px h-5 mx-0.5 shrink-0",
            active ? "bg-border-strong" : "bg-border",
          )}
        />
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-5 h-8 shrink-0 [&>svg]:size-4 text-foreground"
        >
          <IconChevronDown />
        </span>
      </button>
    );
  },
);
