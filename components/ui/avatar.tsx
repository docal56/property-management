import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  initials?: string;
  src?: string;
  alt?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "size-6 text-xs",
  md: "size-8 text-sm",
};

export function Avatar({
  size = "md",
  initials,
  src,
  alt,
  className,
  ...rest
}: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-inverse text-inverse-foreground font-medium shrink-0 overflow-hidden select-none",
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt ?? ""} className="size-full object-cover" />
      ) : (
        <span aria-hidden={alt ? undefined : true}>{initials}</span>
      )}
    </span>
  );
}
