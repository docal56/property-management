"use client";

import type { HTMLAttributes } from "react";
import { IconPause, IconPlay } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

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
      className={cn("flex h-12 w-full items-center gap-4 px-4", className)}
      {...rest}
    >
      <button
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-inverse text-inverse-foreground transition-colors",
          "hover:opacity-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        )}
        onClick={onPlayPauseClick}
        type="button"
      >
        {playing ? (
          <IconPause className="size-3" />
        ) : (
          <IconPlay className="size-3" />
        )}
      </button>
      <span className="w-10 shrink-0 text-muted-foreground text-sm tabular-nums">
        {currentTime}
      </span>
      <div
        aria-label="Playback progress"
        aria-valuemax={1}
        aria-valuemin={0}
        aria-valuenow={clampedProgress}
        aria-valuetext={`${currentTime} of ${duration}`}
        className="relative h-1.5 flex-1 rounded-full bg-border"
        role="progressbar"
      >
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-inverse"
          style={{ width: percent }}
        />
        {playing ? (
          <div
            className="absolute size-3 rounded-full border-2 border-inverse bg-background"
            style={{
              left: percent,
              top: "-3px",
              transform: "translateX(-50%)",
            }}
          />
        ) : null}
      </div>
      <span className="w-10 shrink-0 text-right text-muted-foreground text-sm tabular-nums">
        {duration}
      </span>
    </div>
  );
}
