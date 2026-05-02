import { cn } from "@/lib/utils";
import { ICONS } from "./icons-data";

export const iconNames = Object.keys(ICONS) as IconName[];

export type IconName =
  | "activity"
  | "agent-profile"
  | "ai-agent"
  | "ai-edit"
  | "ai-toolkit"
  | "archive"
  | "arrow-down-circle"
  | "arrow-down-right"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up-right"
  | "arrow-up"
  | "board"
  | "calendar-timer"
  | "calendar"
  | "call-incoming"
  | "caret-down"
  | "caret-right"
  | "caret-up"
  | "chat"
  | "check-circle"
  | "check"
  | "chevron-down"
  | "chevron-right"
  | "circle-alert"
  | "clipboard"
  | "clock"
  | "comment"
  | "completed"
  | "contact"
  | "contacts"
  | "copy"
  | "email"
  | "end-arrow-close"
  | "enquiry"
  | "filter"
  | "forbid"
  | "home"
  | "image-plus"
  | "inbox"
  | "info"
  | "integrations"
  | "issues"
  | "list"
  | "menu"
  | "message"
  | "note"
  | "phone"
  | "refresh"
  | "search"
  | "selector"
  | "settings"
  | "sidebar"
  | "slash"
  | "status-in-progress"
  | "status-new"
  | "status-waiting"
  | "toolbox"
  | "trash"
  | "user"
  | "wallet"
  | "x";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

type IconProps = {
  name: IconName;
  size?: IconSize;
  className?: string;
  "aria-label"?: string;
};

const sizeClasses: Record<IconSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

function processSvg(svg: string): string {
  return svg
    .replace(/<svg([^>]*)\swidth="[^"]*"/, "<svg$1")
    .replace(/<svg([^>]*)\sheight="[^"]*"/, "<svg$1")
    .replace(/<svg/, '<svg width="100%" height="100%"')
    .replace(/(stroke|fill)="#1F1F1F"/gi, '$1="currentColor"')
    .replace(/(stroke|fill)="#222120"/gi, '$1="currentColor"');
}

export function Icon({
  name,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const raw = ICONS[name];
  if (!raw) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Icon name="${name}" /> — no SVG data for that name.`);
    }
    return null;
  }
  const svg = processSvg(raw);
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center",
    sizeClasses[size],
    className,
  );

  if (ariaLabel) {
    return (
      <span
        aria-label={ariaLabel}
        className={classes}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG markup is generated from checked-in design-system icon assets.
        dangerouslySetInnerHTML={{ __html: svg }}
        role="img"
      />
    );
  }

  return (
    <span
      aria-hidden
      className={classes}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG markup is generated from checked-in design-system icon assets.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
