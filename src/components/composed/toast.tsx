import type { HTMLAttributes, ReactNode } from "react";
import { IconClose } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** Leading icon — typically IconCheck (success) or IconAlertCircle (danger). */
  icon?: ReactNode;
  /** Accessible label for the dismiss button. */
  dismissLabel?: string;
  onDismiss?: () => void;
}

export function Toast({
  icon,
  children,
  onDismiss,
  dismissLabel = "Dismiss notification",
  className,
  ...rest
}: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex w-full max-w-90 items-center gap-3 rounded-md bg-background px-4 py-3 shadow-sm",
        className,
      )}
      role="status"
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden
          className="inline-flex size-5 shrink-0 items-center justify-center text-foreground [&>svg]:size-4"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 text-foreground text-sm">{children}</span>
      {onDismiss ? (
        <button
          aria-label={dismissLabel}
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-foreground hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          onClick={onDismiss}
          type="button"
        >
          <IconClose className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
