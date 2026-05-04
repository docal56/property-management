@AGENTS.md

## Stack at a glance

- **Framework:** Next.js 16 App Router with Turbopack. Middleware file is `src/proxy.ts` (Next 16 rename of `middleware.ts`).
- **Language:** TypeScript 6 with `@typescript/native-preview`. Typecheck via `pnpm typecheck` (`tsgo --noEmit`).
- **UI:** React 19, Tailwind v4 (config in `src/app/globals.css` — no `tailwind.config.js`), Radix Primitives (`radix-ui` package), and `@dnd-kit/*` for kanban drag/drop.
- **Backend:** Convex 1.36. Schema + functions under `convex/`.
- **Auth:** Clerk 7 issues JWTs consumed by Convex via `ConvexProviderWithClerk`. Clerk → Convex sync via Svix-verified webhook at `convex/clerk/webhook.ts`.
- **Env vars:** validated through `src/env.ts` (`@t3-oss/env-nextjs` + Zod). Import env via `import { env } from "@/env"` — never `process.env` directly in app code.
- **Lint/format:** Biome (`pnpm check`, `pnpm check:write`). No ESLint/Prettier.
- **Tests:** Vitest + Testing Library (jsdom). `pnpm test`, `pnpm test:watch`.

## Path aliases

- `@/*` → `src/*`
- `@/convex/*` → `convex/*`

## Folder conventions

- `src/app/(app)/` — authenticated routes (gated by `src/proxy.ts`).
- `src/app/(auth)/` — sign-in / sign-up / sign-out.
- `src/components/ui/` — low-level design-system primitives. `src/components/patterns/` — reusable composed patterns such as `AppShell`, `MainNav`, `KanbanBoard`, `DataTable`, panels, timeline, transcript, and page headers.
- `src/components/icons/` + `src/components/ui/icons-data.ts` — checked-in SVG icon assets and generated icon data consumed through `<Icon name="…" />`.
- `src/app/(design)/components/` — design-system showcase routes served under `/components`; staff-only via the route layout. Keep demos updated when adding primitives or patterns.
- `src/server/convex.ts` — singleton `ConvexReactClient` for the browser.
- `convex/_generated/` is **committed** (so CI type-checks without running `convex dev`). Don't gitignore it.
- `docs/DESIGN.md` is the source of truth for tokens + component composition. Consult it before inventing new UI primitives. `docs/design-system-reference.md` is legacy historical context only.
- `docs/` holds internal long-form documentation (design reference, tutorials). Not shipped — keep agent-facing rules in this file or `AGENTS.md`.

## Convex

This project uses [Convex](https://convex.dev). **Always read `convex/_generated/ai/guidelines.md` first** when touching Convex code — those rules override training data.

Schema lives in `convex/schema.ts`: `users`, `orgs`, `memberships`. Auth helpers shared across queries/mutations are in `convex/lib/auth.ts`.

Convex agent skills can be installed with `npx convex ai-files install`.

### Authorization rules (non-negotiable)

Every tenant-scoped authenticated query/mutation must:

1. **Start with `const { user, org } = await requireUserAndOrg(ctx)`** from `convex/lib/auth.ts`. Don't roll your own identity check.
2. **Never accept `orgId` or other org-scoping foreign keys from client args.** Derive the active org from the JWT (`identity.o.id`), which the helper does for you. If the client supplies an org reference, assume it's trying to pivot — reject it.
3. **Scope every query by `org._id`.** A missing `.withIndex("by_org_…", q => q.eq("orgId", org._id))` is a cross-tenant data leak. Treat this clause as the authorization boundary, not a post-hoc filter.
4. **Verify ownership on mutations that accept a Convex `_id` arg.** Always `ctx.db.get(id)` first, then `if (!doc || doc.orgId !== org._id) throw new Error("Not found")`. The `_id` type is opaque but guessable if IDs appear in URLs.
5. **Role checks read from `identity.o.rol` (JWT), not from `memberships.role` (DB).** The JWT refreshes every ~50s; the DB row can lag. Query `memberships` only for cross-user listings ("all admins in this org"), not to gate the current user's action.
6. **Staff-admin functions are global, not tenant-scoped.** Keep them under `convex/admin*` and gate them with `requireBuzzAdmin()` (or a stricter helper built on top of it), not customer organization membership.
7. **Don't use self-set profile fields for authorization** — `name`, `nickname`, and `email` are user-editable in Clerk. `o.id`, `o.rol`, and custom claims issued in the signed Clerk token are trustworthy after Convex verifies the token. For auth-linked database keys, prefer `identity.tokenIdentifier`; only use `identity.subject` with a single, fixed Clerk issuer and do not treat it as globally unique across providers/environments.

## Deploy

- Vercel build command (from `vercel.json`): `pnpm dlx convex deploy --cmd 'pnpm build'` — Convex functions deploy before the Next build.
- `CONVEX_DEPLOY_KEY` is only needed on Vercel, not locally.
- `CLERK_JWT_ISSUER_DOMAIN` must be set in **both** the Vercel env and the Convex dashboard env.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
