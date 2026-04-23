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
        "mx-auto flex w-full max-w-120 flex-col items-center gap-4 rounded-md border border-border border-dashed bg-background px-8 py-12",
        className,
      )}
      {...rest}
    >
      {icon ? (
        <div
          aria-hidden
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-subtle text-muted-foreground [&>svg]:size-6"
        >
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col items-center gap-1">
        <div className="text-center font-medium text-base text-foreground">
          {title}
        </div>
        {description ? (
          <p className="text-center text-muted-foreground text-sm leading-normal">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
