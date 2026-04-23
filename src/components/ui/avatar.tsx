import Image from "next/image";
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

const sizePx: Record<AvatarSize, number> = {
  sm: 24,
  md: 32,
};

export function Avatar({
  size = "md",
  initials,
  src,
  alt,
  className,
  ...rest
}: AvatarProps) {
  const px = sizePx[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-inverse font-medium text-inverse-foreground",
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        <Image
          alt={alt ?? ""}
          className="size-full object-cover"
          height={px}
          src={src}
          unoptimized
          width={px}
        />
      ) : (
        <span aria-hidden={alt ? undefined : true}>{initials}</span>
      )}
    </span>
  );
}
