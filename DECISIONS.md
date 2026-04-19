# DECISIONS.md

Running log of key decisions and gotchas. Coding agents append entries here when something future sessions need to know.

## Format

Each entry:

```
## YYYY-MM-DD — [short title]
**Context:** what prompted this
**Decision:** what we're doing
**Why:** reasoning
**Watch for:** gotchas or implications
```

## Entries

## 2026-04-19 — GitHub repo location
**Context:** Repo is now hosted at https://github.com/docal56/property-management (public).
**Decision:** Canonical URL is the one above. Coding agents that need to clone or link to files reference this repo.
**Why:** Single source of truth so agents don't invent URLs.
**Watch for:**
- Repo is public. Do not commit secrets, `.env.local`, real Agency data, or real Clerk/Convex/ElevenLabs keys.
- If the repo ever moves, update this entry.

## 2026-04-19 — Stack versioning policy: "latest stable at time of install"
**Context:** Tech-spec originally pinned specific major versions (e.g. "Next.js 15"). Those pins went stale quickly — by April 2026, Next.js 16.2 was current and pinning 15 in a brand-new project would start the codebase two majors behind.
**Decision:** Every tool in the stack is installed at its latest stable version at the time the project is initialised. No hard majors in the tech-spec. If an incompatibility forces a downgrade, log it as a new DECISIONS entry so later agents know why.
**Why:** The tech-spec is a living document but ticket bodies are snapshot-in-time instructions. Hard-pinning majors in either place causes drift without adding safety. "Latest stable at time of install" defers the version choice to the scaffolding agent, who can run `npx create-next-app@latest` and see what comes down.
**Watch for:**
- This applies to majors, not to pinning within a major. Once the first commit lands, `package.json` pins the exact versions for reproducibility (via the pnpm lockfile).
- If a specific tool has a known incompatibility with another (e.g. a new Clerk major that breaks with an older Next.js major), document it here and pin accordingly.
- Do NOT downgrade from the scaffolder's default without a DECISIONS entry explaining why.

## 2026-04-19 — Tailwind v4 adopted (CSS-first config)
**Context:** Tech-spec originally hedged — "Tailwind v4 if stable, otherwise v3.4+". Tailwind v4 is now production-stable. The big change from v3 is configuration format: tokens live in CSS via `@theme { ... }`, not in `tailwind.config.js`.
**Decision:** Phase 0 uses Tailwind v4. The `design-system-reference.md` has been rewritten to match. Token values are unchanged; only the file they live in and the syntax differ.
**Why:** Tailwind v4 is stable, and scaffolding a brand-new project on v3 would mean a forced migration later. Adopting v4 up-front avoids that work.
**Watch for:**
- No `tailwind.config.js` should exist in this project. If `create-next-app` generates one, delete it and move tokens into `@theme` in `app/globals.css`.
- v4 uses `@import "tailwindcss";` (single import) — NOT v3's `@tailwind base; @tailwind components; @tailwind utilities;`.
- Content paths are auto-detected in v4 — no `content: [...]` array.
- Token naming determines utility generation: `--color-*` → `bg-*/text-*/border-*`; `--text-*` → font-size utilities; `--spacing-*` → `p-*/m-*/gap-*` etc. Rename carefully or utilities won't exist.
- Dark mode is NOT set up (Phase 0 is light only). See design-system-reference for how to add later.

## 2026-04-18 — Urgency is inferred, not asked
**Context:** Initial product spec had an urgency level (low/medium/high) captured by the AI Agent asking the caller.
**Decision:** Remove urgency level entirely. Replace with a single `urgent` boolean flag. The AI Agent sets this based on rules in its prompt (e.g. no heating, flooding, security issue), not by asking the caller.
**Why:** Callers always self-report as urgent. Inferring from the issue type gives more reliable signal.
**Watch for:** Do not add a UI for Team Members or callers to set urgency level. The field is boolean, AI-set at creation. Team Member can override the flag.

## 2026-04-18 — No onboarding UI in MVP
**Context:** Product spec originally included a CSV import flow.
**Decision:** Onboarding is operator-run (manual, against the database) for MVP. No user-facing import UI.
**Why:** Faster to ship. Operator handles onboarding for every Agency personally at this stage.
**Watch for:** Do not build CSV upload or admin onboarding flows. Admin users can still invite team members from within the app — that's separate.

## 2026-04-18 — Split: `product-spec.md` = current phase, `vision-spec.md` = long-term
**Context:** The original product spec mixed the full vision with phasing, which meant coding agents loading it got a lot of out-of-scope context.
**Decision:** Split into two documents:
- `product-spec.md` — scoped to the currently active phase (Phase 0 today). Self-contained. This is what coding agents load to build.
- `vision-spec.md` — the full long-term product vision across all phases. Reference only, not for coding agents.
**Why:** Keeps coding agent context tight and on-target. Vision is preserved for strategic decisions without cluttering implementation.
**Watch for:**
- When Phase 0 ships and Phase 1 starts, `product-spec.md` gets rewritten for Phase 1 scope. The previous Phase 0 spec can be archived or replaced.
- AGENTS.md should point coding agents at `product-spec.md`, not `vision-spec.md`.
- Do NOT reconcile differences between the two by editing the other — they serve different purposes.

## 2026-04-18 — Phase 0 scope drastically narrowed
**Context:** After designing in Figma, scope was cut to ship the minimum useful slice.
**Decision:** Phase 0 ships only two pages — Open Issues and Call Logs — with an Admin-only account model. See product-spec.md section 18 (Phase 0) and design-spec.md for full definition.
**Why:** Faster to validate the core call → issue → resolve loop with the first Agency. Everything not essential to that loop has been pushed to later phases.
**Watch for:**
- Do NOT build Team Member role, Issue assignment to Users, notes, filters, Managed Properties/Contacts/Settings pages, email notifications, or empty/loading/error state designs in Phase 0.
- DO build the full data model (Agency, Property, Contact, Issue) — it's referenced even though Properties and Contacts have no UI.
- "Resolved" is the only end state in Phase 0. It covers both fixed-and-done and no-action-needed. Closed-No-Action as a separate status is deferred.
- "Contractor for the job" is a free-text field on Issues. There is no Team Member assignment.
- The AI Agent must produce a structured Details block (address, name, contact number, description) that reads well as a copy-pasted contractor message. This is both UI content and a prompt requirement.
- Call Status is Success (all four fields captured) or Failed (any missing). Pass Rate is Success ÷ Total.

## 2026-04-18 — Onboarding is CSV-driven, matching via AI Agent knowledge base
**Context:** Onboarding per-Agency needs property + tenant data in the system before calls land. Also, matching a webhook's inbound address to a Managed Property record is fragile if done by fuzzy string match.
**Decision:**
- Operator onboards each Agency by importing a CSV of properties + current tenants. Seed/import script reads the CSV and writes directly to Convex. No user-facing import UI in Phase 0.
- The AI Agent (ElevenLabs) is given a knowledge base per Agency containing the Agency's property list. The agent verifies the caller's address against this list during the call.
- On webhook receipt, the agent should ideally return a property identifier (matched from its knowledge base) rather than a raw address string. This lets the webhook do an exact lookup instead of fuzzy matching.
**Why:** CSV is the lowest-lift onboarding mechanism and works with whatever the Agency exports from. Putting the property list into the agent's knowledge base moves the matching problem from our server to the agent where it already has conversation context.
**Watch for:**
- Decide how Agency property IDs map between the knowledge base and Convex. Options: (a) use the Convex `_id` directly in the knowledge base, or (b) keep an `externalId` field on the Property table that matches whatever ID the agent has. Resolve during ElevenLabs integration ticket.
- If the agent cannot return a matched property ID (i.e. the ElevenLabs platform doesn't support it in the output schema), fall back to fuzzy address matching as currently specced in tech-spec.md section 7.
- Document the CSV format and required columns alongside the import script so the operator (Dave) can prep Agency data consistently.

## 2026-04-18 — No automated media ingestion in MVP (superseded previous email decision)
**Context:** Earlier plan was per-Agency inbound email addresses for tenants to send photos/videos to, with automatic ingestion into the right Issue.
**Decision:** Drop all automated media ingestion for MVP. Tenants send photos/videos directly to the Agency via channels the Agency manages themselves (their own phone or email). Team Members manually upload media to the Issue in the app via an upload control on the media tab.
**Why:** Removes a whole class of integration work (email infrastructure, sender matching, WhatsApp) for the MVP. Accepts some Team Member friction as a known trade-off. The core value of the product is captured calls + triaged Issues, not automated media ingestion.
**Watch for:**
- Do NOT build email ingestion, Postmark/Resend/Mailgun integration, per-Agency issues email addresses, or WhatsApp media capture in Phase 1.
- The AI Agent prompt should tell tenants to send media directly to the Agency (not to a system email) and include the property address in the message.
- The Issue detail page needs a manual media upload control (photos/videos) on the Media tab.
- Audio recording + transcript from the call itself ARE still captured automatically via ElevenLabs — that's not "media ingestion" in the sense above.
- Automated ingestion is planned as a Phase 1.5 fast-follow.
