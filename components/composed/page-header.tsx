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
        "flex items-center w-full h-14 px-4 gap-4 bg-background border-b border-border",
        className,
      )}
      {...rest}
    >
      <h1 className="flex-1 min-w-0 text-base font-medium text-foreground truncate">
        {title}
      </h1>
      {actions ? (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
