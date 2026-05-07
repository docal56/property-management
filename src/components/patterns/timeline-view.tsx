import { Fragment, type ReactNode } from "react";
import type { AvatarTone } from "@/components/ui/avatar";
import { TimelineEvent } from "@/components/ui/timeline-event";
import { cn } from "@/lib/utils";

export type TimelineItem =
  | {
      id: string;
      variant: "avatar-led";
      authorName: ReactNode;
      timestamp: ReactNode;
      body: ReactNode;
      authorImageSrc?: string;
      authorAlt: string;
      actions?: ReactNode;
    }
  | {
      id: string;
      variant: "icon-led";
      title: ReactNode;
      timestamp: ReactNode;
      icon: ReactNode;
      iconImageSrc?: string;
      tone: AvatarTone;
    };

type TimelineViewProps = {
  items: TimelineItem[];
  title?: ReactNode;
  className?: string;
};

function Connector() {
  return (
    <div className="flex w-timeline-rail shrink-0 justify-center">
      <span
        aria-hidden="true"
        className="my-xs h-[25px] w-px shrink-0 rounded-full bg-neutral-500"
      />
    </div>
  );
}

function IconLedRow({
  title,
  timestamp,
}: {
  title: ReactNode;
  timestamp: ReactNode;
}) {
  return (
    <div className="flex w-full items-center">
      <div className="flex w-timeline-rail shrink-0 justify-center">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-neutral-600"
        />
      </div>
      <div className="ml-base flex min-w-0 items-center gap-md text-14 leading-120">
        <span className="truncate font-medium text-foreground">{title}</span>
        <span className="shrink-0 font-regular text-foreground-muted">
          {timestamp}
        </span>
      </div>
    </div>
  );
}

export function TimelineView({
  items,
  title = "Timeline",
  className,
}: TimelineViewProps) {
  const ordered = items.slice().reverse();
  return (
    <div className={cn("flex w-full flex-col gap-base", className)}>
      {title ? (
        <h3 className="px-lg font-medium text-14 text-foreground leading-120">
          {title}
        </h3>
      ) : null}
      <div className="flex w-full flex-col px-lg">
        {ordered.map((item, index) => {
          const showConnector = index < ordered.length - 1;
          if (item.variant === "icon-led") {
            return (
              <Fragment key={item.id}>
                <IconLedRow timestamp={item.timestamp} title={item.title} />
                {showConnector ? <Connector /> : null}
              </Fragment>
            );
          }
          return (
            <Fragment key={item.id}>
              <TimelineEvent
                actions={item.actions}
                authorAlt={item.authorAlt}
                authorImageSrc={item.authorImageSrc}
                authorName={item.authorName}
                body={item.body}
                showConnector={showConnector}
                timestamp={item.timestamp}
                variant="avatar-led"
              />
              {showConnector ? <Connector /> : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
