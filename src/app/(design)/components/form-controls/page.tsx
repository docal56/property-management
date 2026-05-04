import {
  ComponentBlock,
  PageHeader,
  VariantCell,
} from "@/app/(design)/components/_shared/helpers";
import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";

export default function FormControlsPage() {
  return (
    <>
      <PageHeader
        description="Text input, textarea, and toggle switch."
        title="Form Controls"
      />

      <ComponentBlock
        description="Single-line text input. Optional leading icon slot. Focus and disabled states."
        label="Text Input"
      >
        <div className="flex flex-col gap-lg">
          <VariantCell label="default">
            <TextInput
              leadingIcon={<Icon name="search" size="md" />}
              placeholder="Search issues"
              wrapperClassName="w-70"
            />
          </VariantCell>
          <VariantCell label="focus (click to focus)">
            <TextInput
              autoFocus={false}
              leadingIcon={<Icon name="search" size="md" />}
              placeholder="Search issues"
              wrapperClassName="w-70"
            />
          </VariantCell>
          <VariantCell label="disabled">
            <TextInput
              disabled
              leadingIcon={<Icon name="search" size="md" />}
              placeholder="Search issues"
              wrapperClassName="w-70"
            />
          </VariantCell>
        </div>
      </ComponentBlock>

      <ComponentBlock description="Multi-line text input." label="Textarea">
        <div className="flex flex-col gap-lg">
          <VariantCell label="default">
            <Textarea className="h-24 w-80" placeholder="Add an update" />
          </VariantCell>
          <VariantCell label="disabled">
            <Textarea
              className="h-24 w-80"
              disabled
              placeholder="Add an update"
            />
          </VariantCell>
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Binary on/off switch. Wraps Radix Switch for keyboard and ARIA behaviour."
        label="Toggle"
      >
        <div className="flex flex-wrap items-center gap-lg">
          <VariantCell label="off">
            <Toggle aria-label="Demo toggle off" />
          </VariantCell>
          <VariantCell label="on">
            <Toggle aria-label="Demo toggle on" defaultChecked />
          </VariantCell>
          <VariantCell label="disabled">
            <Toggle aria-label="Demo toggle disabled" disabled />
          </VariantCell>
        </div>
      </ComponentBlock>
    </>
  );
}
