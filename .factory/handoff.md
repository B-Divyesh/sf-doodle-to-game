# Handoff — adversarial first-read review 1

## Status

**FAIL.** Review evidence is in [review-1.md](review-1.md). No product source,
configuration, or deployment setting was changed; this handoff and the review
are the only intended repository changes.

## What was checked

- Cold live root loads in fresh Chromium contexts at 390 × 844 and 1440 × 900.
  The cold requests had no console errors or failed resources.
- /demo, ?demo=1, legal routes, a missing route, robots, sitemap, metadata,
  headers, navigation focus, visible links, and the actual 390 px visual
  treatment were checked against the factory review contract.
- npm ci completed successfully: 57 packages installed and the audit reported
  zero vulnerabilities. .factory/claims.json and all @claim: test tags are
  absent, so there were no listed claim-test commands to run.

## Blocking gaps

1. The first screen does not name the adult-and-child audience and uses the
   product name as H1 instead of the job headline.
2. There is no one-click sample-data demo, banner, reset action, isolated
   storage namespace, or demo documentation. /demo and ?demo=1 are normal
   empty workspaces.
3. There is no claims manifest or sandbox claim evidence for the live privacy,
   offline, time, save, export, and paid-feature promises.

## Next steps

Implement the three blockers, then run the four re-checks at the end of
review-1.md from a clean clone. The review also records required metadata,
404/robots/sitemap, route-focus, footer, and copy repairs.
