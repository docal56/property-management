import {
  ComponentBlock,
  PageHeader,
  VariantCell,
} from "@/app/(design)/components/_shared/helpers";
import { Icon } from "@/components/ui/icon";
import { Label, type LabelVariant } from "@/components/ui/label";
import { LabelSmall } from "@/components/ui/label-small";
import { MetaChip } from "@/components/ui/meta-chip";

export default function BadgesChipsPage() {
  return (
    <>
      <PageHeader
        description="Status pills and metadata chips."
        title="Badges & Chips"
      />

      <ComponentBlock
        description="Solid-fill pill for strong status (28h). 4 variants."
        label="Label"
      >
        <div className="flex flex-wrap items-center gap-lg">
          {(
            ["destructive", "success", "warning", "info"] as LabelVariant[]
          ).map((v) => (
            <VariantCell key={v} label={v}>
              <Label variant={v}>
                {v === "destructive"
                  ? "Urgent"
                  : v === "success"
                    ? "Success"
                    : v === "warning"
                      ? "Warning"
                      : "Info"}
              </Label>
            </VariantCell>
          ))}
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="24h pill for inline table cells (e.g. Pass / Failed)."
        label="Label Small"
      >
        <div className="flex flex-wrap items-center gap-lg">
          {(
            ["destructive", "success", "warning", "info"] as LabelVariant[]
          ).map((v) => (
            <VariantCell key={v} label={v}>
              <LabelSmall variant={v}>
                {v === "destructive"
                  ? "Failed"
                  : v === "success"
                    ? "Pass"
                    : v === "warning"
                      ? "Warning"
                      : "Info"}
              </LabelSmall>
            </VariantCell>
          ))}
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Neutral grey pill with leading icon + text. Used for dates, counts, metadata."
        label="Meta Chip"
      >
        <div className="flex flex-wrap items-center gap-lg">
          <MetaChip icon={<Icon name="calendar" size="sm" />}>
            April 23rd — 10:30am
          </MetaChip>
          <MetaChip icon={<Icon name="clock" size="sm" />}>
            1:24 duration
          </MetaChip>
          <MetaChip icon={<Icon name="phone" size="sm" />}>
            07729 420529
          </MetaChip>
        </div>
      </ComponentBlock>
    </>
  );
}
