import { PageHeader } from "@/app/(design)/components/_shared/helpers";
import { loadIcons } from "@/app/(design)/components/_shared/icons";

export default function IconsPage() {
  const icons = loadIcons();
  return (
    <>
      <PageHeader
        description="Every icon available in the app."
        title={`Icons (${icons.length})`}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-md">
        {icons.map((icon) => (
          <div
            className="flex flex-col items-center gap-md rounded-md border border-neutral-500 bg-surface p-lg"
            key={icon.name}
          >
            <div
              className="flex h-8 w-8 items-center justify-center"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Icon gallery renders checked-in local SVG assets.
              dangerouslySetInnerHTML={{ __html: icon.svg }}
            />
            <span className="break-all text-center text-12 text-neutral-800 leading-120">
              {icon.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
