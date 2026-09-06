# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`** @ `5f8553a`  
Active feature branch: **none** — next is Track D  
Repository visibility: **private**

Do not develop feature work directly on `main`.  
Do not make the repository public or publish npm packages unless explicitly requested.

---

## 0. Continuity

**The repository is the shared memory.**

---

## 1. Production validation progress

| Track | Status |
| --- | --- |
| A Evaluation harness | `main` — PR #8 |
| B Nested cancellation | `main` — PR #9 / ADR 0010 |
| C Run causality | `main` — PR #10 / ADR 0011 |
| D OpenTelemetry proof | **next** |
| E Human approval | pending |
| F Idempotent side-effects | pending |
| G Usage accounting | pending |
| H Pre-1.0 API | pending |
| I Narrative/release | pending |

Plan: `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

---

## 2. Next branch

`feature/opentelemetry-proof`

Example/proof only — **do not** make OpenTelemetry a core dependency.

---

## 3. Commands

```bash
npm test -w @agentstride/core
npm test -w @agentstride/evals-internal
npm run eval:enterprise-support
```
