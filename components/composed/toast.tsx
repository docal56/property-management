import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconClose } from "@/components/ui/icons";

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
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center w-full max-w-90 rounded-md py-3 px-4 gap-3 bg-background shadow-sm",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden
          className="inline-flex items-center justify-center shrink-0 size-5 [&>svg]:size-4 text-foreground"
        >
          {icon}
        </span>
      ) : null}
      <span className="flex-1 min-w-0 text-sm text-foreground">{children}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="inline-flex items-center justify-center shrink-0 size-5 text-foreground rounded-sm hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <IconClose className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
