import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary action — usually a Button. */
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center w-full max-w-120 mx-auto rounded-md py-12 px-8 gap-4 bg-background border border-dashed border-border",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <div
          aria-hidden
          className="inline-flex items-center justify-center shrink-0 rounded-full bg-subtle size-12 text-muted-foreground [&>svg]:size-6"
        >
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col items-center gap-1">
        <div className="text-center text-base font-medium text-foreground">
          {title}
        </div>
        {description ? (
          <p className="text-center text-sm text-muted-foreground leading-normal">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
