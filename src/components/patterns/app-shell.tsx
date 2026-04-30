import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppShellProps = {
  nav: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AppShell({ nav, children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "flex h-dvh gap-xs overflow-hidden bg-background pr-md",
        className,
      )}
    >
      {nav}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

type PageContentProps = {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "page" | "detail";
};

export function PageContent({
  header,
  children,
  className,
  contentClassName,
  variant = "page",
}: PageContentProps) {
  const innerClasses =
    variant === "detail"
      ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      : "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-t-lg bg-surface p-base shadow-default";

  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col", className)}>
      {header}
      <div className={cn(innerClasses, contentClassName)}>{children}</div>
    </div>
  );
}
