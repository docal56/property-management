import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { IconSettings } from "@/components/ui/icons";

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
        "flex items-center w-full h-10 gap-2 p-2 shrink-0",
        className,
      )}
      {...rest}
    >
      <Avatar
        size="sm"
        initials={initials}
        style={{ backgroundColor: avatarBackground, color: avatarColor }}
      />
      <span className="flex-1 min-w-0 truncate text-sm font-medium text-foreground">
        {name}
      </span>
      <IconButton
        variant="ghost"
        icon={<IconSettings />}
        aria-label="Workspace settings"
        onClick={onSettingsClick}
        className="size-6 rounded-sm"
      />
    </div>
  );
}
