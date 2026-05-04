import {
  ComponentBlock,
  PageHeader,
  VariantCell,
} from "@/app/(design)/components/_shared/helpers";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { RoundButton } from "@/components/ui/round-button";

export default function ActionsPage() {
  return (
    <>
      <PageHeader
        description="Buttons, icon buttons, and round buttons."
        title="Actions"
      />

      <ComponentBlock
        description="4 variants (primary, secondary, ghost, destructive) × 3 states. Hover any button to see its hover state."
        label="Button"
      >
        <div className="flex flex-col gap-lg">
          <div className="flex flex-wrap items-center gap-base">
            <VariantCell label="primary">
              <Button trailingIcon={<Icon name="arrow-up-right" size="md" />}>
                Button
              </Button>
            </VariantCell>
            <VariantCell label="secondary">
              <Button
                trailingIcon={<Icon name="arrow-up-right" size="md" />}
                variant="secondary"
              >
                Button
              </Button>
            </VariantCell>
            <VariantCell label="ghost">
              <Button
                trailingIcon={<Icon name="arrow-up-right" size="md" />}
                variant="ghost"
              >
                Button
              </Button>
            </VariantCell>
            <VariantCell label="destructive">
              <Button
                trailingIcon={<Icon name="arrow-up-right" size="md" />}
                variant="destructive"
              >
                Button
              </Button>
            </VariantCell>
          </div>
          <div className="flex flex-wrap items-center gap-base">
            <VariantCell label="primary / disabled">
              <Button
                disabled
                trailingIcon={<Icon name="arrow-up-right" size="md" />}
              >
                Button
              </Button>
            </VariantCell>
            <VariantCell label="secondary / disabled">
              <Button
                disabled
                trailingIcon={<Icon name="arrow-up-right" size="md" />}
                variant="secondary"
              >
                Button
              </Button>
            </VariantCell>
            <VariantCell label="ghost / disabled">
              <Button
                disabled
                trailingIcon={<Icon name="arrow-up-right" size="md" />}
                variant="ghost"
              >
                Button
              </Button>
            </VariantCell>
            <VariantCell label="destructive / disabled">
              <Button
                disabled
                trailingIcon={<Icon name="arrow-up-right" size="md" />}
                variant="destructive"
              >
                Button
              </Button>
            </VariantCell>
          </div>
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Single-icon button for close (×), kebab (⋯), stepper arrows. 2 sizes."
        label="Icon Button"
      >
        <div className="flex flex-wrap items-center gap-lg">
          <VariantCell label="md">
            <IconButton aria-label="Close" icon={<Icon name="x" size="sm" />} />
          </VariantCell>
          <VariantCell label="sm">
            <IconButton
              aria-label="Close"
              icon={<Icon name="x" size="sm" />}
              size="sm"
            />
          </VariantCell>
          <VariantCell label="md / disabled">
            <IconButton
              aria-label="Close"
              disabled
              icon={<Icon name="x" size="sm" />}
            />
          </VariantCell>
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Circular CTA — used for submit / post-update actions."
        label="Round Button"
      >
        <div className="flex flex-wrap items-center gap-lg">
          <VariantCell label="default">
            <RoundButton
              aria-label="Submit"
              icon={<Icon name="arrow-up" size="md" />}
            />
          </VariantCell>
          <VariantCell label="disabled">
            <RoundButton
              aria-label="Submit"
              disabled
              icon={<Icon name="arrow-up" size="md" />}
            />
          </VariantCell>
        </div>
      </ComponentBlock>
    </>
  );
}
