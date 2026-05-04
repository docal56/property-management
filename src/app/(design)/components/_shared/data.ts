export type ColorStop = { name: string; hex: string; sub?: string };
export type ColorRow = { label: string; stops: ColorStop[] };

export const systemColors: ColorRow[] = [
  {
    label: "Base",
    stops: [
      { name: "base-white", hex: "#FFFFFF" },
      { name: "base-black", hex: "#1F1F1F" },
    ],
  },
  {
    label: "Neutrals",
    stops: [
      { name: "neutral-100", hex: "#FCFCFC" },
      { name: "neutral-200", hex: "#FAFAFA" },
      { name: "neutral-300", hex: "#F5F5F5" },
      { name: "neutral-400", hex: "#F0F0F0" },
      { name: "neutral-500", hex: "#E6E6E6" },
      { name: "neutral-600", hex: "#DBDBDB" },
      { name: "neutral-700", hex: "#A8A8A8" },
      { name: "neutral-800", hex: "#808080" },
      { name: "neutral-900", hex: "#525252" },
    ],
  },
  {
    label: "Opacity",
    stops: [
      { name: "opacity-0", hex: "#1F1F1F", sub: "0%" },
      { name: "opacity-4", hex: "#1F1F1F", sub: "4%" },
      { name: "opacity-8", hex: "#1F1F1F", sub: "8%" },
      { name: "opacity-60", hex: "#1F1F1F", sub: "60%" },
    ],
  },
  {
    label: "Blue",
    stops: [
      { name: "blue-100", hex: "#F5F7FF" },
      { name: "blue-200", hex: "#ADC2FF" },
      { name: "blue-300", hex: "#2A5CF4" },
      { name: "blue-400", hex: "#1F42AD" },
      { name: "blue-500", hex: "#122354" },
    ],
  },
  {
    label: "Green",
    stops: [
      { name: "green-100", hex: "#F5FEF5" },
      { name: "green-200", hex: "#B1FBB1" },
      { name: "green-300", hex: "#0AC20A" },
      { name: "green-400", hex: "#089108" },
      { name: "green-500", hex: "#033003" },
    ],
  },
  {
    label: "Red",
    stops: [
      { name: "red-100", hex: "#FFF5F5" },
      { name: "red-200", hex: "#FFADB0" },
      { name: "red-300", hex: "#F42A31" },
      { name: "red-400", hex: "#AD1F23" },
      { name: "red-500", hex: "#541215" },
    ],
  },
  {
    label: "Yellow",
    stops: [
      { name: "yellow-100", hex: "#FFFCF5" },
      { name: "yellow-200", hex: "#FFE4AD" },
      { name: "yellow-300", hex: "#F4B02A" },
      { name: "yellow-400", hex: "#AD7E1F" },
      { name: "yellow-500", hex: "#543E12" },
    ],
  },
];

export const supportColors: ColorRow[] = [
  {
    label: "Purple",
    stops: [
      { name: "purple-100", hex: "#F8F5FF" },
      { name: "purple-200", hex: "#C9ADFF" },
      { name: "purple-300", hex: "#6D2AF4" },
      { name: "purple-400", hex: "#4E1FAD" },
      { name: "purple-500", hex: "#281254" },
    ],
  },
  {
    label: "Orange",
    stops: [
      { name: "orange-100", hex: "#FFF9F5" },
      { name: "orange-200", hex: "#FFCFAD" },
      { name: "orange-300", hex: "#F47E2A" },
      { name: "orange-400", hex: "#AD5A1F" },
      { name: "orange-500", hex: "#542E12" },
    ],
  },
  {
    label: "Teal",
    stops: [
      { name: "teal-100", hex: "#F5FFFC" },
      { name: "teal-200", hex: "#ADFFE9" },
      { name: "teal-300", hex: "#2AF4BE" },
      { name: "teal-400", hex: "#1FAD87" },
      { name: "teal-500", hex: "#125442" },
    ],
  },
  {
    label: "Pink",
    stops: [
      { name: "pink-100", hex: "#FEF5FF" },
      { name: "pink-200", hex: "#FAADFF" },
      { name: "pink-300", hex: "#E62AF4" },
      { name: "pink-400", hex: "#A41FAD" },
      { name: "pink-500", hex: "#4F1254" },
    ],
  },
  {
    label: "Light Blue",
    stops: [
      { name: "light-blue-100", hex: "#F5FCFF" },
      { name: "light-blue-200", hex: "#ADE9FF" },
      { name: "light-blue-300", hex: "#2ABEF4" },
      { name: "light-blue-400", hex: "#1F87AD" },
      { name: "light-blue-500", hex: "#124254" },
    ],
  },
];

export const weights = [
  {
    name: "font-weight-regular",
    label: "Regular",
    value: 400,
    usage: "Body copy, long-form text",
  },
  {
    name: "font-weight-medium",
    label: "Medium",
    value: 500,
    usage: "Emphasis — button and nav labels, active states",
  },
  {
    name: "font-weight-semibold",
    label: "Semi-bold",
    value: 600,
    usage: "Page titles and section headings",
  },
];

export const textSizes = [
  { name: "text-12", px: 12, usage: "Metadata, small chips, form microcopy" },
  { name: "text-13", px: 13, usage: "Table cells and compact body copy" },
  { name: "text-14", px: 14, usage: "Default body text and controls" },
  { name: "text-16", px: 16, usage: "Card headings and medium emphasis" },
  { name: "text-20", px: 20, usage: "Page headings" },
];

export const lineHeights = [
  {
    name: "leading-120",
    value: "120%",
    usage: "Short labels and single-line text",
  },
  {
    name: "leading-160",
    value: "160%",
    usage: "Paragraphs and multi-line body copy",
  },
];

export const spacing = [
  {
    name: "spacing-xs",
    px: 4,
    usage: "Tight inline gaps (icon to text in a single row)",
  },
  {
    name: "spacing-sm",
    px: 6,
    usage: "Compact padding for dense controls (round buttons)",
  },
  {
    name: "spacing-md",
    px: 8,
    usage: "Default inline gap between elements, small button padding",
  },
  {
    name: "spacing-base",
    px: 12,
    usage:
      "Standard padding inside primitives (button x-padding, card content)",
  },
  {
    name: "spacing-lg",
    px: 16,
    usage: "Outer padding for cards and panels, gap between components",
  },
  {
    name: "spacing-xl",
    px: 24,
    usage: "Vertical rhythm between stacked sections on a page",
  },
  {
    name: "spacing-2xl",
    px: 32,
    usage: "Page-level spacing between major sections",
  },
];

export const radii = [
  {
    name: "radius-none",
    px: 0,
    cssVar: "var(--radius-none)",
    usage: "Squared corners — full-bleed containers",
  },
  {
    name: "radius-sm",
    px: 4,
    cssVar: "var(--radius-sm)",
    usage: "Tight corners — small inline chips",
  },
  {
    name: "radius-md",
    px: 10,
    cssVar: "var(--radius-md)",
    usage: "Default — buttons, inputs, cards, chips",
  },
  {
    name: "radius-lg",
    px: 16,
    cssVar: "var(--radius-lg)",
    usage: "Outer containers — panels, side-sheets",
  },
  {
    name: "radius-full",
    px: 99999,
    cssVar: "var(--radius-full)",
    display: "9999px",
    usage: "Pills, avatars, circular buttons",
  },
];

export const borders = [
  {
    name: "border-hairline",
    px: "0.5px",
    usage: "Subtle card outlines on a light background",
  },
  {
    name: "border-standard",
    px: "1px",
    usage: "Default border weight for inputs and containers",
  },
  {
    name: "border-ring",
    px: "2px",
    usage: "Focus ring (applied via ring-ring)",
  },
];

export const iconSizes = [
  { name: "icon-size-xs", px: 12, usage: "Tiny inline icons inside chips" },
  {
    name: "icon-size-sm",
    px: 16,
    usage: "Default icon inside table cells and detail rows",
  },
  {
    name: "icon-size-md",
    px: 20,
    usage: "Default icon for buttons and nav items",
  },
  { name: "icon-size-lg", px: 24, usage: "Page header / large UI icons" },
  { name: "icon-size-xl", px: 32, usage: "Avatar-scale icons" },
];

export const iconStrokes = [
  {
    name: "icon-stroke-xs",
    px: "1px",
    usage: "Hairline stroke — rarely used, very small icons",
  },
  { name: "icon-stroke-sm", px: "1.3px", usage: "Default small icon stroke" },
  {
    name: "icon-stroke-md",
    px: "1.3px",
    usage: "Default medium icon stroke (matches sm for consistency)",
  },
  {
    name: "icon-stroke-lg",
    px: "1.5px",
    usage: "Bolder stroke for large icons",
  },
  {
    name: "icon-stroke-xl",
    px: "2px",
    usage: "Heaviest stroke — avatar-scale icons",
  },
];

export const shadows = [
  {
    name: "shadow-subtle",
    cssVar: "var(--shadow-subtle)",
    usage: "Subtle 1px shadow for cards on a canvas",
  },
  {
    name: "shadow-default",
    cssVar: "var(--shadow-default)",
    usage: "Default elevation for floating components (cards, dropdowns)",
  },
  {
    name: "shadow-hover",
    cssVar: "var(--shadow-hover)",
    usage: "Emphasised elevation on hover / pressed states",
  },
];

export type Token = {
  name: string;
  utility: string;
  alias: string;
  swatchVar: string;
  usage: string;
};

export const textTokens: Token[] = [
  {
    name: "foreground",
    utility: "text-foreground",
    alias: "Colour / System / Base / Black",
    swatchVar: "var(--color-foreground)",
    usage: "Primary text and icon colour, active / hover menu items",
  },
  {
    name: "foreground-inverted",
    utility: "text-foreground-inverted",
    alias: "Colour / System / Base / White",
    swatchVar: "var(--color-foreground-inverted)",
    usage: "Primary text inverted for dark backgrounds, i.e. primary buttons",
  },
  {
    name: "foreground-muted",
    utility: "text-foreground-muted",
    alias: "Colour / System / Neutral / 900",
    swatchVar: "var(--color-foreground-muted)",
    usage: "Secondary text and icon colour, inactive menu items",
  },
  {
    name: "foreground-subtle",
    utility: "text-foreground-subtle",
    alias: "Colour / System / Neutral / 800",
    swatchVar: "var(--color-foreground-subtle)",
    usage: "Tertiary text, metadata",
  },
  {
    name: "foreground-placeholder",
    utility: "text-foreground-placeholder",
    alias: "Colour / System / Neutral / 700",
    swatchVar: "var(--color-foreground-placeholder)",
    usage: "Placeholder text colour, disabled states",
  },
  {
    name: "link",
    utility: "text-link",
    alias: "Colour / System / Blue / 300",
    swatchVar: "var(--color-link)",
    usage: "Links",
  },
  {
    name: "success-foreground",
    utility: "text-success-foreground",
    alias: "Colour / System / Green / 500",
    swatchVar: "var(--color-success-foreground)",
    usage: "Success messages (on success-soft bg)",
  },
  {
    name: "destructive-foreground",
    utility: "text-destructive-foreground",
    alias: "Colour / System / Red / 500",
    swatchVar: "var(--color-destructive-foreground)",
    usage: "Destructive / warning messages (on destructive-soft bg)",
  },
  {
    name: "info-foreground",
    utility: "text-info-foreground",
    alias: "Colour / System / Yellow / 500",
    swatchVar: "var(--color-info-foreground)",
    usage: "Info messages (on info-soft bg)",
  },
];

export const bgTokens: Token[] = [
  {
    name: "background",
    utility: "bg-background",
    alias: "Colour / System / Neutral / 200",
    swatchVar: "var(--color-background)",
    usage: "Base canvas of the page",
  },
  {
    name: "surface",
    utility: "bg-surface",
    alias: "Colour / System / Base / White",
    swatchVar: "var(--color-surface)",
    usage: "Cards, panels, anything sitting on the background",
  },
  {
    name: "hover",
    utility: "bg-hover",
    alias: "Colour / System / Neutral / 300",
    swatchVar: "var(--color-hover)",
    usage: "Hover states for menu items, interactive rows",
  },
  {
    name: "selected",
    utility: "bg-selected",
    alias: "Colour / System / Neutral / 400",
    swatchVar: "var(--color-selected)",
    usage: "Active / selected state for nav items and tabs",
  },
];

export const buttonTokens: Token[] = [
  {
    name: "primary",
    utility: "bg-primary",
    alias: "Colour / System / Blue / 300",
    swatchVar: "var(--color-primary)",
    usage: "Primary button bg",
  },
  {
    name: "primary-hover",
    utility: "hover:bg-primary-hover",
    alias: "Colour / System / Blue / 400",
    swatchVar: "var(--color-primary-hover)",
    usage: "Primary button hover bg",
  },
  {
    name: "secondary",
    utility: "bg-secondary",
    alias: "Colour / System / Base / White",
    swatchVar: "var(--color-secondary)",
    usage: "Secondary button bg",
  },
  {
    name: "secondary-hover",
    utility: "hover:bg-secondary-hover",
    alias: "Colour / System / Neutral / 300",
    swatchVar: "var(--color-secondary-hover)",
    usage: "Secondary button hover bg",
  },
  {
    name: "ghost",
    utility: "bg-ghost",
    alias: "Colour / System / Opacity / 0",
    swatchVar: "var(--color-ghost)",
    usage: "Ghost button bg (transparent)",
  },
  {
    name: "ghost-hover",
    utility: "hover:bg-ghost-hover",
    alias: "Colour / System / Opacity / 4",
    swatchVar: "var(--color-ghost-hover)",
    usage: "Ghost button hover bg",
  },
  {
    name: "destructive",
    utility: "bg-destructive",
    alias: "Colour / System / Red / 300",
    swatchVar: "var(--color-destructive)",
    usage: "Destructive button bg (+ solid destructive/urgent badge)",
  },
  {
    name: "destructive-hover",
    utility: "hover:bg-destructive-hover",
    alias: "Colour / System / Red / 400",
    swatchVar: "var(--color-destructive-hover)",
    usage: "Destructive button hover bg",
  },
];

export const borderTokens: Token[] = [
  {
    name: "border",
    utility: "border-border",
    alias: "Colour / System / Neutral / 500",
    swatchVar: "var(--color-border)",
    usage: "Dividers, card / panel borders",
  },
  {
    name: "border-strong",
    utility: "border-border-strong",
    alias: "Colour / System / Neutral / 600",
    swatchVar: "var(--color-border-strong)",
    usage: "Emphasised borders and strokes",
  },
  {
    name: "ring",
    utility: "ring-ring",
    alias: "Colour / System / Blue / 200",
    swatchVar: "var(--color-ring)",
    usage: "Focus ring for keyboard / accessible focus",
  },
];

export const statusSolidTokens: Token[] = [
  {
    name: "success",
    utility: "bg-success",
    alias: "Colour / System / Green / 300",
    swatchVar: "var(--color-success)",
    usage: "Solid success badge / indicator",
  },
  {
    name: "destructive",
    utility: "bg-destructive",
    alias: "Colour / System / Red / 300",
    swatchVar: "var(--color-destructive)",
    usage: "Solid destructive / urgent badge (shared with button)",
  },
  {
    name: "warning",
    utility: "bg-warning",
    alias: "Colour / System / Red / 300",
    swatchVar: "var(--color-warning)",
    usage: "Solid warning badge (same scale as destructive)",
  },
  {
    name: "info",
    utility: "bg-info",
    alias: "Colour / System / Yellow / 300",
    swatchVar: "var(--color-info)",
    usage: "Solid info badge",
  },
];

export const statusSoftTokens: Token[] = [
  {
    name: "success-soft",
    utility: "bg-success-soft",
    alias: "Colour / System / Green / 100",
    swatchVar: "var(--color-success-soft)",
    usage: "Soft success tag bg (pair with text-success-foreground)",
  },
  {
    name: "destructive-soft",
    utility: "bg-destructive-soft",
    alias: "Colour / System / Red / 100",
    swatchVar: "var(--color-destructive-soft)",
    usage: "Soft destructive tag bg (pair with text-destructive-foreground)",
  },
  {
    name: "warning-soft",
    utility: "bg-warning-soft",
    alias: "Colour / System / Red / 100",
    swatchVar: "var(--color-warning-soft)",
    usage: "Soft warning tag bg (pair with text-destructive-foreground)",
  },
  {
    name: "info-soft",
    utility: "bg-info-soft",
    alias: "Colour / System / Yellow / 100",
    swatchVar: "var(--color-info-soft)",
    usage: "Soft info tag bg (pair with text-info-foreground)",
  },
];
