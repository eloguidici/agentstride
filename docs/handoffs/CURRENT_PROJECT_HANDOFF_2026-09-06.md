# AgentStride - Current Handoff (2026-09-06)

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **none**  
HEAD: see `git rev-parse HEAD` on latest `main`  
Repository visibility: **private**

Do not develop on `main`. Do not publish npm / make public unless explicitly requested.

---

## Production validation progress

| Track | Status |
| --- | --- |
| A Evaluation harness | `main` — PR #8 |
| B Nested cancellation | `main` — PR #9 / ADR 0010 |
| C Run causality | `main` — PR #10 / ADR 0011 |
| D OpenTelemetry proof | `main` — PR #12 / ADR 0012 |
| E Human approval | `main` — PR #14 / example 20 |
| F Idempotency | `main` — PR #15 / example 21 |
| G Usage accounting | `main` — PR #16 / example 22 |
| H Pre-1.0 API | **paused — owner decision** |
| I Narrative/release | **paused — owner decision** |

Plan: `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`  
Narrative index: `docs/narrative/story-index.md`

---

## Pause

**The project should pause here for an owner decision.**

Tracks H–I change product posture (API freeze, public story, publish). Recommended options:

1. Stay private; run more real use cases before freeze.
2. Freeze current surface as pre-1.0 and polish docs only.
3. Explicitly approve making the repo public and/or npm publish.

Do **not** invent workflow/policy engines or publish without that decision.

---

## Useful commands

```bash
npm test -w @agentstride/core
npm test -w @agentstride/evals-internal
npm run eval:enterprise-support
npm run eval:human-approval
npm test -w @agentstride/example-human-approval
npm test -w @agentstride/example-side-effect-idempotency
npm test -w @agentstride/example-usage-accounting
```
