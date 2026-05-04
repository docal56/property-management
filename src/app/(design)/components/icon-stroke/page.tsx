import { iconStrokes } from "@/app/(design)/components/_shared/data";
import {
  PageHeader,
  PrimitiveTable,
} from "@/app/(design)/components/_shared/helpers";
import {
  loadDemoIconSvg,
  strokedIcon,
} from "@/app/(design)/components/_shared/icons";

export default function IconStrokePage() {
  const demoSvg = loadDemoIconSvg();
  return (
    <>
      <PageHeader description="Icon stroke weight scale." title="Icon Stroke" />
      <PrimitiveTable
        rows={iconStrokes.map((s) => ({
          name: s.name,
          preview: (
            <div className="flex items-center gap-md">
              <div
                className="flex items-center justify-center"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Preview renders checked-in local SVG assets at different stroke weights.
                dangerouslySetInnerHTML={{ __html: strokedIcon(demoSvg, s.px) }}
                style={{ width: 20, height: 20 }}
              />
              <span className="text-13 text-foreground">{s.px}</span>
            </div>
          ),
          usage: s.usage,
        }))}
      />
    </>
  );
}
