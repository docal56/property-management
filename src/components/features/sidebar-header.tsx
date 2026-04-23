import type { HTMLAttributes } from "react";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { IconSettings } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  initials?: string;
  /** CSS background for the workspace avatar. Defaults to the Reloc8 brand teal. */
  avatarBackground?: string;
  /** CSS color for the initials. Defaults to the foreground token. */
  avatarColor?: string;
  onSettingsClick?: () => void;
}

export function SidebarHeader({
  name = "Reloc8 Properties",
  initials = "R8",
  avatarBackground = "#3dd8cf",
  avatarColor = "var(--color-foreground)",
  onSettingsClick,
  className,
  ...rest
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-full shrink-0 items-center gap-2 p-2",
        className,
      )}
      {...rest}
    >
      <Avatar
        initials={initials}
        size="sm"
        style={{ backgroundColor: avatarBackground, color: avatarColor }}
      />
      <span className="min-w-0 flex-1 truncate font-medium text-foreground text-sm">
        {name}
      </span>
      <IconButton
        aria-label="Workspace settings"
        className="size-6 rounded-sm"
        icon={<IconSettings />}
        onClick={onSettingsClick}
        variant="ghost"
      />
    </div>
  );
}
