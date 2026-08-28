# Handoff — adversarial review 3

## Outcome

Review 3 passed with zero findings. No product code was modified. The only
changes are this handoff and `.factory/review-3.md`.

Live target: <https://doodle-to-game.sociobot.in>

## What was verified

- Cold root at 390 × 844 and 1440 × 900 clearly states the job, audience, and
  sample-data action before scrolling; there were no console errors.
- `/demo` immediately shows the playable seeded game, banner, reset, and exit.
  Real project/license isolation is covered by a clean-state claim and source
  inspection.
- Live offline demo reload and play succeeded after service-worker activation.
- All 14 manifest claim commands passed from clean clone
  `/tmp/doodle-review3-5FzCpf/repo`; see `/tmp/doodle-review3-claims.log`.
- `npm test` passed locally: 14 unit tests, production build, and 57 browser
  tests with five documented duplicate-flow skips.
- Root, demo, legal routes, 404, metadata, focus/history behavior, sitemap,
  robots, manifest, worker, checkout redirect, and discovered links passed.
- A fresh rate-limit check observed 30 accepted verification requests followed
  by HTTP 429 with `Retry-After: 4`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

Run each command in `.factory/claims.json` from a clean clone for claim-level
evidence. Publish `dist/` as the static site root.

## Known gaps

None found in this review. A real-money checkout was not submitted; its
redirect and hosted product page were verified without charging a card.
