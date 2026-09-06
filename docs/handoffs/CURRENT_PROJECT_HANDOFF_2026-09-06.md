# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/nested-cancellation`** (Track B)  
Repository visibility: **private**

Do not develop feature work directly on `main`.  
Do not make the repository public or publish npm packages unless explicitly requested.

---

## 0. Continuity

**The repository is the shared memory.**

---

## 1. Completed

Already on `main`:

- foundation through enterprise Nest HTTP;
- Track A evaluation harness (`evals/`, 22 cases, baseline).

On this branch (Track B):

- `asAgentTool` forwards `context.abortSignal` → nested `run({ signal })`
- ADR 0010 + research note `docs/research/nested-cancellation.md`
- Core tests: `packages/core/test/nested-cancellation.test.mjs`
- No cancellation bus; no new public AgentLike options

Plan: `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

---

## 2. Next track after merge

**Track C — Parent/child run causality**

Branch suggestion: `feature/run-causality`

Likely minimum: `parentRunId` for local `asAgentTool` delegation.

Do not skip to workflows / full A2A / new providers.

---

## 3. Commands

```bash
npm test -w @agentstride/core
npm test -w @agentstride/evals-internal
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
