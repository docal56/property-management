import { borders } from "@/app/(design)/components/_shared/data";
import {
  PageHeader,
  PrimitiveTable,
} from "@/app/(design)/components/_shared/helpers";

export default function BordersPage() {
  return (
    <>
      <PageHeader
        description="Border widths: hairline, standard, ring (focus)."
        title="Borders"
      />
      <PrimitiveTable
        rows={borders.map((b) => ({
          name: b.name,
          preview: (
            <div className="flex items-center gap-md">
              <div
                className="h-8 w-12 rounded-md"
                style={{
                  borderWidth: b.px,
                  borderStyle: "solid",
                  borderColor: b.name === "border-ring" ? "#ADC2FF" : "#E6E6E6",
                }}
              />
              <span className="text-13 text-foreground">{b.px}</span>
            </div>
          ),
          usage: b.usage,
        }))}
      />
    </>
  );
}
