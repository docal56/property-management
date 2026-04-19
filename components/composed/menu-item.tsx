"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
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
      "inline-flex items-center w-full h-10 rounded-md p-2 gap-2 text-sm font-medium transition-colors select-none",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      active
        ? "bg-background border border-border shadow-sm text-foreground"
        : disabled
          ? "text-disabled cursor-not-allowed"
          : "text-foreground hover:bg-subtle cursor-pointer",
      className,
    );

    const content = (
      <>
        {icon ? (
          <span
            aria-hidden
            className="inline-flex items-center justify-center shrink-0 size-6 [&>svg]:size-5"
          >
            {icon}
          </span>
        ) : null}
        <span className="flex-1 min-w-0 text-left truncate">{label}</span>
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
        ref={ref}
        type={type}
        disabled={disabled}
        data-active={active || undefined}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled || undefined}
        className={baseClasses}
        {...rest}
      >
        {content}
      </button>
    );
  },
);
