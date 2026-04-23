import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

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
        aria-pressed={active}
        className={cn(
          "inline-flex h-8 items-center rounded-md border bg-background pr-1.5 pl-0.5 text-foreground text-sm transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-disabled",
          active ? "border-info" : "border-border-strong hover:bg-subtle",
          className,
        )}
        ref={ref}
        type={type}
        {...rest}
      >
        <span className="inline-flex items-center gap-2 px-1">
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
            "mx-0.5 h-5 w-px shrink-0 self-center",
            active ? "bg-border-strong" : "bg-border",
          )}
        />
        <span
          aria-hidden
          className="inline-flex h-8 w-5 shrink-0 items-center justify-center text-foreground [&>svg]:size-4"
        >
          <IconChevronDown />
        </span>
      </button>
    );
  },
);
