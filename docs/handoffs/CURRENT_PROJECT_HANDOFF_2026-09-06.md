# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/evaluation-harness`** (Track A)  
Repository visibility: **private**

Do not develop feature work directly on `main`.  
Do not make the repository public or publish npm packages unless explicitly requested.

---

## 0. Continuity

**The repository is the shared memory.**

---

## 1. Completed on this branch (Track A)

Evaluation harness (production validation plan Track A):

- `evals/` private workspace `@agentstride/evals-internal`
- 22 enterprise-support cases + deterministic scripted runner + scorers
- Baseline: `evals/results/baseline-enterprise-support.json` (22/22)
- Research: `docs/research/evaluation-harness.md`
- Example 17: optional `onSecurityEvent` for nested tool observation
- **Core unchanged**

Commands:

```bash
npm test -w @agentstride/evals-internal
npm run eval:enterprise-support
```

Plan source of truth:

`docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

---

## 2. Next track after merge

**Track B — Nested cancellation across `asAgentTool`**

Branch suggestion: `feature/nested-cancellation`

Known gap: outer `AbortSignal` does not automatically become `run({ signal })` for nested agents.

Do not skip to workflows / A2A / new providers.

---

## 3. Narrative rule

Capture problem → hypothesis → evidence → decision → rejected → result → next question in the development log / research notes during work (not after the fact).

---

## 4. Quality gate

```bash
npm run build
npm run typecheck
npm run test
npm run publish:check
npm run eval:enterprise-support
```
