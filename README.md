# buzz-app

Next.js 16 + Convex + Clerk + Tailwind v4 + Radix Primitives.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then fill in the values

# In two separate terminals:
pnpm exec convex dev         # Convex backend (keeps types synced)
pnpm dev                     # Next.js (http://localhost:3000)
```

## Stack

| Piece | Purpose |
|---|---|
| Next.js 16 (App Router, Turbopack) | UI framework |
| React 19 | UI library |
| TypeScript 6 + `tsgo` | Types, checked via `@typescript/native-preview` |
| Tailwind v4 | Styling — config lives in `src/app/globals.css` (no `tailwind.config.js`) |
| Radix Primitives (`radix-ui`) | Unstyled accessible UI primitives, base of the design system in `src/components/` |
| Convex | Backend: database + serverless functions + realtime |
| Clerk | Authentication; issues JWTs consumed by Convex |
| `@t3-oss/env-nextjs` + Zod | Runtime env var validation (`src/env.ts`) |
| Svix | Verifies Clerk webhooks on the Convex side |
| Biome | Lint + format (replaces ESLint/Prettier) |
| Vitest + Testing Library | Unit/component tests (jsdom) |
| Vercel | Hosting |

## Scripts

```bash
pnpm dev            # Next dev server
pnpm build          # Next production build
pnpm start          # Serve production build
pnpm check          # Biome lint + format check
pnpm check:write    # Biome auto-fix
pnpm typecheck      # tsgo --noEmit
pnpm test           # Vitest (one-shot)
pnpm test:watch     # Vitest watch
pnpm test:ui        # Vitest UI
pnpm test:cov       # Coverage report
```

## Dashboards

- Convex: https://dashboard.convex.dev
- Clerk: https://dashboard.clerk.com
- Vercel: https://vercel.com/dashboard

## Folder layout

```
src/
  app/                        # Next App Router
    (app)/                    # Authenticated routes (gated by src/proxy.ts)
      call-logs/
    (auth)/                   # sign-in, sign-up, sign-out
    layout.tsx
    providers.tsx             # ClerkProvider + ConvexProviderWithClerk + UserBootstrap
    globals.css               # Tailwind v4 config + tokens
  components/
    ui/                       # Low-level primitives (button, input, card, …)
    composed/                 # Composed patterns (form-field, table, side-panel, …)
    features/                 # Feature-specific components
    user-bootstrap.tsx        # Runs useStoreUserEffect on mount
  hooks/                      # React hooks
  lib/                        # Utilities (+ colocated *.test.ts)
  server/                     # Client-side Convex client setup
  types/
  env.ts                      # Validated env vars (import from "@/env")
  proxy.ts                    # Clerk middleware (Next 16 renamed middleware.ts → proxy.ts)

convex/
  schema.ts                   # users, orgs, memberships
  auth.config.ts              # Clerk JWT provider wiring
  http.ts                     # HTTP router (mounts /clerk-webhook)
  clerk/webhook.ts            # Clerk → Convex user/org sync (Svix-verified)
  lib/auth.ts                 # Shared auth helpers for queries/mutations
  users.ts, orgs.ts           # Public queries/mutations
  _generated/                 # Committed so CI type-checks without running `convex dev`
```

## Path aliases

- `@/*` → `./src/*`
- `@/convex/*` → `./convex/*`

## Environment variables

Set in `.env.local` for dev, in the Vercel + Convex dashboards for deploys. See `.env.example`.

| Var | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | client | Written by `convex dev`; points the frontend at your deployment |
| `CONVEX_DEPLOY_KEY` | Vercel build only | From Convex dashboard → Settings → Deploy Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | client | From Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | server | From Clerk dashboard → API Keys |
| `CLERK_JWT_ISSUER_DOMAIN` | server + Convex | Clerk Frontend API URL / issuer URL from the matching Clerk instance's Convex integration or API keys page. **Also set this in the Convex dashboard env vars.** |

`src/env.ts` validates these at build/dev start via `@t3-oss/env-nextjs`; missing or malformed values fail fast.

## Auth flow

1. Clerk handles sign-in/sign-up under `src/app/(auth)/`.
2. `src/proxy.ts` (Clerk middleware) protects everything outside `/sign-in` and `/sign-up`.
3. `ConvexProviderWithClerk` passes the Clerk JWT to Convex; Convex verifies it against `CLERK_JWT_ISSUER_DOMAIN`.
4. `<UserBootstrap />` runs `useStoreUserEffect` on mount to upsert the signed-in user into the Convex `users` table.
5. Clerk webhooks hit `convex/clerk/webhook.ts` via the Convex HTTP router to keep `users` / `orgs` / `memberships` in sync server-side.

## Tests

Vitest runs with `jsdom` and `@testing-library/react`. Setup in `vitest.setup.ts`, config in `vitest.config.ts`. Put tests next to the code (`foo.ts` + `foo.test.ts`).

## Internal docs

Long-form internal documentation lives in `docs/`:

- [`docs/DESIGN.md`](docs/DESIGN.md) — canonical design-system guide for tokens, primitives, patterns, and UI composition.
- [`docs/environment-and-onboarding.md`](docs/environment-and-onboarding.md) — plan for dev/prod environment separation, webhook mirroring, and Dave's PR-based visual contribution workflow.
- [`docs/staff-admin.md`](docs/staff-admin.md) — Buzz staff admin setup, Clerk public metadata, session token claim contract, and authorization rules.
- [`docs/design-system-reference.md`](docs/design-system-reference.md) — legacy token reference retained for historical context; superseded by `docs/DESIGN.md`.
- [`docs/first-convex-feature.html`](docs/first-convex-feature.html) — walkthrough / tutorial.

## Notes

- Use Node 22 LTS or higher.
- `convex/_generated/` is committed so CI type checks work without running `convex dev`.
- Vercel Production deploys Convex functions before the Next build. Vercel Preview builds the frontend only and points at the cloud development Convex deployment.
