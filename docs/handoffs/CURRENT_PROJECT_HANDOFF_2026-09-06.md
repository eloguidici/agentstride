# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default / consolidated branch: **`main`**  
Active feature branch: **`feature/real-world-validation`**  
Repository visibility: **private** (still)

Do not develop feature work directly on `main`.  
Do not make the repository public unless explicitly requested.  
Do not publish npm packages unless explicitly requested.

---

## 0. Multi-tool continuity rule

**The repository is the shared memory.** Update development-log, ADRs, this handoff, and keep the branch buildable before ending a session.

---

## 1. Mode: real-world validation

Foundation + runtime hardening are on `main` (through PR #3 / `9c17481`).

Current mode validates that existing primitives solve a small **enterprise** case without growing core.

---

## 2. Vertical slice status

Example: `examples/17-enterprise-support-agent`

- Domain separated from AgentStride
- ReceptionistAgent → SecurityAgent (`asAgentTool`) + customer/case tools + in-memory RAG
- Structured output, context/roles, event trace, AbortSignal demo tool
- Offline tests (domain / behavior / integration / cancellation)
- Optional `start:live` (not CI)
- Memory / Nest / MCP / migrate / A2A not used (documented as unused on purpose)
- **No core code changes** in this branch

### Findings (short)

- API was enough for the slice.
- Nested `asAgentTool` does not forward `signal` as `run` option (context only) — document; change only with product need.
- Lookup misses should return data, not always throw, if you want structured decisions.

---

## 3. Phases (unchanged)

Phases 1–14 remain as incubated on `main`. See prior handoff history and `docs/IMPLEMENTATION_PLAN.md`.

---

## 4. Next useful work (evidence-based)

1. Merge `feature/real-world-validation` when CI is green.
2. Optional: expose this slice behind Nest HTTP (compose with example 12 patterns).
3. Optional: `asAgentTool` signal forwarding **only if** cancel must reach nested models.
4. Avoid new packages/features until another real use case forces them.
5. Publish/public only when explicitly requested.

---

## 5. Commands

```bash
npm test -w @agentstride/example-enterprise-support-agent
npm start -w @agentstride/example-enterprise-support-agent
npm run start:live -w @agentstride/example-enterprise-support-agent
```

---

## 6. Read order

1. this handoff;
2. `examples/17-enterprise-support-agent/README.md`;
3. `docs/development-log.md` (real-world validation entry);
4. `docs/research/api-review-pre-1.0.md`;
5. `packages/core/src/` only if a change is evidenced.
