import type { ReactNode } from "react";
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

export function TimelineView({
  items,
  title = "Timeline",
  className,
}: TimelineViewProps) {
  return (
    <div className={cn("flex w-full flex-col gap-base", className)}>
      {title ? (
        <h3 className="px-md font-medium text-14 text-foreground leading-120">
          {title}
        </h3>
      ) : null}
      <div
        className={cn(
          "flex flex-col items-start rounded-card bg-surface p-lg",
          "border-[length:var(--border-hairline)] border-border",
          "shadow-card",
        )}
      >
        <div className="flex w-full flex-col items-stretch gap-3xl">
          {items
            .slice()
            .reverse()
            .map((item, index, reversed) => {
              const showConnector = index < reversed.length - 1;
              if (item.variant === "avatar-led") {
                return (
                  <TimelineEvent
                    actions={item.actions}
                    authorAlt={item.authorAlt}
                    authorImageSrc={item.authorImageSrc}
                    authorName={item.authorName}
                    body={item.body}
                    key={item.id}
                    showConnector={showConnector}
                    timestamp={item.timestamp}
                    variant="avatar-led"
                  />
                );
              }
              return (
                <TimelineEvent
                  icon={item.icon}
                  iconImageSrc={item.iconImageSrc}
                  key={item.id}
                  showConnector={showConnector}
                  timestamp={item.timestamp}
                  title={item.title}
                  tone={item.tone}
                  variant="icon-led"
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
