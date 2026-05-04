export type NavItem = {
  href: string;
  title: string;
  summary?: string;
  entries?: string[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Primitives",
    items: [
      {
        href: "/components/colours",
        title: "Colours",
        summary: "System and support palette swatches.",
        entries: [
          "base",
          "neutrals",
          "opacity",
          "blue",
          "green",
          "red",
          "yellow",
          "purple",
          "orange",
          "teal",
          "pink",
          "light blue",
        ],
      },
      {
        href: "/components/typography",
        title: "Typography",
        summary: "Font, weights, sizes, and line heights.",
        entries: [
          "geist",
          "regular",
          "medium",
          "semibold",
          "text-12",
          "text-13",
          "text-14",
          "text-16",
          "text-20",
          "leading-120",
          "leading-160",
        ],
      },
      {
        href: "/components/spacing",
        title: "Spacing",
        summary: "Padding / margin / gap scale.",
        entries: [
          "xs",
          "sm",
          "md",
          "base",
          "lg",
          "xl",
          "4px",
          "6px",
          "8px",
          "12px",
          "16px",
          "32px",
        ],
      },
      {
        href: "/components/radius",
        title: "Radius",
        summary: "Corner-radius scale.",
        entries: [
          "radius-none",
          "radius-sm",
          "radius-md",
          "radius-lg",
          "radius-full",
        ],
      },
      {
        href: "/components/borders",
        title: "Borders",
        summary: "Border widths (hairline, standard, ring).",
        entries: ["border-hairline", "border-standard", "border-ring"],
      },
      {
        href: "/components/icon-size",
        title: "Icon Size",
        summary: "Icon size scale (xs–xl).",
        entries: [
          "icon-size-xs",
          "icon-size-sm",
          "icon-size-md",
          "icon-size-lg",
          "icon-size-xl",
        ],
      },
      {
        href: "/components/icon-stroke",
        title: "Icon Stroke",
        summary: "Icon stroke weight scale.",
        entries: [
          "icon-stroke-xs",
          "icon-stroke-sm",
          "icon-stroke-md",
          "icon-stroke-lg",
          "icon-stroke-xl",
        ],
      },
      {
        href: "/components/shadow",
        title: "Shadow",
        summary: "Elevation shadows.",
        entries: ["shadow-subtle", "shadow-default", "shadow-hover"],
      },
      {
        href: "/components/tokens",
        title: "Semantic Tokens",
        summary: "Text, bg, button, border, and status semantic tokens.",
        entries: [
          "foreground",
          "foreground-inverted",
          "foreground-muted",
          "foreground-subtle",
          "foreground-placeholder",
          "link",
          "background",
          "surface",
          "hover",
          "selected",
          "primary",
          "secondary",
          "ghost",
          "destructive",
          "border",
          "border-strong",
          "ring",
          "success",
          "warning",
          "info",
          "success-soft",
          "destructive-soft",
          "warning-soft",
          "info-soft",
        ],
      },
    ],
  },
  {
    title: "Components",
    items: [
      {
        href: "/components/actions",
        title: "Actions",
        summary: "Button, Icon Button, Round Button.",
        entries: [
          "button",
          "icon button",
          "round button",
          "primary",
          "secondary",
          "ghost",
          "destructive",
          "cta",
        ],
      },
      {
        href: "/components/form-controls",
        title: "Form Controls",
        summary: "Text Input, Textarea, Toggle.",
        entries: ["text input", "textarea", "toggle", "switch", "search"],
      },
      {
        href: "/components/selection-menus",
        title: "Selection & Menus",
        summary: "Tabs, Dropdown Menu.",
        entries: ["tabs", "tab", "dropdown", "menu", "option"],
      },
      {
        href: "/components/navigation",
        title: "Navigation",
        summary: "Main Nav Item, Breadcrumb, Page Title.",
        entries: ["main nav item", "breadcrumb", "page title"],
      },
      {
        href: "/components/badges-chips",
        title: "Badges & Chips",
        summary: "Label, Label Small, Meta Chip.",
        entries: ["label", "label small", "meta chip", "pill", "badge"],
      },
      {
        href: "/components/media-containers",
        title: "Media & Containers",
        summary: "Avatar, Card, Board Card.",
        entries: ["avatar", "card", "board card"],
      },
      {
        href: "/components/data-rows",
        title: "Data Rows",
        summary:
          "Table Header, Detail Row, Chat Bubble, Table Row, Timeline Event.",
        entries: [
          "table header",
          "detail row",
          "chat bubble",
          "table row",
          "timeline event",
        ],
      },
    ],
  },
  {
    title: "Patterns",
    items: [
      {
        href: "/components/patterns",
        title: "Patterns",
        summary: "Composed building blocks. The shapes behind every page.",
        entries: [
          "app shell",
          "page content",
          "main container",
          "main nav",
          "page header list",
          "page header detail",
          "search header",
          "showing results for",
          "kanban board",
          "kanban column",
          "sidebar panel",
          "data table",
          "tabbed content",
          "timeline view",
          "transcript view",
          "update composer",
          "call detail side panel",
          "drag and drop",
          "dnd",
        ],
      },
    ],
  },
  {
    title: "Icons",
    items: [
      {
        href: "/components/icons",
        title: "Icon Library",
        summary: "Every icon available in the app.",
        entries: ["svg", "glyph"],
      },
    ],
  },
];

export function flatNavItems(): Array<NavItem & { group: string }> {
  return navGroups.flatMap((g) =>
    g.items.map((i) => ({ ...i, group: g.title })),
  );
}
