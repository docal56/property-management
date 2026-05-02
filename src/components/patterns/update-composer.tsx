"use client";

import type { ChangeEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type UpdateComposerProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  onSend?: () => void;
  onAddMedia?: () => void;
  disabled?: boolean;
  mediaDisabled?: boolean;
  className?: string;
};

export function UpdateComposer({
  value,
  onValueChange,
  placeholder = "Add an update",
  onSend,
  onAddMedia,
  disabled = false,
  mediaDisabled = false,
  className,
}: UpdateComposerProps) {
  const canSend = Boolean(value && value.trim().length > 0) && !disabled;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey && canSend) {
      event.preventDefault();
      onSend?.();
    }
  };

  return (
    <div
      className={cn(
        "flex w-full items-center gap-md",
        "rounded-md border-[length:var(--border-hairline)] border-border bg-surface",
        "py-md pr-md pl-lg shadow-card",
        className,
      )}
    >
      <input
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent p-0",
          "font-regular text-14 text-foreground leading-150",
          "placeholder:text-foreground-muted",
          "focus:outline-none focus-visible:outline-none",
          "disabled:opacity-40",
        )}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={value ?? ""}
      />
      <button
        aria-label="Add image"
        className={cn(
          "inline-flex h-8 shrink-0 items-center justify-center rounded-[8px] px-sm",
          "border-[length:var(--border-hairline)] border-border bg-surface",
          "text-foreground shadow-card transition-colors",
          "hover:bg-neutral-100",
          "disabled:pointer-events-none disabled:opacity-40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        disabled={disabled || mediaDisabled}
        onClick={onAddMedia}
        type="button"
      >
        <Icon name="image-plus" size="md" />
      </button>
      <button
        aria-label="Send update"
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-xs rounded-[8px] py-md pr-sm pl-md",
          "bg-[#1f1f1f14] font-medium text-12 leading-none transition-colors",
          canSend
            ? "text-foreground hover:bg-[#1f1f1f1f]"
            : "text-foreground-muted",
          "disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        disabled={!canSend}
        onClick={onSend}
        type="button"
      >
        Send
        <Icon name="arrow-up" size="md" />
      </button>
    </div>
  );
}
