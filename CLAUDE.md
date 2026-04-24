@AGENTS.md

## Stack at a glance

- **Framework:** Next.js 16 App Router with Turbopack. Middleware file is `src/proxy.ts` (Next 16 rename of `middleware.ts`).
- **Language:** TypeScript 6 with `@typescript/native-preview`. Typecheck via `pnpm typecheck` (`tsgo --noEmit`).
- **UI:** React 19, Tailwind v4 (config in `src/app/globals.css` — no `tailwind.config.js`), Radix Primitives (`radix-ui` package).
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
- `src/components/ui/` — low-level primitives. `src/components/composed/` — composed patterns. `src/components/features/` — feature-specific UI.
- `src/server/convex.ts` — singleton `ConvexReactClient` for the browser.
- `convex/_generated/` is **committed** (so CI type-checks without running `convex dev`). Don't gitignore it.
- `docs/design-system-reference.md` is the source of truth for tokens + component composition. Consult it before inventing new UI primitives.
- `docs/` holds internal long-form documentation (design reference, tutorials). Not shipped — keep agent-facing rules in this file or `AGENTS.md`.

## Convex

This project uses [Convex](https://convex.dev). **Always read `convex/_generated/ai/guidelines.md` first** when touching Convex code — those rules override training data.

Schema lives in `convex/schema.ts`: `users`, `orgs`, `memberships`. Auth helpers shared across queries/mutations are in `convex/lib/auth.ts`.

Convex agent skills can be installed with `npx convex ai-files install`.

## Deploy

- Vercel build command (from `vercel.json`): `pnpm dlx convex deploy --cmd 'pnpm build'` — Convex functions deploy before the Next build.
- `CONVEX_DEPLOY_KEY` is only needed on Vercel, not locally.
- `CLERK_JWT_ISSUER_DOMAIN` must be set in **both** the Vercel env and the Convex dashboard env.
