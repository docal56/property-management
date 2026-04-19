import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TranscriptSpeaker = "agent" | "caller";

export interface TranscriptBubbleProps extends HTMLAttributes<HTMLDivElement> {
  speaker: TranscriptSpeaker;
  /** Optional meta text rendered under the bubble (e.g. "Agent · 0:00"). */
  meta?: ReactNode;
  children: ReactNode;
}

export function TranscriptBubble({
  speaker,
  meta,
  children,
  className,
  ...rest
}: TranscriptBubbleProps) {
  const alignmentClasses =
    speaker === "agent" ? "items-start" : "items-end";
  const bubbleClasses =
    speaker === "agent"
      ? "bg-subtle self-start"
      : "bg-info-soft self-end";

  return (
    <div
      className={cn("flex flex-col max-w-[70%] gap-1", alignmentClasses, className)}
      {...rest}
    >
      <div
        className={cn(
          "inline-flex rounded-lg py-2.5 px-3 text-sm text-foreground leading-normal",
          bubbleClasses,
        )}
      >
        {children}
      </div>
      {meta ? (
        <span className="text-xs text-subtle-foreground">{meta}</span>
      ) : null}
    </div>
  );
}

export interface TranscriptListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TranscriptList({
  children,
  className,
  ...rest
}: TranscriptListProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md gap-4 bg-background border border-border p-4",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface TranscriptRowProps extends HTMLAttributes<HTMLDivElement> {
  speaker: TranscriptSpeaker;
  children: ReactNode;
}

/** Single row inside TranscriptList — aligns the bubble to the right speaker side. */
export function TranscriptRow({
  speaker,
  children,
  className,
  ...rest
}: TranscriptRowProps) {
  return (
    <div
      className={cn(
        "flex",
        speaker === "agent" ? "justify-start" : "justify-end",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg py-2.5 px-3 text-sm text-foreground leading-normal",
          speaker === "agent" ? "bg-subtle" : "bg-info-soft",
        )}
      >
        {children}
      </div>
    </div>
  );
}
