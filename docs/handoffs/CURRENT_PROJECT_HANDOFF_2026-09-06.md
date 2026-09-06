# AgentStride - Current Handoff (2026-09-06)

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/alarm-triage`**  
HEAD: see `git rev-parse HEAD` on the active branch  
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

**Post-pause private slice:** Velum Grid alarm triage on `feature/alarm-triage` (example 23 + `evals/alarm-triage`).

Plan: `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`  
Narrative index: `docs/narrative/story-index.md`  
Research: `docs/research/alarm-triage.md`

---

## Pause (H/I)

Tracks H–I still need an owner decision (API freeze / public story / publish). Meanwhile the recommended path is more private, near-real use cases — current work is **Velum Grid** alarm triage.

Do **not** invent workflow/policy engines or publish without that decision.

---

## Useful commands

```bash
npm test -w @agentstride/core
npm test -w @agentstride/evals-internal
npm run eval:enterprise-support
npm run eval:human-approval
npm run eval:alarm-triage
npm test -w @agentstride/example-alarm-triage
npm start -w @agentstride/example-alarm-triage
```
