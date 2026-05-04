import { radii } from "@/app/(design)/components/_shared/data";
import {
  PageHeader,
  PrimitiveTable,
} from "@/app/(design)/components/_shared/helpers";

export default function RadiusPage() {
  return (
    <>
      <PageHeader description="Corner-radius scale." title="Radius" />
      <PrimitiveTable
        rows={radii.map((r) => ({
          name: r.name,
          preview: (
            <div className="flex items-center gap-md">
              <div
                className="h-10 w-10 border border-neutral-500 bg-surface"
                style={{ borderRadius: r.cssVar }}
              />
              <span className="text-13 text-foreground">
                {r.display ?? `${r.px}px`}
              </span>
            </div>
          ),
          usage: r.usage,
        }))}
      />
    </>
  );
}
