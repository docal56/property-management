import { BoardCardDemo } from "@/app/(design)/components/_demos/board-card-demo";
import {
  ComponentBlock,
  PageHeader,
  VariantCell,
} from "@/app/(design)/components/_shared/helpers";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default function MediaContainersPage() {
  return (
    <>
      <PageHeader
        description="Avatar, card, board card."
        title="Media & Containers"
      />

      <ComponentBlock
        description="24×24 circle. Image variant for user photos. Icon variant uses a Support colour tone."
        label="Avatar"
      >
        <div className="flex flex-wrap items-center gap-lg">
          <VariantCell label="image (no src — fallback)">
            <Avatar alt="User initials" variant="image" />
          </VariantCell>
          <VariantCell label="icon / purple">
            <Avatar
              icon={<Icon name="phone" size="sm" />}
              tone="purple"
              variant="icon"
            />
          </VariantCell>
          <VariantCell label="icon / orange">
            <Avatar
              icon={<Icon name="calendar" size="sm" />}
              tone="orange"
              variant="icon"
            />
          </VariantCell>
          <VariantCell label="icon / teal">
            <Avatar
              icon={<Icon name="check" size="sm" />}
              tone="teal"
              variant="icon"
            />
          </VariantCell>
          <VariantCell label="icon / pink">
            <Avatar
              icon={<Icon name="user" size="sm" />}
              tone="pink"
              variant="icon"
            />
          </VariantCell>
          <VariantCell label="icon / light-blue">
            <Avatar
              icon={<Icon name="info" size="sm" />}
              tone="light-blue"
              variant="icon"
            />
          </VariantCell>
        </div>
      </ComponentBlock>

      <ComponentBlock
        description="Generic surface container with optional header and a content slot."
        label="Card"
      >
        <Card className="w-80" header="Status">
          <span className="text-foreground-placeholder">
            Content slot — replace with Detail Rows, Timeline, etc.
          </span>
        </Card>
      </ComponentBlock>

      <ComponentBlock
        description="Kanban issue card. Composes IconButton (kebab) + optional Label badge. Click anywhere except the kebab to select."
        label="Board Card"
      >
        <BoardCardDemo />
      </ComponentBlock>
    </>
  );
}
