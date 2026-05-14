"use client";

import { useMutation } from "convex/react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DEFAULT_AGENT_ISSUE_CONFIG,
  isBuiltInExtractionKey,
} from "@/convex/extraction/schema";
import { colorFor } from "@/lib/issue-type-colors";
import { cn } from "@/lib/utils";
import { ErrorBanner, Field, FieldLabel } from "./form-bits";
import { IssueTypeChip } from "./issue-type-chip";

type Agent = Doc<"agents">;
type OrgIssueType = NonNullable<Doc<"orgs">["issueTypes"]>[number];
type ExtractionField = NonNullable<
  Agent["issueConfig"]
>["extractionFields"][number];
type IssueConfig = NonNullable<Agent["issueConfig"]>;
type AgentProvider = "elevenlabs" | "vapi";

const PROVIDER_OPTIONS: Array<{ value: AgentProvider; label: string }> = [
  { value: "elevenlabs", label: "ElevenLabs" },
  { value: "vapi", label: "Vapi" },
];

function agentProvider(agent: Agent): AgentProvider {
  return agent.provider ?? "elevenlabs";
}

function agentProviderAgentId(agent: Agent) {
  return agent.providerAgentId ?? agent.elevenlabsAgentId ?? "";
}

function providerLabel(provider: AgentProvider) {
  return (
    PROVIDER_OPTIONS.find((option) => option.value === provider)?.label ??
    provider
  );
}

type Props = {
  orgId: Id<"orgs">;
  agents: Agent[];
  orgIssueTypes: OrgIssueType[];
};

export function AgentsSection({ orgId, agents, orgIssueTypes }: Props) {
  const createAgent = useMutation(api.admin.createAgent);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleError = (err: unknown) => {
    setError(err instanceof Error ? err.message : "Something went wrong");
  };

  const handleCreate = async (
    args: {
      name: string;
      provider: AgentProvider;
      providerAgentId: string;
    },
    onDone: () => void,
  ) => {
    setError(null);
    setBusy(true);
    try {
      await createAgent({ orgId, ...args });
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
        Agents
      </h2>

      <div className="flex flex-col gap-xs">
        {agents.length > 0 ? (
          agents.map((agent) => (
            <AgentRow
              agent={agent}
              key={agent._id}
              onError={handleError}
              orgIssueTypes={orgIssueTypes}
            />
          ))
        ) : (
          <span className="text-13 text-foreground-muted leading-160">
            No agents linked.
          </span>
        )}
      </div>

      <AddAgentForm busy={busy} onSubmit={handleCreate} />

      <ErrorBanner message={error} />
    </section>
  );
}

function AgentRow({
  agent,
  orgIssueTypes,
  onError,
}: {
  agent: Agent;
  orgIssueTypes: OrgIssueType[];
  onError: (err: unknown) => void;
}) {
  const updateAgent = useMutation(api.admin.updateAgent);
  const deleteAgent = useMutation(api.admin.deleteAgent);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete agent "${agent.name}"?`)) return;
    setBusy(true);
    try {
      await deleteAgent({ agentId: agent._id });
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col rounded-md bg-background">
      <div className="flex min-w-0 items-center gap-xs pr-md">
        <button
          className="flex min-w-0 flex-1 items-center justify-between gap-base px-md py-sm text-left transition-colors hover:bg-hover"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          <div className="flex min-w-0 items-center gap-sm">
            <Icon
              className="text-foreground-muted"
              name={expanded ? "chevron-down" : "chevron-right"}
              size="sm"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-13 text-foreground leading-120">
                {agent.name}
              </span>
              <span className="truncate font-mono text-12 text-foreground-muted leading-120">
                {providerLabel(agentProvider(agent))}:{" "}
                {agentProviderAgentId(agent)}
              </span>
            </div>
          </div>
          <span className="shrink-0 font-medium text-12 text-foreground-muted leading-120">
            {agent.issueConfig
              ? `${agent.issueConfig.allowedIssueTypes.length} types · ${agent.issueConfig.extractionFields.length} fields`
              : "No config"}
          </span>
        </button>
        <IconButton
          aria-label={`Delete ${agent.name}`}
          disabled={busy}
          icon={<Icon name="trash" size="sm" />}
          onClick={handleDelete}
          size="sm"
        />
      </div>

      {expanded ? (
        <div className="border-border border-t px-md py-md">
          <AgentEditor
            agent={agent}
            onError={onError}
            onSave={async (patch) => {
              await updateAgent({ agentId: agent._id, ...patch });
            }}
            orgIssueTypes={orgIssueTypes}
          />
        </div>
      ) : null}
    </div>
  );
}

function AgentEditor({
  agent,
  orgIssueTypes,
  onSave,
  onError,
}: {
  agent: Agent;
  orgIssueTypes: OrgIssueType[];
  onSave: (patch: {
    name?: string;
    provider?: AgentProvider;
    providerAgentId?: string;
    issueConfig?: IssueConfig | null;
  }) => Promise<void>;
  onError: (err: unknown) => void;
}) {
  // Agents created before the seed-on-create change can have a null
  // issueConfig. Show them the defaults the LLM is already using so they
  // can edit explicitly rather than seeing an empty form.
  const seededConfig = agent.issueConfig ?? {
    ...DEFAULT_AGENT_ISSUE_CONFIG,
    allowedIssueTypes:
      orgIssueTypes.length > 0
        ? orgIssueTypes.map((type) => type.key)
        : DEFAULT_AGENT_ISSUE_CONFIG.allowedIssueTypes,
  };
  const [name, setName] = useState(agent.name);
  const [provider, setProvider] = useState<AgentProvider>(agentProvider(agent));
  const [providerAgentId, setProviderAgentId] = useState(
    agentProviderAgentId(agent),
  );
  const [criteria, setCriteria] = useState(seededConfig.issueCreationCriteria);
  const [assignmentGuidance, setAssignmentGuidance] = useState(
    seededConfig.issueTypeGuidance ?? "",
  );
  const [allowedTypes, setAllowedTypes] = useState<string[]>(
    seededConfig.allowedIssueTypes,
  );
  const [fields, setFields] = useState<ExtractionField[]>(
    seededConfig.extractionFields,
  );
  const [busy, setBusy] = useState(false);

  const toggleType = (key: string) => {
    setAllowedTypes((current) =>
      current.includes(key)
        ? current.filter((t) => t !== key)
        : [...current, key],
    );
  };

  const updateField = (index: number, patch: Partial<ExtractionField>) => {
    setFields((current) =>
      current.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    );
  };

  const addField = () => {
    setFields((current) => [
      ...current,
      { key: "", label: "", description: "" },
    ]);
  };

  const removeField = (index: number) => {
    setFields((current) => {
      const target = current[index];
      if (target && isBuiltInExtractionKey(target.key)) return current;
      return current.filter((_, i) => i !== index);
    });
  };

  const hasAnyConfig =
    criteria.trim().length > 0 ||
    assignmentGuidance.trim().length > 0 ||
    allowedTypes.length > 0 ||
    fields.some((f) => f.key.trim() || f.label.trim());
  const warnNoTypes = hasAnyConfig && allowedTypes.length === 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await onSave({
        name,
        provider,
        providerAgentId,
        issueConfig: hasAnyConfig
          ? {
              issueCreationCriteria: criteria,
              issueTypeGuidance: assignmentGuidance.trim() || undefined,
              allowedIssueTypes: allowedTypes,
              extractionFields: fields.map((f) => ({
                key: f.key,
                label: f.label,
                description: f.description,
              })),
            }
          : null,
      });
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Reset this agent's issue config to the system defaults? Any customisations will be discarded.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const defaultIssueConfig = {
        ...DEFAULT_AGENT_ISSUE_CONFIG,
        allowedIssueTypes:
          orgIssueTypes.length > 0
            ? orgIssueTypes.map((type) => type.key)
            : DEFAULT_AGENT_ISSUE_CONFIG.allowedIssueTypes,
        extractionFields: DEFAULT_AGENT_ISSUE_CONFIG.extractionFields.map(
          (field) => ({ ...field }),
        ),
      };
      await onSave({ issueConfig: defaultIssueConfig });
      setCriteria(defaultIssueConfig.issueCreationCriteria);
      setAssignmentGuidance(defaultIssueConfig.issueTypeGuidance ?? "");
      setAllowedTypes(defaultIssueConfig.allowedIssueTypes);
      setFields(defaultIssueConfig.extractionFields);
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="flex flex-col gap-base" onSubmit={handleSubmit}>
      <div className="grid gap-sm md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Name">
          <TextInput
            onChange={(event) => setName(event.target.value)}
            value={name}
            wrapperClassName="w-full"
          />
        </Field>
        <Field label="Provider">
          <select
            className="w-full rounded-md border border-border bg-surface p-md text-14 text-foreground leading-120 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"
            onChange={(event) =>
              setProvider(event.target.value as AgentProvider)
            }
            value={provider}
          >
            {PROVIDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Provider agent id">
          <TextInput
            onChange={(event) => setProviderAgentId(event.target.value)}
            value={providerAgentId}
            wrapperClassName="w-full"
          />
        </Field>
      </div>

      <Field label="Issue creation criteria">
        <Textarea
          className="resize-y"
          onChange={(event) => setCriteria(event.target.value)}
          placeholder="Create an issue when…"
          rows={3}
          value={criteria}
        />
      </Field>

      <Field label="Issue type guidance">
        <Textarea
          className="resize-y"
          onChange={(event) => setAssignmentGuidance(event.target.value)}
          placeholder="Assign every issue type that applies…"
          rows={3}
          value={assignmentGuidance}
        />
      </Field>

      <div className="flex flex-col gap-sm">
        <FieldLabel>Allowed issue types</FieldLabel>
        {orgIssueTypes.length === 0 ? (
          <span className="text-12 text-foreground-muted leading-160">
            No issue types defined for this org yet.
          </span>
        ) : (
          <div className="flex flex-wrap gap-base">
            {orgIssueTypes.map((type) => {
              const active = allowedTypes.includes(type.key);
              const palette = colorFor(type.color);
              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center rounded-sm",
                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                    active
                      ? cn(
                          "ring-1",
                          palette?.ringClassName ?? "ring-foreground",
                        )
                      : "opacity-50",
                  )}
                  key={type.key}
                  onClick={() => toggleType(type.key)}
                  type="button"
                >
                  <IssueTypeChip color={type.color} label={type.label} />
                </button>
              );
            })}
          </div>
        )}
        {warnNoTypes ? (
          <span className="inline-flex items-center gap-xs text-12 text-yellow-400 leading-160">
            <Icon name="circle-alert" size="sm" />
            No types selected — calls won't be tagged with any issue type.
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between gap-base">
          <FieldLabel>Extraction fields</FieldLabel>
          <Button onClick={addField} type="button" variant="ghost">
            Add field
          </Button>
        </div>
        {fields.length === 0 ? (
          <span className="text-12 text-foreground-muted leading-160">
            No fields configured. Add one to extract structured data from calls.
          </span>
        ) : (
          <div className="flex flex-col gap-xs">
            {fields.map((field, index) => (
              <ExtractionFieldRow
                field={field}
                isBuiltIn={isBuiltInExtractionKey(field.key)}
                // biome-ignore lint/suspicious/noArrayIndexKey: rows are positionally controlled and have no stable id
                key={index}
                onChange={(patch) => updateField(index, patch)}
                onRemove={() => removeField(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-base">
        <Button
          disabled={busy}
          onClick={handleReset}
          type="button"
          variant="ghost"
        >
          Reset to defaults
        </Button>
        <Button disabled={busy} type="submit">
          Save changes
        </Button>
      </div>
    </form>
  );
}

function ExtractionFieldRow({
  field,
  isBuiltIn,
  onChange,
  onRemove,
}: {
  field: ExtractionField;
  isBuiltIn: boolean;
  onChange: (patch: Partial<ExtractionField>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-sm rounded-md bg-surface p-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_auto]">
      {isBuiltIn ? (
        <div className="flex min-w-0 items-center gap-xs rounded-md border border-border bg-background px-md py-md font-mono text-13 text-foreground-muted leading-120">
          <span className="truncate">{field.key}</span>
          <span className="ml-auto shrink-0 rounded-sm bg-secondary px-xs py-0 font-medium font-sans text-12 text-foreground-muted uppercase tracking-wide">
            Built-in
          </span>
        </div>
      ) : (
        <TextInput
          onChange={(event) => onChange({ key: event.target.value })}
          placeholder="contact_name"
          value={field.key}
          wrapperClassName="w-full"
        />
      )}
      <TextInput
        onChange={(event) => onChange({ label: event.target.value })}
        placeholder="Contact name"
        value={field.label}
        wrapperClassName="w-full"
      />
      <TextInput
        onChange={(event) =>
          onChange({ description: event.target.value || undefined })
        }
        placeholder="Description (optional)"
        value={field.description ?? ""}
        wrapperClassName="w-full"
      />
      {isBuiltIn ? (
        <span aria-hidden className="size-8" />
      ) : (
        <IconButton
          aria-label={`Remove ${field.label || field.key || "field"}`}
          icon={<Icon name="trash" size="sm" />}
          onClick={onRemove}
          size="sm"
        />
      )}
    </div>
  );
}

function AddAgentForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (
    args: {
      name: string;
      provider: AgentProvider;
      providerAgentId: string;
    },
    onDone: () => void,
  ) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<AgentProvider>("elevenlabs");
  const [providerAgentId, setProviderAgentId] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ name, provider, providerAgentId }, () => {
      setName("");
      setProvider("elevenlabs");
      setProviderAgentId("");
    });
  };

  return (
    <form
      className="flex flex-col gap-sm rounded-md border border-border border-dashed p-md"
      onSubmit={handleSubmit}
    >
      <span className="font-medium text-12 text-foreground-muted leading-120">
        Add agent
      </span>
      <div className="grid gap-sm md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)_minmax(0,1fr)_auto]">
        <Field label="Name">
          <TextInput
            onChange={(event) => setName(event.target.value)}
            placeholder="Property Management"
            value={name}
            wrapperClassName="w-full"
          />
        </Field>
        <Field label="Provider">
          <select
            className="w-full rounded-md border border-border bg-surface p-md text-14 text-foreground leading-120 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"
            onChange={(event) =>
              setProvider(event.target.value as AgentProvider)
            }
            value={provider}
          >
            {PROVIDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Provider agent id">
          <TextInput
            onChange={(event) => setProviderAgentId(event.target.value)}
            placeholder={provider === "elevenlabs" ? "agent_…" : "asst_…"}
            value={providerAgentId}
            wrapperClassName="w-full"
          />
        </Field>
        <div className="flex items-end">
          <Button
            className="w-full"
            disabled={busy || !name.trim() || !providerAgentId.trim()}
            type="submit"
          >
            Add
          </Button>
        </div>
      </div>
    </form>
  );
}
