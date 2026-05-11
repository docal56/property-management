"use client";

import { useMutation } from "convex/react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { TextInput } from "@/components/ui/text-input";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  type IssueTypeColorKey,
  issueTypeColors,
  slugifyKey,
} from "@/lib/issue-type-colors";
import { ErrorBanner, Field, SelectInput } from "./form-bits";
import { IssueTypeChip } from "./issue-type-chip";

type IssueType = NonNullable<Doc<"orgs">["issueTypes"]>[number];

type Props = {
  orgId: Id<"orgs">;
  issueTypes: IssueType[];
};

export function IssueTypesSection({ orgId, issueTypes }: Props) {
  const addIssueType = useMutation(api.admin.addIssueType);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleError = (err: unknown) => {
    setError(err instanceof Error ? err.message : "Something went wrong");
  };

  const handleAdd = async (
    type: { key: string; label: string; color: string },
    onDone: () => void,
  ) => {
    setError(null);
    setBusy(true);
    try {
      await addIssueType({ orgId, issueType: type });
      onDone();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-base">
      <h2 className="font-medium text-13 text-foreground leading-120">
        Issue types
      </h2>

      <div className="flex flex-col gap-xs">
        {issueTypes.length > 0 ? (
          issueTypes.map((type, index) => (
            <IssueTypeRow
              canMoveDown={index < issueTypes.length - 1}
              canMoveUp={index > 0}
              key={type.key}
              onError={handleError}
              orgId={orgId}
              type={type}
            />
          ))
        ) : (
          <span className="text-13 text-foreground-muted leading-160">
            No custom issue types yet.
          </span>
        )}
      </div>

      <AddIssueTypeForm busy={busy} onSubmit={handleAdd} />

      <ErrorBanner message={error} />
    </section>
  );
}

function IssueTypeRow({
  orgId,
  type,
  canMoveUp,
  canMoveDown,
  onError,
}: {
  orgId: Id<"orgs">;
  type: IssueType;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onError: (err: unknown) => void;
}) {
  const updateIssueType = useMutation(api.admin.updateIssueType);
  const deleteIssueType = useMutation(api.admin.deleteIssueType);
  const moveIssueType = useMutation(api.admin.moveIssueType);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(type.label);
  const [color, setColor] = useState<string>(type.color ?? "green");
  const [busy, setBusy] = useState(false);

  const handleMove = async (direction: "up" | "down") => {
    setBusy(true);
    try {
      await moveIssueType({ orgId, key: type.key, direction });
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setLabel(type.label);
    setColor(type.color ?? "green");
    setEditing(false);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await updateIssueType({
        orgId,
        key: type.key,
        label,
        color,
      });
      setEditing(false);
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete issue type "${type.label}"?`)) return;
    setBusy(true);
    try {
      await deleteIssueType({ orgId, key: type.key });
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center justify-between gap-base rounded-md bg-background px-md py-sm">
        <div className="flex min-w-0 items-center gap-base">
          <IssueTypeChip color={type.color} label={type.label} />
          <span className="truncate font-mono text-12 text-foreground-muted leading-120">
            {type.key}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-xs">
          <IconButton
            aria-label={`Move ${type.label} up`}
            disabled={busy || !canMoveUp}
            icon={<Icon name="arrow-up" size="sm" />}
            onClick={() => handleMove("up")}
            size="sm"
          />
          <IconButton
            aria-label={`Move ${type.label} down`}
            disabled={busy || !canMoveDown}
            icon={<Icon name="arrow-down" size="sm" />}
            onClick={() => handleMove("down")}
            size="sm"
          />
          <IconButton
            aria-label={`Edit ${type.label}`}
            icon={<Icon name="ai-edit" size="sm" />}
            onClick={() => setEditing(true)}
            size="sm"
          />
          <IconButton
            aria-label={`Delete ${type.label}`}
            disabled={busy}
            icon={<Icon name="trash" size="sm" />}
            onClick={handleDelete}
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-sm rounded-md bg-background p-md"
      onSubmit={handleSave}
    >
      <div className="grid gap-sm md:grid-cols-[minmax(0,1fr)_8rem]">
        <Field label="Label">
          <TextInput
            onChange={(event) => setLabel(event.target.value)}
            placeholder={type.label}
            value={label}
            wrapperClassName="w-full"
          />
        </Field>
        <Field label="Colour">
          <SelectInput
            onChange={(event) => setColor(event.target.value)}
            value={color}
          >
            {issueTypeColors.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <div className="flex items-center justify-between gap-base">
        <IssueTypeChip color={color} label={label || type.label} />
        <div className="flex gap-xs">
          <Button onClick={reset} type="button" variant="ghost">
            Cancel
          </Button>
          <Button disabled={busy} type="submit">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}

function AddIssueTypeForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (
    type: { key: string; label: string; color: string },
    onDone: () => void,
  ) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState<IssueTypeColorKey>("green");

  const effectiveKey = key || slugifyKey(label);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ key: effectiveKey, label, color }, () => {
      setLabel("");
      setKey("");
      setColor("green");
    });
  };

  return (
    <form
      className="flex flex-col gap-sm rounded-md border border-border border-dashed p-md"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between gap-base">
        <span className="font-medium text-12 text-foreground-muted leading-120">
          Add type
        </span>
        <IssueTypeChip color={color} label={label || "New type"} />
      </div>
      <div className="grid gap-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem_auto]">
        <Field label="Label">
          <TextInput
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Maintenance"
            value={label}
            wrapperClassName="w-full"
          />
        </Field>
        <Field label="Key">
          <TextInput
            onChange={(event) => setKey(event.target.value)}
            placeholder={slugifyKey(label) || "maintenance"}
            value={key}
            wrapperClassName="w-full"
          />
        </Field>
        <Field label="Colour">
          <SelectInput
            onChange={(event) =>
              setColor(event.target.value as IssueTypeColorKey)
            }
            value={color}
          >
            {issueTypeColors.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="flex items-end">
          <Button
            className="w-full"
            disabled={busy || !label.trim() || !effectiveKey}
            type="submit"
          >
            Add
          </Button>
        </div>
      </div>
    </form>
  );
}
