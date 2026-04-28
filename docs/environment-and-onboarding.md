# Environment Split and Contributor Onboarding

This is the working plan for separating development and production, then onboarding non-dev contributors to make visual changes through pull requests.

## Goals

- Production uses production Vercel, production Clerk, and production Convex only.
- Development means a hosted Convex cloud development deployment, development Clerk, and local or Vercel Preview frontend only.
- Clerk webhooks exist separately for each environment.
- ElevenLabs uses separate agents/configuration per environment, with each agent pointing at the matching Convex webhook.
- Secrets are scoped to the correct environment and marked sensitive where the platform supports it.
- Non-dev contributors can run the app locally and submit visual changes through PRs without touching backend, auth, webhook, or deployment code.

## Phase 1: Inventory Current State

Before changing anything, make a simple table of the values currently configured in each dashboard. Do not paste secret values into docs or issues; record only the environment, variable name, and whether it exists.

| Platform | Production | Preview / Dev | Notes |
|---|---|---|---|
| Vercel env vars | Audit | Audit | Check Production, Preview, and Development scopes. |
| Clerk instance | Audit | Audit | Production keys should use `pk_live_` / `sk_live_`; development keys should use `pk_test_` / `sk_test_`. |
| Convex deployment | Audit | Audit | Confirm which deployment URL each Vercel environment points at. |
| Clerk webhooks | Audit | Audit | Each environment should have its own endpoint URL and signing secret. |
| ElevenLabs agents/webhooks | Audit | Audit | Each environment should have its own agent/config pointing at the matching webhook URL and signing secret. |

## Phase 2: Set the Target Matrix

Use this as the intended end state.

| Runtime | Vercel scope | Clerk | Convex | Webhooks |
|---|---|---|---|---|
| Production | Production | Production instance | Production deployment | Production Clerk + production ElevenLabs agent endpoints and secrets |
| Development | Local `.env.local` or Vercel Preview | Development instance | Hosted cloud development deployment | Dev Clerk + dev ElevenLabs agent endpoints and secrets |
| Local-only fallback | Local `.env.local` | Development instance | Local Convex deployment | Usually none unless using a tunnel |

Convex preview deployments are intentionally out of scope for now. Vercel Preview branches should be usable app previews that point at the shared cloud development Convex database.

## Phase 3: Lock Down Environment Variables

Recommended Vercel variables:

| Variable | Production | Preview / Dev | Sensitive? |
|---|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Prod Convex URL | Cloud dev Convex URL | No, public client value |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | `pk_test_...` | No, public client value |
| `CLERK_SECRET_KEY` | `sk_live_...` | `sk_test_...` | Yes |
| `CLERK_JWT_ISSUER_DOMAIN` | Prod Clerk issuer | Dev Clerk issuer | No secret, but environment-specific |
| `CONVEX_DEPLOY_KEY` | Prod Convex deploy key | Leave unset for now | Yes |

Convex deployment variables are configured separately from Vercel:

| Variable | Production Convex | Dev Convex | Sensitive? |
|---|---|---|---|
| `CLERK_JWT_ISSUER_DOMAIN` | Prod Clerk issuer | Dev Clerk issuer | No secret, but environment-specific |
| `CLERK_WEBHOOK_SECRET` | Prod Clerk webhook secret | Dev Clerk webhook secret | Yes |
| `ELEVENLABS_WEBHOOK_SECRET` | Prod ElevenLabs secret | Dev ElevenLabs secret | Yes |
| `ANTHROPIC_API_KEY` | Prod key if needed | Dev key if needed | Yes |
| `APP_ENVIRONMENT` | `production` | `development` | No secret; debug/audit label |

Notes:

- Vercel sensitive env vars are currently supported for Preview and Production, not Development. For local development, keep `.env.local` uncommitted.
- If a value was copied between production and development, rotate it.
- Never reuse webhook signing secrets between production and development.
- `.env.example` should keep variable names and comments only. Do not add real values.
- Vercel Preview should not have `CONVEX_DEPLOY_KEY` while previews are pointed at the shared cloud development Convex database.
- `vercel.json` should deploy Convex only for production builds. The expected build command is:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "if [ \"$VERCEL_ENV\" = \"production\" ]; then pnpm dlx convex deploy --cmd 'pnpm build'; else pnpm build; fi"
}
```

## Phase 4: Webhook Separation

Clerk:

- Create one webhook endpoint for production.
- Create one webhook endpoint for development or preview.
- Store each endpoint's signing secret on the matching Convex deployment.
- Confirm events from production Clerk cannot write into the dev Convex deployment, and dev Clerk cannot write into production Convex.
- Consider adding metadata fields to synced `users` and `orgs`, such as `sourceEnvironment` and `sourceClerkIssuer`, so dashboard data clearly shows whether a record came from Clerk development or production. These fields should be derived server-side and treated as debugging/audit metadata, not authorization inputs.

ElevenLabs:

- Use separate ElevenLabs agents/configuration for production and development.
- Point the production agent's post-call webhook at the production Convex `/elevenlabs-webhook` URL.
- Point the development agent's post-call webhook at the development cloud Convex `/elevenlabs-webhook` URL.
- Store each signing secret on the matching Convex deployment.
- Send a test event for each environment and verify it lands in the expected database.

## Phase 5: Dave's Local Setup

Dave should only receive development credentials.

Install once:

```bash
corepack enable
pnpm install
```

Run locally:

```bash
pnpm exec convex dev
pnpm dev
```

Then open:

```txt
http://localhost:3000
```

If `pnpm exec convex dev` writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local`, keep that file local and do not commit it.

For this project, "dev" should mean a hosted Convex cloud development deployment by default. Local Convex deployments are useful as a fallback, but they should not be the normal shared development path.

## Dave's PR Workflow

1. Start from latest `main`.
2. Create a branch named like `dave/homepage-spacing`.
3. Run the app locally.
4. Make visual-only changes.
5. Check desktop and mobile widths.
6. Run `pnpm check` before pushing if possible.
7. Commit with a short plain-English message.
8. Push the branch and open a PR into `main`.
9. Include before/after screenshots.
10. Request review from Matt.

Dave should not merge his own PRs unless explicitly told to.

## Files Dave Can Usually Touch

- `src/app/**` page and route UI files
- `src/components/**` UI and feature components
- `src/app/globals.css` only for small token or styling changes approved in review
- `docs/**` for notes and screenshots

## Files Dave Should Not Touch Without Pairing

- `.env*`
- `convex/**`
- `src/env.ts`
- `src/proxy.ts`
- `next.config.*`
- `vercel.json`
- `package.json`
- `pnpm-lock.yaml`
- Clerk, Convex, Vercel, or ElevenLabs dashboard settings

## Claude Guardrails For Dave

Use this instruction at the top of Claude tasks:

```txt
You are helping me make visual-only changes in a Next.js app.
Stay within the page, component, and style files related to this request.
Do not edit auth, Convex, webhook, environment, package, generated, or deployment files.
Before changing files, tell me which files you plan to edit.
After changing files, summarize exactly what changed and what I should test.
```

Good Claude requests:

- "Find the component that renders this heading."
- "Adjust spacing on this page only."
- "Make this section match the screenshot."
- "Change this button text."
- "Explain this React component in plain English."

Stop and ask Matt first if Claude suggests changing auth, Convex, webhooks, env vars, deployment config, dependencies, generated files, or the lockfile.

## First Work Session Checklist

Use this order when you pick this back up:

1. Audit current Vercel, Clerk, Convex, and webhook configuration.
2. Configure Vercel Preview branches to point at dev Clerk and the cloud dev Convex database.
3. Create or confirm the hosted cloud dev Convex deployment.
4. Configure dev Clerk keys and issuer.
5. Configure production Vercel env vars and mark secrets sensitive.
6. Configure Preview Vercel env vars with dev Clerk and dev Convex values, and mark secrets sensitive where supported.
7. Configure Convex env vars for production and dev.
8. Mirror Clerk webhooks.
9. Configure separate production and development ElevenLabs agents/webhooks.
10. Run smoke tests in production, preview, and local.
11. Walk Dave through the local setup and first PR.
