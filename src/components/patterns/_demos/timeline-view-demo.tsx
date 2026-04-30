import { TimelineView } from "@/components/patterns/timeline-view";
import { Icon } from "@/components/ui/icon";

export function TimelineViewDemo() {
  return (
    <TimelineView
      items={[
        {
          id: "1",
          variant: "icon-led",
          title: "Tenant reported issue",
          timestamp: "2 days ago",
          tone: "purple",
          icon: <Icon name="phone" size="sm" />,
        },
        {
          id: "2",
          variant: "avatar-led",
          authorName: "Teresa",
          authorAlt: "Teresa",
          timestamp: "2 days ago",
          body: "Reached out to Steve from Union Plumbing",
        },
        {
          id: "3",
          variant: "icon-led",
          title: "Issue scheduled",
          timestamp: "1 day ago",
          tone: "orange",
          icon: <Icon name="calendar" size="sm" />,
        },
        {
          id: "4",
          variant: "avatar-led",
          authorName: "Steve",
          authorAlt: "Steve",
          timestamp: "3 hours ago",
          body: "Booked in for Friday between 9am and 12pm.",
        },
      ]}
    />
  );
}
