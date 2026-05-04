import {
  lineHeights,
  textSizes,
  weights,
} from "@/app/(design)/components/_shared/data";
import {
  PageHeader,
  PrimitiveTable,
  Section,
} from "@/app/(design)/components/_shared/helpers";

export default function TypographyPage() {
  return (
    <>
      <PageHeader
        description="Font family, weights, sizes, and line heights."
        title="Typography"
      />
      <Section title="Font">
        <p className="text-14">App font: Geist</p>
      </Section>

      <PrimitiveTable
        label="Weights"
        rows={weights.map((w) => ({
          name: w.name,
          preview: (
            <div className="flex items-center gap-md">
              <span className="text-16" style={{ fontWeight: w.value }}>
                {w.label}
              </span>
              <span className="text-13 text-foreground">{w.value}</span>
            </div>
          ),
          usage: w.usage,
        }))}
        valueLabel="Preview"
      />

      <PrimitiveTable
        label="Sizes"
        rows={textSizes.map((s) => ({
          name: s.name,
          preview: (
            <div className="flex items-baseline gap-md">
              <span style={{ fontSize: `${s.px}px`, lineHeight: 1 }}>Aa</span>
              <span className="text-13 text-foreground">{s.px}px</span>
            </div>
          ),
          usage: s.usage,
        }))}
        valueLabel="Preview"
      />

      <PrimitiveTable
        label="Line Height"
        rows={lineHeights.map((l) => ({
          name: l.name,
          preview: <span className="text-13 text-foreground">{l.value}</span>,
          usage: l.usage,
        }))}
        valueLabel="Value"
      />
    </>
  );
}
