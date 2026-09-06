# Validation battery results

Date: 2026-09-06  
Commit context: `chore/validation-battery`  
Command: `npm run validate:battery`  
Duration: ~7.6 min (`2026-09-06T19:31:03Z` → `19:38:36Z`)  
Machine artifact: `docs/engineering/validation-battery.last.json` (gitignored)

## Verdict: **GREEN**

Estamos bien para el scope offline actual. No apareció falla en T0–T7.

Live providers (T8): **skipped** (sin `OPENROUTER_API_KEY` / `OPENAI_API_KEY`).

## Tier results

| Tier | Name | Result | Notes |
| --- | --- | --- | --- |
| T0 | engineering-gate | PASS | build ~51s, typecheck ~32s, publish:check OK (private warns) |
| T1 | core | PASS | 39/39 tests |
| T2 | production-patterns | PASS | OTel 4, approval 15, idempotency 6, usage 4 |
| T3 | verticals | PASS | enterprise 12+3 HTTP; alarm 12; change 8; export 6; nest 3 |
| T4 | evals | PASS | 5 suites, ~40 deterministic cases, failed=0 |
| T5 | monorepo-test | PASS | full `npm test` ~105s |
| T6 | offline-demos | PASS | alarm/change/export/approval starts + orchestrator smoke |
| T7 | package-dry-run | PASS | packed core + temp consumer run OK (~153s) |

## Analysis

### What this means
- Runtime + optional packages **compile and typecheck**.
- Production patterns (approval, idempotency, usage, OTel) **hold under tests**.
- Near-real verticals (enterprise + Velum Grid 23–26) **hold under tests**.
- Decision evals **do not regress** against baselines.
- Full workspace suite is green.
- Offline demos produce successful runs (fake models).
- `@agentstride/core` is packable and consumable locally without npm publish.

### Gaps / not proven here
- Live LLM quality (OpenRouter/OpenAI) — not run.
- GitHub Actions remote CI — minutes/billing constrained; local battery substitutes for this pass.
- Load/performance — out of scope.
- Public narrative drafts — still owner-gated; battery supports confidence, not publication.

### Recommendation
Safe to treat productization claims as **evidence-backed for offline/fake mode**. Before public launch, optionally run T8 live smoke once keys are available.

## Re-run

```bash
npm run validate:battery
```

Plan: `docs/engineering/VALIDATION_BATTERY.md`
