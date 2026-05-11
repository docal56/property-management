# Per-Tenant Call Data Customisation

How Buzz processes calls into issues today, what's already flexible per agent
and per org, and the path to fully tenant-controlled extraction, prompts, and
issue display.

This is a direction document, not a backlog. It exists so the next person to
extend the call pipeline knows which knobs already turn and which are still
rigid.

## End Game

Each Buzz staff onboarding flow should let us, per agent:

- Wire up an ElevenLabs agent (external id, name).
- Define the org's issue taxonomy (types, colours, ordering).
- Configure custom extraction fields with per-field hints/descriptions.
- Tune the acceptance + extraction prompts for the specific use case
  (receptionist, dental booking, property enquiry, etc).
- Decide which extracted fields surface where in the issue UI — title row,
  body, date column, sidebar attributes — and in what order.

The first three are already in place. The last two are not, and the rigid
pieces in the pipeline are the only thing standing between us and them.

## Current Pipeline (Status as of 2026-05-12)

End-to-end flow for a transcription webhook:

1. `convex/elevenlabs/webhook.ts` verifies signature, classifies the event.
2. `convex/conversations.ts` `ingestFromWebhook` matches the agent by
   `elevenlabsAgentId`, upserts the conversation, applies cheap pre-filters
   (`call_failed`, `short_duration`, `no_transcript`), then schedules
   `runAcceptance`.
3. `convex/extraction/llm.ts` `runAcceptance` (Claude Haiku 4.5) reads the org
   + agent, builds a prompt with the org issue taxonomy and agent issue
   config, and asks the model whether to create an issue and which types
   apply. Output is filtered against `agent.issueConfig.allowedIssueTypes`.
4. If accepted, `runExtraction` asks the model to fill the configured
   extraction fields. Output is filtered against the configured field keys.
5. `createIssueFromConversation` writes the issue row, then `runIssueSummary`
   produces a polished summary.

## What's Already Flexible

These can change per agent or per org without code or schema work:

- **Org issue types.** `orgs.issueTypes` is an array of
  `{ key, label, description?, color? }`. Customer-visible labels, colours,
  and ordering are admin-driven via the Buzz Admin UI.
- **Per-agent issue config.** `agents.issueConfig` holds
  `{ issueCreationCriteria, allowedIssueTypes, extractionFields }`.
  - Acceptance criteria is a free-form string dropped into the prompt.
  - Allowed types is a hard subset of the org taxonomy — the model can't tag
    anything outside it.
  - Extraction fields are an arbitrary list of `{ key, label, description? }`
    that drive what the second LLM call fills.
- **Defaults.** Agents and orgs with no config fall back to
  `DEFAULT_ISSUE_TYPES` and `DEFAULT_AGENT_ISSUE_CONFIG` in
  `convex/extraction/schema.ts`. This is how new tenants stay functional with
  zero setup.

The data shape on `agent.issueConfig` is a JSON blob in the schema
(`v.object(...)`). Adding new optional sub-fields does not require a
migration — the validator on `convex/admin.ts` is the gate.

## What's Rigid

Three specific places lock us out of the end-game UX:

### 1. Hardcoded extraction-key → issue-column mapping

`convex/conversations.ts` `createIssueFromConversation` looks up specific
literal keys to populate first-class issue columns:

| Issue column | Extraction keys searched |
|---|---|
| `address` | `address`, `valuation_property_address`, `property_address` |
| `contactName` | `name`, `caller_name` |
| `contactPhone` | `phone`, `phone_number` (fallback: `callFromNumber`) |
| `contactEmail` | `email` |

If an admin renames or removes these keys, the auto-population breaks
silently — the data still lives on `conversation.extractionResults.fields`
and `issue.extractionResults.fields`, but the columns stay null.

**Path forward:** introduce `agent.issueConfig.fieldMappings` (or a similar
shape) — a record from issue-column name to a list of extraction keys to try
in order. Replace the hardcoded list with a config lookup that falls back to
the current literals when no mapping is set.

### 2. First-class issue columns

`issues` rows have typed columns `address`, `contactName`, `contactPhone`,
`contactEmail`. These show up in the list view, kanban cards, and the detail
sidebar. Their existence forces a fixed "headline shape" for every issue.

**Two viable paths:**

- **Keep them as well-known shortcuts.** Add `org.displayConfig` (or
  `agent.displayConfig`) saying which extraction fields appear in the issue
  UI in which slots — title, body, sidebar attributes, list-row columns —
  and in what order. The first-class columns stay populated for analytics
  and search; the *displayed* fields can come from anywhere in
  `extractionResults.fields`. Lower risk, faster to ship.
- **Generalise to attributes.** Move `address`/`contactName`/etc into a
  generic `attributes: Record<string, value>` blob and have the display
  config govern everything. Larger schema change, knock-on effects to all
  filter/search/query code.

The "well-known shortcuts" route is the recommended next step.

### 3. Global LLM prompt template

`ACCEPTANCE_SYSTEM_PROMPT` and `EXTRACTION_SYSTEM_PROMPT` in
`convex/extraction/llm.ts` are constants. The agent's
`issueCreationCriteria` is dropped into the *user* prompt as JSON; the
system rules are shared across every tenant.

**Path forward:** optional `agent.issueConfig.acceptanceSystemPrompt` and
`agent.issueConfig.extractionSystemPrompt` overrides. When present, replace
the global constant for that call. Validate that they include the basic
contract (return shape rules, key-only constraints) — or wrap a per-tenant
*addendum* onto the global prompt rather than replacing wholesale.

A wrapping approach (`SYSTEM_PROMPT + agent.acceptanceSystemPromptAddendum`)
is safer than full overrides because it keeps the output-shape rules
non-negotiable.

## Suggested Order of Operations

When we're ready to extend:

1. **Seed defaults on agent create.** When the admin clicks Create Agent,
   copy `DEFAULT_AGENT_ISSUE_CONFIG` into the new agent's `issueConfig`. The
   four well-known keys (`name`, `phone`, `email`, `address`) become visible
   in the admin UI immediately, and the admin's choice to keep or change
   them is *active*, not hidden. No pipeline change required.

2. **Add `fieldMappings` and start using it.** Introduce the optional
   sub-field on `agent.issueConfig`. Update
   `createIssueFromConversation` to prefer mappings when present and fall
   back to the current literals. Expose it in the admin UI as a
   "where does this extraction land?" picker on each field. Low blast
   radius.

3. **Add `displayConfig` and wire issue UI.** Define what slots the
   issue list/detail expose (title, body, sidebar attributes, list columns)
   and let the admin pick which extraction keys feed each. The current
   typed columns continue to be written for analytics, but the displayed
   value comes from config.

4. **Add prompt addenda.** Optional per-agent strings that get concatenated
   onto the global system prompts. Start with acceptance only; extraction
   addenda follow if needed. Resist full overrides until we have a
   compelling case.

5. **Per-org display config.** Generalise step 3 to apply at the org level
   for shared UI defaults across multiple agents in the same tenant.

Each step is independent and additive. Steps 1 and 2 alone unlock most of
the practical flexibility customers will ask for.

## Things to Keep in Mind

- **`extractionResults.fields` is already generic.** It's a
  `Record<string, value>` on both conversations and issues. Whatever the
  LLM extracts ends up there, regardless of whether it maps to a first-class
  column. Customer-visible attribute views can read straight from this blob.
- **Editing an agent's config does not reprocess past calls.** Each
  conversation captures the acceptance and extraction results at the time it
  ran. Renaming a type or removing a field affects future calls only.
- **`updateIssueType` / `deleteIssueType` cascade across agents.** When an
  org renames or removes an issue type, every agent's `allowedIssueTypes` is
  patched. Existing `issues.types` arrays are *not* rewritten — they keep
  the old key. Filter chips for those issues fall through to the neutral
  title-case fallback in the issues UI until manually patched.
- **Authorisation.** All admin mutations live under `convex/admin.ts` and
  go through `requireBuzzAdmin()`. Cross-tenant access is intentional —
  admin functions are not tenant-scoped. Customer-facing functions should
  continue to use `requireUserAndOrg()` and never accept `orgId` from the
  client (see [CLAUDE.md](../CLAUDE.md) "Authorization rules").

## Open Questions

- Should display config live on the org or the agent? Probably both, with
  agent overriding org when present.
- How do per-agent prompt addenda interact with shared compliance rules
  (e.g. "never recommend medical advice" for a healthcare tenant)? Likely a
  third tier: org-level baseline + agent-level addendum + global rules,
  composed in that order.
- Do we want a "preview against a transcript" tool in the admin UI for
  testing prompt changes before saving? Would significantly improve the
  configuration loop but is a meaningful build.

These are problems for the day we start step 2 or 3, not now.
