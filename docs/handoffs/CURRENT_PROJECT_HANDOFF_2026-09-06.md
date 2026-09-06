# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default / consolidated branch: **`main`**  
Active feature branch (stabilize): **`feature/runtime-hardening`**  
Repository visibility: **private** (still)

Do not develop feature work directly on `main`.  
Do not make the repository public unless explicitly requested.  
Do not publish npm packages unless explicitly requested.

---

## 0. Multi-tool continuity rule

AgentStride is intentionally being developed across different AI-assisted development environments.

The project must be easy to continue from:

- ChatGPT;
- Codex;
- Cursor;
- or another coding assistant with repository access.

No tool should depend on private conversational context that is not also written into the repository.

**The repository is the shared memory.**

Before leaving a meaningful development session, the active tool should:

1. update `docs/development-log.md` with meaningful progress and decisions;
2. update or create an ADR if an architectural decision was made;
3. update `docs/IMPLEMENTATION_PLAN.md` if phases or priorities changed;
4. update this current handoff when the next starting point changes materially;
5. leave the working branch buildable/testable when practical;
6. commit changes in coherent units with useful messages.

---

## 1. Mode: stabilize (not build)

Foundation phases 1–14 are incubated and merged to `main` (PRs #1 and #2).

Current mode is **runtime hardening / stabilize**:

- fix design inconsistencies and edge cases;
- strengthen failure paths, timeout/cancellation, tests;
- keep optional packages decoupled;
- **do not** add large features, new packages, workflows, extra providers, or public publish.

---

## 2. What is done

| Phase | Status | Notes |
| --- | --- | --- |
| 1 Typed tools/schemas | Done | ADR 0005 |
| 2 Structured output | Done | ADR 0006 |
| 3 AgentRun/events | Done | ADR 0007 |
| 4 Hooks/guards | Done | ADR 0008 |
| 5 OpenAI provider | Done | `@agentstride/openai` (fetch / OpenRouter-compatible) |
| 6 Examples | Done | including live OpenRouter + Nest + orchestrator |
| 7 RAG | Done | `@agentstride/rag` |
| 8 MCP | Minimal done | stdio client + bridge; not a full MCP platform |
| 9 Memory | Done | core `Memory` + `@agentstride/memory` |
| 10 NestJS | Minimal done | `@agentstride/nestjs` + `examples/12-nestjs-app` |
| 11 Local multi-agent | Done | `AgentLike`, `asAgentTool`, receptionist + `16-orchestrator-n-agents` |
| 12 A2A | Explored | experimental remote `AgentLike` sketch only |
| 13 Migration | Done (measured) | `@agentstride/migrate` + examples 13–15 |
| 14 Public release prep | Prepared | CI green; **not published** |

---

## 3. Packages

- `@agentstride/core`
- `@agentstride/openai`
- `@agentstride/rag`
- `@agentstride/mcp`
- `@agentstride/memory`
- `@agentstride/nestjs`
- `@agentstride/a2a` (experimental)
- `@agentstride/migrate`

---

## 4. Core API highlights

```ts
const agent = createAgent({
  model,
  tools,
  hooks,
  onEvent,
  maxSteps,
  timeoutMs,
  allowedTools,
  deniedTools,
  memory,
});

const result = await agent.run("...", {
  context,
  output: schema,
  threadId,
  memory,
  signal, // AbortSignal (hardening)
});
```

On failure, `run()` still throws; the thrown error may include `error.agentRun` with partial progress (steps, messages, events, timing).

Delegation:

```ts
asAgentTool(otherAgent, { name, description })
```

---

## 5. Next useful work (after this harden branch)

1. Finish / merge `feature/runtime-hardening` when CI is green.
2. Only then consider product use or publish prep — not new core features by default.
3. Deepen A2A only if a real remote-agent use case appears.
4. npm publish / public repo only when explicitly requested.

---

## 6. Quality snapshot

- `main` includes foundation + CI fix (build core first; types from `src/` during incubation).
- Repo remains private; `.env` is gitignored.
- Live OpenRouter examples exist; Nest HTTP tests use a fake agent.

---

## 7. Read order for the next tool

1. this handoff;
2. `docs/IMPLEMENTATION_PLAN.md`;
3. `docs/development-log.md`;
4. ADRs in `docs/decisions/` (including any 0009+ from hardening);
5. `packages/core/src/`;
6. optional package you need to extend.

Branch rules:

- default work branch for this stage: `feature/runtime-hardening` (or a newer feature branch from `main`);
- do not commit feature work directly to `main`;
- do not make the repository public yet.

Before ending a session, apply the multi-tool continuity rule from section 0.
