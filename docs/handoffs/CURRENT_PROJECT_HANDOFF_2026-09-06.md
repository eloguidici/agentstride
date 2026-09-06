# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/opentelemetry-proof`** (Track D)  
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
| D OpenTelemetry proof | **this branch** — ADR 0012 / example 19 |
| E Human approval | **next after merge** |
| F–I | pending |

Plan: `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

---

## 2. This branch

- `examples/19-opentelemetry-tracing` — AgentEvent → OTel spans
- Privacy defaults (no prompts/tool payloads)
- Nested spans via `parentRunId`
- Core untouched by OTel

```bash
npm test -w @agentstride/example-opentelemetry-tracing
npm start -w @agentstride/example-opentelemetry-tracing
```

---

## 3. Next after merge

`feature/human-approval` — Track E
