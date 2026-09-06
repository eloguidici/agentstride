# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **none** — next is Track E  
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
| D OpenTelemetry proof | `main` — PR #12 / ADR 0012 / example 19 |
| E Human approval | **next** |
| F Idempotent side-effects | pending |
| G Usage accounting | pending |
| H Pre-1.0 API | pending |
| I Narrative/release | pending |

Plan: `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

---

## 2. Next branch

`feature/human-approval`

Validate propose → external approve → domain action **without** a workflow/policy engine.

---

## 3. Commands

```bash
npm test -w @agentstride/example-opentelemetry-tracing
npm test -w @agentstride/evals-internal
npm test -w @agentstride/core
```
