"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RoundButton } from "@/components/ui/round-button";
import { Textarea } from "@/components/ui/textarea";
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

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange?.(event.target.value);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-xl rounded-md border border-border bg-surface p-md",
        className,
      )}
    >
      <Textarea
        className="min-h-12 border-0 p-0 shadow-none focus-visible:ring-0"
        disabled={disabled}
        onChange={handleChange}
        placeholder={placeholder}
        value={value}
      />
      <div className="flex items-center justify-between">
        <Button
          disabled={disabled || mediaDisabled}
          onClick={onAddMedia}
          trailingIcon={<Icon name="image-plus" size="md" />}
          variant="secondary"
        >
          Add Media
        </Button>
        <RoundButton
          aria-label="Send update"
          disabled={!canSend}
          icon={<Icon name="arrow-up" size="md" />}
          onClick={onSend}
        />
      </div>
    </div>
  );
}
