import { colorFor } from "@/lib/issue-type-colors";
import { cn } from "@/lib/utils";

type IssueTypeChipProps = {
  label: string;
  color: string | undefined;
  className?: string;
};

export function IssueTypeChip({ label, color, className }: IssueTypeChipProps) {
  const palette = colorFor(color);
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-sm rounded-sm px-sm py-xs",
        "font-medium text-12 leading-120",
        palette?.chipClassName ?? "bg-neutral-300 text-neutral-900",
        className,
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          palette?.dotClassName ?? "bg-neutral-700",
        )}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
