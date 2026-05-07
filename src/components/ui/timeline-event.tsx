import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar, type AvatarTone } from "./avatar";

type TimelineEventAvatarLedProps = {
  variant: "avatar-led";
  authorName: ReactNode;
  timestamp: ReactNode;
  body: ReactNode;
  authorImageSrc?: string;
  authorAlt: string;
  actions?: ReactNode;
  showConnector?: boolean;
  className?: string;
};

type TimelineEventIconLedProps = {
  variant: "icon-led";
  title: ReactNode;
  timestamp: ReactNode;
  icon: ReactNode;
  iconImageSrc?: string;
  tone: AvatarTone;
  showConnector?: boolean;
  className?: string;
};

type TimelineEventProps =
  | TimelineEventAvatarLedProps
  | TimelineEventIconLedProps;

function MetaRow({
  label,
  timestamp,
}: {
  label: ReactNode;
  timestamp: ReactNode;
}) {
  return (
    <div className="flex items-center gap-md">
      <span className="font-medium text-14 text-foreground leading-150">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="size-1 shrink-0 rounded-full bg-neutral-600"
      />
      <span className="text-12 text-foreground-muted leading-13">
        {timestamp}
      </span>
    </div>
  );
}

export function TimelineEvent(props: TimelineEventProps) {
  return (
    <div className={cn("flex w-full items-start gap-base", props.className)}>
      <div className="relative flex w-timeline-rail shrink-0 justify-center self-stretch">
        {props.variant === "icon-led" ? (
          props.iconImageSrc ? (
            <Avatar
              alt="Activity subject"
              className="relative z-10"
              src={props.iconImageSrc}
              variant="image"
            />
          ) : (
            <Avatar
              className="relative z-10"
              icon={props.icon}
              tone={props.tone}
              variant="icon"
            />
          )
        ) : (
          <Avatar
            alt={props.authorAlt}
            className="relative z-10"
            src={props.authorImageSrc}
            variant="image"
          />
        )}
        {props.showConnector ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[28px] -bottom-[28px] left-1/2 w-px -translate-x-1/2 bg-border"
          />
        ) : null}
      </div>

      {props.variant === "icon-led" ? (
        <div className="flex min-w-0 flex-1 items-center pt-xxs">
          <MetaRow label={props.title} timestamp={props.timestamp} />
        </div>
      ) : (
        <div className="group/timeline-comment flex min-w-0 flex-1 flex-col gap-md">
          <div className="flex min-w-0 items-start justify-between gap-md">
            <MetaRow label={props.authorName} timestamp={props.timestamp} />
            {props.actions ? (
              <div className="shrink-0 opacity-0 transition-opacity group-focus-within/timeline-comment:opacity-100 group-hover/timeline-comment:opacity-100">
                {props.actions}
              </div>
            ) : null}
          </div>
          <div className="w-full text-14 text-foreground-muted leading-150">
            {props.body}
          </div>
        </div>
      )}
    </div>
  );
}
