"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { IconPause, IconPlay } from "@/components/ui/icons";

export interface AudioPlayerProps extends HTMLAttributes<HTMLDivElement> {
  playing?: boolean;
  /** Current time as a formatted string (e.g. "0:42"). */
  currentTime: string;
  /** Duration as a formatted string (e.g. "1:24"). */
  duration: string;
  /** Progress as a fraction from 0 to 1. */
  progress: number;
  onPlayPauseClick?: () => void;
}

export function AudioPlayer({
  playing = false,
  currentTime,
  duration,
  progress,
  onPlayPauseClick,
  className,
  ...rest
}: AudioPlayerProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percent = `${clampedProgress * 100}%`;

  return (
    <div
      className={cn("flex items-center w-full h-12 px-4 gap-4", className)}
      {...rest}
    >
      <button
        type="button"
        onClick={onPlayPauseClick}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "inline-flex items-center justify-center shrink-0 rounded-full size-8 bg-inverse text-inverse-foreground transition-colors",
          "hover:opacity-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        {playing ? (
          <IconPause className="size-3" />
        ) : (
          <IconPlay className="size-3" />
        )}
      </button>
      <span className="w-10 shrink-0 text-sm text-muted-foreground tabular-nums">
        {currentTime}
      </span>
      <div
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={clampedProgress}
        aria-valuetext={`${currentTime} of ${duration}`}
        className="relative flex-1 h-1.5 rounded-full bg-border"
      >
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-inverse"
          style={{ width: percent }}
        />
        {playing ? (
          <div
            className="absolute rounded-full bg-background border-2 border-inverse size-3"
            style={{ left: percent, top: "-3px", transform: "translateX(-50%)" }}
          />
        ) : null}
      </div>
      <span className="w-10 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
        {duration}
      </span>
    </div>
  );
}
