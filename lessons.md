# lessons.md

A running log of things agents have missed during reviews or implementations — and the check that would have caught them.

Read this file during every PR self-review. Append to it whenever a review misses something, so future reviews catch the same class of mistake.

---

## Format

```
## YYYY-MM-DD — [short title]
**What happened:** the specific thing that slipped through
**Root cause:** why the review missed it
**Check to add:** the concrete step future reviews should run so this class of miss is caught next time
```

Keep entries short. Lead with the check, not the war story.

---

## Standing review checklist (derived from the entries below)

Before saying "ship it" on any PR, work through these in order:

1. **Look at the PR, not just the code.** Run `gh pr checks <N>` and `gh pr view <N> --json mergeStateStatus,statusCheckRollup`. Any failing required check is a blocker, not a warning. Investigate before reviewing the diff.
2. **Trace every `process.env.*` read.** For each, ask: does this variable exist in every environment this code executes in (local dev, CI, preview deploy, production)? If the answer is "not sure," that's the finding.
3. **Don't trust "builds locally" as evidence CI will pass.** Local has `.env.local`, a warm node_modules, and different Node versions. Preview/prod deploys don't. Check the preview URL actually loads.
4. **Review the PR as if someone else wrote it.** Recency bias makes self-written code feel safe. Read it cold. Assume nothing.
5. **Check acceptance criteria literally, not impressionistically.** Every bullet point in the ticket → find the proof it's met (a file, a passing test, a command output). "Looks done" is not proof.
6. **Scan for secrets before push.** `git diff --cached | grep -iE "(key|secret|token|password)="` on staged changes, and spot-check any `.env`-related files.

---

## Entries

## 2026-04-19 — Missed failing Vercel preview build in PR #1 review

**What happened:** Self-review of PR #1 (Epic 1 scaffold) concluded "ship it" while the Vercel preview deploy was red. The build failed with `Error: No address provided to ConvexReactClient.` during SSG of `/_not-found`, because `NEXT_PUBLIC_CONVEX_URL` isn't set on Vercel yet. The failing check was visible on the PR page from the moment the PR was opened.

**Root cause:** Review only inspected code on disk. Never ran `gh pr checks` or opened the PR page. Treated "build passes locally" as sufficient evidence — ignoring that local has `.env.local` and Vercel doesn't. The specific code pattern (`new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)` at module scope) was flagged as "low severity" in the review despite being the exact code that crashed the build.

**Check to add:**
- Run `gh pr checks <N>` at the start of every review. Failing checks are the first thing to investigate.
- For every `process.env.NEXT_PUBLIC_*` or `process.env.*` read, trace it: which environments set it, which don't, and what happens in the "doesn't" case. Module-scope instantiation using an env var is especially sensitive — it runs at static-generation time, not just at browser runtime.
