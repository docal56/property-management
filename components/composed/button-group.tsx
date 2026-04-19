import {
  Children,
  Fragment,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface ButtonGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ReactNode;
  "aria-label": string;
}

export function ButtonGroup({
  children,
  className,
  ...rest
}: ButtonGroupProps) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center rounded-md border border-border-strong bg-background overflow-hidden",
        className,
      )}
      {...rest}
    >
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span
              aria-hidden
              className="self-center w-px h-5 bg-border shrink-0"
            />
          ) : null}
          {child}
        </Fragment>
      ))}
    </div>
  );
}

export function ButtonGroupItem({
  icon,
  className,
  type = "button",
  ...rest
}: ButtonGroupItemProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center w-9 h-8 shrink-0 text-foreground transition-colors",
        "hover:bg-subtle",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
        "disabled:bg-transparent disabled:text-disabled disabled:cursor-not-allowed",
        "[&>svg]:size-4",
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
