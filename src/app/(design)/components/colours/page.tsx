import {
  type ColorRow,
  supportColors,
  systemColors,
} from "@/app/(design)/components/_shared/data";
import {
  PageHeader,
  type PrimitiveRow,
  PrimitiveTable,
  Section,
} from "@/app/(design)/components/_shared/helpers";

const explicitUsage: Record<string, string> = {
  "base-white": "Surface colour (cards, panels)",
  "base-black": "Primary foreground / body text",
  "neutral-100": "Near-white surface tint",
  "neutral-200": "Page background",
  "neutral-300": "Subtle hover backdrop",
  "neutral-400": "Active / selected row background",
  "neutral-500": "Default border colour",
  "neutral-600": "Emphasised borders and strokes",
  "neutral-700": "Placeholder text, disabled states",
  "neutral-800": "Subtle text and metadata",
  "neutral-900": "Secondary / muted foreground text",
  "opacity-0": "Transparent — ghost button default",
  "opacity-4": "Ghost button hover background",
  "opacity-8": "Ghost button active / pressed",
  "opacity-60": "Dim overlays",
};

const shadeDescs: Record<string, string> = {
  "100": "Lightest tint — soft backgrounds (e.g. *-soft tokens)",
  "200": "Soft accent — chip / badge bg, focus ring (blue-200)",
  "300": "Primary brand colour for this palette",
  "400": "Hover / pressed state",
  "500": "Darkest shade — text on soft backgrounds",
};

function usageFor(name: string, family: string): string {
  if (explicitUsage[name]) return explicitUsage[name];
  const shade = name.split("-").pop() ?? "";
  return `${family} — ${shadeDescs[shade] ?? "palette reference"}`;
}

function rowsFor(row: ColorRow): PrimitiveRow[] {
  return row.stops.map((stop) => ({
    name: stop.name,
    preview: (
      <div className="flex items-center gap-md">
        <div
          className="h-5 w-5 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: stop.hex }}
        />
        <span className="text-13 text-foreground">{stop.sub ?? stop.hex}</span>
      </div>
    ),
    usage: usageFor(stop.name, row.label),
  }));
}

export default function ColoursPage() {
  return (
    <>
      <PageHeader
        description="System palette + support accents. Every swatch maps to a Tailwind utility via the Semantic Tokens page."
        title="Colours"
      />

      <Section title="System">
        {systemColors.map((row) => (
          <PrimitiveTable
            key={row.label}
            label={row.label}
            nameWidth="w-64"
            rows={rowsFor(row)}
          />
        ))}
      </Section>

      <Section title="Support">
        {supportColors.map((row) => (
          <PrimitiveTable
            key={row.label}
            label={row.label}
            nameWidth="w-64"
            rows={rowsFor(row)}
          />
        ))}
      </Section>
    </>
  );
}
