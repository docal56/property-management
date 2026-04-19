# Prompt — Create Phase 0 Linear Tickets

Copy the block below into a new Claude Code session at the root of this repo.

---

```
I need you to break Phase 0 of this project into Linear tickets for a coding agent (Claude Code) to implement. Codex will review the resulting PRs.

## Before you write any tickets

Read these files in order. Do not skip any of them.

1. `AGENTS.md` — project conventions (if present; may be a placeholder)
2. `DECISIONS.md` — running log of scope decisions and gotchas. Read every entry. These override anything that contradicts them in the specs.
3. `docs/phase-0/product-spec.md` — what we're building in Phase 0. Self-contained.
4. `docs/phase-0/design-spec.md` — how the two pages look and behave.
5. `docs/phase-0/tech-spec.md` — stack, schema, API surface, ElevenLabs integration, conventions.
6. `docs/docs.md` — pointers to service-specific docs (Convex, Clerk, ElevenLabs, Vercel, Twilio).
7. `docs/design-system-reference.md` — the design system reference the UI will be built from.

Do NOT read `docs/vision-spec.md` — it covers phases beyond Phase 0 and will pollute your context with out-of-scope work.

## Then use the linear-ticket skill

Invoke the `linear-ticket` skill. It has the full framework for writing agent-ready tickets. Follow it end-to-end.

## Scope

- Linear team/project: "Property Management App" (confirm exact name with me before creating anything)
- Phase 0 only. Do not create tickets for Phase 1, 1.5, or anything in `vision-spec.md`.
- One epic per major area of work. Tickets underneath the epic.

## Ticket sequencing — important

The tech spec intentionally sequences work so the UI is buildable before ElevenLabs is wired up. Reflect this in ticket ordering and dependencies:

1. **Foundation** — repo scaffolding, Next.js, Tailwind, Convex init, folder structure, env config
2. **Auth + tenancy** — Clerk integration, `publicMetadata.agencyId`, `getAgencyIdForCurrentUser` helper, auth middleware
3. **Schema** — all six tables per tech-spec.md section 4, with indexes
4. **Seed data / CSV import script** — the script that reads an Agency CSV and writes Agency + Properties + Contacts to Convex. Also create a mock seed that writes sample Calls + Issues in the shape the webhook will eventually produce. This unblocks UI work.
5. **Queries and mutations** — all ten functions in tech-spec.md section 6, plus the tenancy helper they all depend on
6. **Design system / UI primitives** — bring the design system into `/components/ui` (atoms) and `/components/composed` (combined atoms)
7. **Open Issues page** — list, grouped-by-status, collapsible sections, search, keyboard nav hooks
8. **Issue slide-over panel** — status + contractor fields, Details block, Copy Details, Upload Media, audio player, transcript, up/down browse
9. **Call Logs page** — metrics row, logs table, date range selector
10. **Media retention crons** — `markMediaForDeletion` and `hardDeleteMedia`
11. **ElevenLabs webhook integration** — the final step. Confirm real payload shape, write adapter, wire to the internal function that already exists from the seed work
12. **Production cutover** — Vercel prod deploy, Convex prod deploy, Clerk prod instance, Twilio → ElevenLabs → webhook URL wiring

Each ticket should declare its dependencies explicitly (e.g. "Depends on TICKET-3 Schema").

## What every ticket must include

Per the linear-ticket skill — but to reinforce:

- **Clear acceptance criteria** (not vague goals). A coding agent should be able to say "done" or "not done" unambiguously.
- **File paths** for what's being created or modified, per the tech spec's folder structure
- **References** to the exact spec sections that govern the work (e.g. "See tech-spec.md section 4.2")
- **Test expectations** — unit tests where appropriate (tech-spec.md section on testing), manual verification steps for UI
- **Out-of-scope callouts** — link to `DECISIONS.md` entries where relevant so the agent doesn't re-introduce cut scope

## Gotchas to reinforce in tickets

Copy these into relevant tickets so the implementing agent sees them without needing to have read every file:

- `agencyId` filter on every tenant-scoped query and mutation, via the `getAgencyIdForCurrentUser` helper. No exceptions.
- No Users table — Clerk is source of truth for users. Only Clerk user IDs land on our records.
- No REST API routes. Webhooks go through Convex HTTP actions.
- No onboarding UI, no Team Member role, no filters, no Managed Properties/Contacts/Settings pages in Phase 0.
- "Resolved" is the only end state. No separate Closed-No-Action status.
- `urgent` is AI-set on creation. No UI for the Admin to set it in Phase 0.
- Build-with-mock-first — UI and data layer must work against seed data before the real ElevenLabs webhook lands. Don't sequence the webhook too early.
- CSV-driven onboarding (operator-run). No user-facing import UI.

## When you're unsure

Ask me before creating tickets. Especially on:

- Linear project/team name
- How fine-grained to make tickets (I lean toward smaller, so an agent can finish one in a single session)
- Whether any ticket should be split further
- Anything that contradicts something in DECISIONS.md

## What I want back

1. A proposed list of epics and tickets (titles only, with sequencing) for me to review
2. After I approve, create them in Linear with full ticket bodies
3. A summary at the end: total ticket count, epic breakdown, estimated critical path

Don't create the tickets until I've approved the list.
```

---

## Notes for Dave (not part of the prompt above)

- This prompt tells the next session to read all the right context files in the right order and skip `vision-spec.md` so it doesn't get distracted by future phases.
- It explicitly names the `linear-ticket` skill — if that skill is available in the next session, the agent will load it and follow its framework.
- The sequencing list mirrors the build order baked into the tech spec (mock-first, webhook last).
- The "ask before creating" gate at the end is deliberate — you get a chance to approve the ticket list before 30+ issues land in Linear.
