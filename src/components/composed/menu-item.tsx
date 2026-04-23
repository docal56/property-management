"use client";

import {
  type ButtonHTMLAttributes,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface MenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon?: ReactNode;
  label: string;
  /** Show as the currently-selected item (elevated card look). */
  active?: boolean;
  /**
   * Render onto a child element (e.g. Next.js Link) instead of a <button>.
   * The child's className, data-, and aria- attributes are merged; MenuItem's
   * icon + label are injected as the child's content.
   */
  asChild?: boolean;
  /** When asChild, the target element (typically `<Link href=".." />`). */
  children?: ReactNode;
}

type AsChildProps = {
  className?: string;
  "data-active"?: boolean | "true" | undefined;
  "aria-current"?: "page" | undefined;
  "aria-disabled"?: boolean | undefined;
};

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  function MenuItem(
    {
      icon,
      label,
      active,
      disabled,
      className,
      asChild,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const baseClasses = cn(
      "inline-flex h-10 w-full select-none items-center gap-2 rounded-md p-2 font-medium text-sm transition-colors",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
      active
        ? "border border-border bg-background text-foreground shadow-sm"
        : disabled
          ? "cursor-not-allowed text-disabled"
          : "cursor-pointer text-foreground hover:bg-subtle",
      className,
    );

    const content = (
      <>
        {icon ? (
          <span
            aria-hidden
            className="inline-flex size-6 shrink-0 items-center justify-center [&>svg]:size-5"
          >
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      </>
    );

    if (asChild && isValidElement<AsChildProps>(children)) {
      return cloneElement(
        children,
        {
          ...rest,
          className: cn(baseClasses, children.props.className),
          "data-active": active ? true : undefined,
          "aria-current": active ? "page" : undefined,
          "aria-disabled": disabled || undefined,
        },
        content,
      );
    }

    return (
      <button
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled || undefined}
        className={baseClasses}
        data-active={active || undefined}
        disabled={disabled}
        ref={ref}
        type={type}
        {...rest}
      >
        {content}
      </button>
    );
  },
);
