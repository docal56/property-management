import { spacing } from "@/app/(design)/components/_shared/data";
import {
  PageHeader,
  PrimitiveTable,
} from "@/app/(design)/components/_shared/helpers";

export default function SpacingPage() {
  return (
    <>
      <PageHeader description="Unit scale — base 0.2rem." title="Spacing" />
      <PrimitiveTable
        rows={spacing.map((s) => ({
          name: s.name,
          preview: (
            <div className="flex items-center gap-md">
              <div
                className="h-5 bg-neutral-300"
                style={{ width: `${s.px}px` }}
              />
              <span className="text-13 text-foreground">{s.px}px</span>
            </div>
          ),
          usage: s.usage,
        }))}
      />
    </>
  );
}
