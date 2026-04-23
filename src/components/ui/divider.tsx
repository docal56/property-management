import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation;
}

export function Divider({
  orientation = "horizontal",
  className,
  ...rest
}: DividerProps) {
  return (
    <hr
      aria-orientation={orientation}
      className={cn(
        "m-0 shrink-0 border-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...rest}
    />
  );
}
