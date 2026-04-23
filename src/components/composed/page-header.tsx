import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** Trailing content — typically a SearchInput, FilterChip, or action buttons. */
  actions?: ReactNode;
}

export function PageHeader({
  title,
  actions,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-14 w-full items-center gap-4 border-border border-b bg-background px-4",
        className,
      )}
      {...rest}
    >
      <h1 className="min-w-0 flex-1 truncate font-medium text-base text-foreground">
        {title}
      </h1>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
