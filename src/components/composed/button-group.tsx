import {
  type ButtonHTMLAttributes,
  Children,
  Fragment,
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
    // biome-ignore lint/a11y/useSemanticElements: no native HTML equivalent for a generic button group; role="group" is the WAI-ARIA recommendation
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md border border-border-strong bg-background",
        className,
      )}
      role="group"
      {...rest}
    >
      {items.map((child, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: children order is stable; index is the intentional identity for separator insertion
        <Fragment key={i}>
          {i > 0 ? (
            <span
              aria-hidden
              className="h-5 w-px shrink-0 self-center bg-border"
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
      className={cn(
        "inline-flex h-8 w-9 shrink-0 items-center justify-center text-foreground transition-colors",
        "hover:bg-subtle",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]",
        "disabled:cursor-not-allowed disabled:bg-transparent disabled:text-disabled",
        "[&>svg]:size-4",
        className,
      )}
      type={type}
      {...rest}
    >
      {icon}
    </button>
  );
}
