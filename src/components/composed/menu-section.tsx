import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MenuSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional section label shown above the items. */
  label?: string;
  children: ReactNode;
}

export function MenuSection({
  label,
  className,
  children,
  ...rest
}: MenuSectionProps) {
  return (
    <div className={cn("flex flex-col", className)} {...rest}>
      {label ? (
        <div className="px-2 py-2 font-medium text-sm text-subtle-foreground">
          {label}
        </div>
      ) : null}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
