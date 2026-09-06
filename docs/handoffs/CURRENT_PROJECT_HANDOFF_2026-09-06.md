# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`** @ `c92a7c0`  
Planning branch: **`docs/production-validation-plan`**  
Repository visibility: **private**

Do not develop feature work directly on `main`.  
Do not make the repository public or publish npm packages unless explicitly requested.

---

## 0. Continuity

**The repository is the shared memory.**

AgentStride may be continued from ChatGPT, Codex or Cursor. The next tool must be able to continue from repository state alone.

---

## 1. Completed tracks

Already merged to `main`:

- foundation;
- runtime hardening;
- schemas / structured output;
- AgentRun/events;
- hooks/guards;
- OpenAI-compatible adapter;
- RAG/MCP/memory/Nest incubation packages;
- local delegation / ReceptionistAgent;
- migration proof;
- experimental remote AgentLike / A2A research;
- enterprise support vertical slice (`examples/17`);
- Nest HTTP surface (`examples/18`).

The enterprise slice validated that domain logic can remain free of AgentStride imports and that this realistic backend scenario did not require core growth.

---

## 2. Next-stage plan

The next development track is defined in:

`docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

Read it before starting new work.

Strategy:

> production validation, not feature expansion.

Recommended order:

1. evaluation harness;
2. nested cancellation;
3. parent/child run causality;
4. OpenTelemetry proof;
5. human approval pattern;
6. idempotent side-effect tools;
7. usage accounting;
8. pre-1.0 API stabilization;
9. narrative/release decision.

Do not skip directly to workflows, full A2A, browser, voice, scheduler or additional providers.

---

## 3. Narrative requirement

Documentation is part of the work.

Every track must capture:

- problem;
- hypothesis;
- evidence;
- decision;
- rejected alternatives;
- result;
- next question.

This evidence is intended to support future technical notes, GitHub documentation, LinkedIn posts and interviews.

Do not reconstruct a story later from memory.

---

## 4. First recommended implementation branch

After this planning branch is merged, start from latest `main`:

`feature/evaluation-harness`

Start Track A from the production validation plan.

Core should remain frozen unless evaluation evidence forces a change.

---

## 5. End-of-session rule

Before handing to another tool:

- run relevant build/typecheck/tests;
- update development log;
- update ADRs;
- update plan status;
- update this handoff;
- capture narrative evidence;
- commit coherent work.

The next tool may not have access to the previous conversation.
