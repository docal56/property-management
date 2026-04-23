import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionBlockProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** Trailing header element — typically a link or small action button. */
  action?: ReactNode;
  children: ReactNode;
}

export function SectionBlock({
  title,
  action,
  children,
  className,
  ...rest
}: SectionBlockProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)} {...rest}>
      <div className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 font-medium text-foreground text-sm">
          {title}
        </h2>
        {action ? (
          <div className="shrink-0 font-medium text-info text-sm">{action}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
