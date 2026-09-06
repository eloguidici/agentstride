# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/run-causality`** (Track C)  
Repository visibility: **private**

Do not develop feature work directly on `main`.  
Do not make the repository public or publish npm packages unless explicitly requested.

---

## 0. Continuity

**The repository is the shared memory.**

---

## 1. Completed

On `main`:

- Track A evaluation harness
- Track B nested cancellation (ADR 0010)

On this branch (Track C):

- `parentRunId` on `AgentRun` / `AgentRunOptions` / `run:start`
- reserved `context.agentRunId`; `asAgentTool` sets parent automatically
- ADR 0011 + `docs/research/run-causality.md`
- Core + example 17 integration coverage

Plan: `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

---

## 2. Next track after merge

**Track D — OpenTelemetry proof**

Branch suggestion: `feature/opentelemetry-proof`

Example/proof only — do not make OTel a core dependency.

---

## 3. Commands

```bash
npm test -w @agentstride/core
npm test -w @agentstride/example-enterprise-support-agent
```

---

## 4. Quality gate

```bash
npm run build
npm run typecheck
npm run test
npm run publish:check
```
