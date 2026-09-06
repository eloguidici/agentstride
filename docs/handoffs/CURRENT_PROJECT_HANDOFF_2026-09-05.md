# AgentStride - Current Handoff (2026-09-05)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Current working branch: `feature/project-foundation`  
Default branch: `main`  
Repository visibility: **private** (still)

Do not work directly on `main`.
Do not make the repository public unless explicitly requested.

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

A developer should be able to move from ChatGPT to Codex to Cursor and back without reconstructing the project from chat history.

---

## 1. What is done

All 14 plan phases have an incubation implementation:

| Phase | Status | Notes |
| --- | --- | --- |
| 1 Typed tools/schemas | Done | ADR 0005 |
| 2 Structured output | Done | ADR 0006 |
| 3 AgentRun/events | Done | ADR 0007 |
| 4 Hooks/guards | Done | ADR 0008 |
| 5 OpenAI provider | Done | `@agentstride/openai` (fetch / OpenRouter-compatible) |
| 6 Examples | Done | under `examples/` including live OpenRouter slices |
| 7 RAG | Done | `@agentstride/rag` |
| 8 MCP | Minimal done | bridge only, not full MCP client |
| 9 Memory | Done | core interface + `@agentstride/memory` |
| 10 NestJS | Minimal done | `@agentstride/nestjs` |
| 11 Local multi-agent | Done | `AgentLike`, receptionist examples |
| 12 A2A | Explored | research + remote AgentLike sketch |
| 13 Migration | Started | `@agentstride/migrate` helpers |
| 14 Public release prep | Prepared | CI/license/docs; **not published** |

Live OpenRouter examples verified:

- `08-live-tool`
- `09-live-structured`
- `10-live-receptionist`

---

## 2. Packages

- `@agentstride/core`
- `@agentstride/openai`
- `@agentstride/rag`
- `@agentstride/mcp`
- `@agentstride/memory`
- `@agentstride/nestjs`
- `@agentstride/a2a`
- `@agentstride/migrate`

---

## 3. Core API highlights

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
});
```

`result` is an `AgentRun` (`id`, `status`, `text`, optional `output`, `events`, timing).

Delegation:

```ts
asAgentTool(otherAgent, { name, description })
```

---

## 4. Next useful work

Prefer one of these focused follow-ups:

1. open/merge PR to `main` (branch already pushed);
2. deepen Nest app (auth/context middleware, more tools);
3. harden CI and package publish readiness;
4. only then consider public release.

Recently completed:

- owned MCP demo server + `connectMcpStdio` client;
- live MCP example with OpenRouter;
- real NestJS mini-app at `examples/12-nestjs-app`;
- measured migration proof (`migration-shared`, examples 13/14/15).

Avoid growing core unless a use case forces it.

---

## 5. Quality snapshot

- workspace typecheck/test passed in recent sessions;
- live OpenRouter tool, structured output and receptionist examples completed successfully;
- repository remains private;
- no secrets should be committed (`.env` is gitignored).

---

## 6. Read order for the next tool

1. this handoff;
2. `docs/IMPLEMENTATION_PLAN.md`;
3. `docs/development-log.md`;
4. ADRs in `docs/decisions/`;
5. `packages/core/src/`;
6. optional package you need to extend.

Branch rules:

- work on `feature/project-foundation`;
- do not commit feature work directly to `main`;
- do not make the repository public yet.

Before ending a session, apply the multi-tool continuity rule from section 0.
