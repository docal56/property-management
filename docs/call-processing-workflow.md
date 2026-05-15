# Call Processing Workflow

This document describes how Buzz should process voice provider webhooks into
conversations and issues. The current providers are ElevenLabs and Vapi.

## Core Model

One external provider agent maps to one Buzz agent.

For ElevenLabs, an agent may contain workflow subagents. Buzz should treat those
subagents as call-flow context, not as separate Buzz agents. Vapi assistants map
directly to Buzz agents through their assistant ID.

Provider identity is stored on the Buzz `agents` row:

```text
provider          elevenlabs | vapi
providerAgentId   external provider agent/assistant id
```

`callAgentId` remains the internal Buzz foreign key on conversations and issues.

The current product model is:

```text
1 call
  -> 1 conversation
  -> 0 or 1 issue
```

A single call may involve multiple workflow subagents and multiple use cases.
For example, a caller may start by booking a viewing and then also request a
valuation. That is still one call, one conversation, and at most one issue.

## Org Issue Taxonomy

Issue types should be owned by the organization, not by individual agents.

An organization may eventually have multiple call agents that all write into the
same board and reporting views. The org-level taxonomy gives filters, badges,
analytics, and issue type labels one canonical source.

For now this does not need to be user-editable. It can be configured by
developers through scripts, the Convex dashboard, or internal admin tooling.

Suggested shape on the `orgs` row:

```ts
{
  issueTypes: Array<{
    key: string;
    label: string;
    description?: string;
    color?: string;
  }>;
}
```

Example:

```ts
{
  issueTypes: [
    { key: "enquiry", label: "Enquiry", color: "purple" },
    { key: "emergency", label: "Emergency", color: "red" },
  ],
}
```

Each agent then declares which of the org's type keys it can emit. A receptionist
agent can start with enquiry and emergency, then later narrow or expand as the
org taxonomy becomes more specific.

`issues.types` should store the matched org type keys as strings. The UI should
look up labels from `org.issueTypes`, with generic fallback labels for unknown
keys.

## Buzz Agent Issue Config

Issue acceptance and data extraction are owned by Buzz, not ElevenLabs analysis.

Each Buzz agent should have one issue config. Store it as a JSON-like field
on the `agents` row to keep the first implementation flexible.

The agent issue config controls:

- issue creation criteria for this agent
- which org issue type keys this agent may emit
- which fields this agent should extract

The field definitions live on the agent because fields are specific to what that
agent collects. The issue type labels live on the org because filters/reporting
are shared across all agents in the account.

Suggested shape:

```ts
{
  issueCreationCriteria: string;
  allowedIssueTypes: string[];
  extractionFields: Array<{
    key: string;
    label: string;
    description?: string;
  }>;
}
```

Example for a receptionist agent:

```ts
{
  issueCreationCriteria:
    "Create an issue when the caller needs staff follow-up for a real property enquiry, property-management request, emergency, or request to speak to the team. Do not create an issue for spam, wrong numbers, silent calls, duplicate no-action calls, test calls, or calls where no request was made.",
  allowedIssueTypes: ["enquiry", "emergency"],
  extractionFields: [
    { key: "name", label: "Name", description: "Caller name" },
    {
      key: "phone",
      label: "Phone number",
      description: "Best callback number",
    },
    { key: "email", label: "Email", description: "Caller email address" },
    {
      key: "address",
      label: "Address",
      description: "Relevant caller or property address",
    },
    {
      key: "property_interested_in",
      label: "Property interested in",
      description: "Property the caller wants to view",
    },
    {
      key: "availability_notes",
      label: "Availability notes",
      description: "Best times or unavailable times",
    },
    { key: "property_type", label: "Property type" },
    { key: "bedrooms", label: "Bedrooms" },
    {
      key: "valuation_property_address",
      label: "Valuation property address",
    },
    {
      key: "team_member_or_reason",
      label: "Team member or reason",
      description: "Who the caller wants to speak to, or what the call is about",
    },
    { key: "notes", label: "Notes" },
  ],
}
```

Keep fields optional. The extraction step should fill only values supported by
the transcript.

## Processing Pipeline

The intended pipeline is:

```text
1. Ingest provider webhook
2. Store raw payload and normalized conversation
3. Run issue acceptance
4. If accepted, run data extraction
5. If accepted, create one issue
6. Always keep the call visible in call logs
```

Do not rely on ElevenLabs analysis as the business source of truth. ElevenLabs
and Vapi provide the call, transcript/messages, external agent ID, and optional
metadata. Buzz decides whether the call should create an issue and which data
fields are extracted.

## Acceptance Step

Acceptance is its own LLM step. It runs before full data extraction.

Use a stable structured output:

```ts
{
  shouldCreateIssue: boolean;
  reason: string | null;
  issueTypes: string[];
  confidence: "low" | "medium" | "high";
}
```

Rules:

- `shouldCreateIssue` controls whether an issue is created.
- `reason` is `null` when accepted.
- `reason` should be a short machine-readable string when rejected, such as
  `wrong_number`, `spam`, `test_call`, `no_request_made`, or `no_transcript`.
- `issueTypes` must use issue type keys from the agent issue config's
  `allowedIssueTypes`.
- `issueTypes` may contain multiple values.
- `confidence` is for UI/debugging at first, not a hard business gate.

Deterministic guards such as failed call, missing transcript, or extremely short
duration may skip the LLM. They should still write the same acceptance result
shape with an appropriate `reason`.

## Extraction Step

Run full extraction only when the acceptance step returns
`shouldCreateIssue: true`.

The extraction step should receive:

- transcript
- agent name
- acceptance result
- agent issue config
- optional fields parsed from ElevenLabs analysis as hints

The extraction result should stay configurable:

```ts
{
  fields: Record<string, string | number | boolean | null>;
  notes: string | null;
}
```

The keys in `fields` should come from `issueConfig.extractionFields`. The
UI can use the issue config labels to render a simple label/value list and hide
empty values.

The actual extracted values should live on the conversation and be copied onto
the issue:

```ts
conversation.extractionResults = {
  fields: {
    name: "Sarah Jones",
    phone: "07123...",
    property_interested_in: "Flat 2, 10 King Street",
  },
  notes: "Caller wants a viewing and also asked about a valuation.",
}
```

The issue should retain a copy so it remains inspectable even if the agent issue
config changes later.

Do not add field groups, per-issue-type schemas, or per-subagent schemas yet. A
single call can contain more than one issue type, so a switching model will be
too rigid.

## Issue Creation

Accepted calls create one issue from the conversation.

The issue should preserve:

- originating conversation ID
- originating Buzz agent ID
- acceptance result
- matched issue type keys as `types`
- extracted field values

Where useful, extracted fields can be mapped into first-class issue columns such
as contact name, phone, email, address, and summary. The full extraction results
should still be retained so newer agent issue configs do not require schema
changes for every new field.

Rejected calls do not create issues, but they remain visible in the call log
with their acceptance reason.

## Workflow/Subagent Context

ElevenLabs workflow subagents are useful context but should not drive business
logic yet.

The raw webhook includes workflow attribution on agent transcript turns:

```ts
transcript[i].agent_metadata.workflow_node_id
```

The ElevenLabs agent API can map those IDs back to workflow node labels via the
agent workflow graph:

```text
GET /v1/convai/agents/:agent_id?branch_id=...&version_id=...
```

This can support a lightweight workflow trace:

```ts
{
  agentId: string;
  branchId: string;
  versionId: string;
  nodes: Array<{
    workflowNodeId: string;
    label: string | null;
    firstTimeInCallSecs: number | null;
    lastTimeInCallSecs: number | null;
  }>;
}
```

Record this later if useful for debugging or UI context. Do not make issue
acceptance depend on a workflow node being present or mapped.

## What Not To Build Yet

Avoid these until the product needs them:

- per-subagent Buzz agents
- per-subagent issue creation criteria
- per-subagent extraction schemas
- field groups and form-builder behavior
- issue creation driven only by workflow node
- hard dependency on ElevenLabs data collection results

The first implementation should be agent-level, transcript-driven, and easy to
edit from an Agent Admin page later.
