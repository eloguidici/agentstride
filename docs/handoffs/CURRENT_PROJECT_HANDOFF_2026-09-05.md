# AgentStride - Current Handoff (2026-09-05)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Current working branch: `feature/project-foundation`  
Default branch: `main`  
Repository visibility: private (for now)

Do not work directly on `main`.

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

Do not assume that the next tool has access to the previous conversation.

If something is important enough that the next tool needs to know it, put it in the repo.

---

## 1. What AgentStride is

AgentStride is a small TypeScript runtime for building AI agents without committing too early to a large framework.

The goal is **not** to compete by having more features than LangChain, Mastra or other agent frameworks.

The working philosophy is:

> Start with the smallest useful primitives. Add complexity only when the use case proves it is needed.

The project should remain:

- TypeScript-first;
- embeddable in normal backend applications;
- provider-agnostic at the core;
- portable;
- low-lock-in;
- easy to understand;
- explicit about trade-offs.

The eventual consumption model is expected to be npm packages such as:

```bash
npm install @agentstride/core
```

with optional packages later for providers and integrations.

---

## 2. Why this project exists

Many early agent projects fall into one of two extremes:

1. ad-hoc LLM calls that become difficult to maintain;
2. adopting a large framework before the problem is understood.

AgentStride is intended to sit in the middle.

It should allow teams to build real agents quickly while keeping business logic portable.

A key design constraint is:

> Tools, schemas, prompts and domain services should not become coupled to AgentStride-specific runtime objects.

If a project later needs durable workflows, complex state graphs, large-scale orchestration or another platform, moving to Mastra, LangGraph/LangChain or another runtime should be possible without rewriting the business layer.

This is not a promise that migration will always be automatic. It is a design direction.

---

## 3. Historical origin

AgentStride is influenced by an older enterprise multi-agent system built before this project.

That system included:

- `AutonomousAgent`;
- `AutonomousIAAgent`;
- `ReceptionistAgent`;
- `AgentEvent`;
- `MessageDto`;
- `ActionDto`;
- `TaskMemoryService`;
- request correlation;
- dynamic agent delegation;
- fan-out / fan-in;
- an RxJS event bus.

Useful ideas from that system:

- separate Agent and Tool concepts;
- allow dynamic delegation;
- correlate delegated work;
- do not require one agent to know another agent's implementation;
- treat orchestration as a first-class problem.

Things we explicitly do **not** want to copy:

- a global RxJS bus in core;
- runtime-specific message DTOs leaking into domain tools;
- weak typing at important boundaries;
- excessive infrastructure for simple agent calls;
- subscription lifecycle complexity;
- application-specific concerns mixed into the runtime;
- fragile fan-in/concurrency semantics.

Nostalgic references are allowed when they still make architectural sense.

Examples:

- `ReceptionistAgent` is a good future official example;
- `AgentEvent` may become an execution lifecycle / observability concept;
- `AutonomousAgent` belongs mainly in the origin story, not necessarily the public API.

See `docs/origins.md`.

---

## 4. Current architecture

The first working runtime slice exists.

Current public concepts:

- `Model`
- `Tool`
- `Agent`
- `AgentContext`
- `AgentMessage`
- `ToolCall`
- `ToolDefinition` (includes optional `parameters` JSON Schema)
- `AgentRunResult`
- `createAgent()`
- `defineTool({ inputSchema })`
- `ToolInputValidationError`
- Standard Schema helpers (`parseToolInput`, `getSchemaJsonSchema`)

Current execution loop:

```text
User
  |
  v
Agent
  |
  v
Model
  |
  +--> tool call? ---- no ---> final result
  |
 yes
  v
Tool
  |
  v
tool result
  |
  +-------------> Model
```

Core implementation:

- `packages/core/src/agent.ts`
- `packages/core/src/tool.ts`
- `packages/core/src/types.ts`
- `packages/core/src/index.ts`

The loop currently supports:

- system instructions;
- user input;
- multiple model steps;
- tool calls;
- runtime validation of tool input when `inputSchema` is present;
- passing tool output back to the model;
- execution context passed to tools;
- max-step protection;
- unknown-tool failure;
- final text result;
- message history returned with the run result.

---

## 5. Current tests

File:

`packages/core/test/agent.test.mjs`

Current behavior covered:

1. direct model response without tools;
2. tool execution and sending the result back to the model;
3. unknown tool failure;
4. max-step exhaustion;
5. JSON Schema derivation from Standard JSON Schema tools;
6. valid typed tool input;
7. invalid typed tool input rejected before `execute`;
8. tools without `inputSchema` remain unvalidated.

At the time of the last implementation pass:

```text
8 tests
8 passed
0 failed
```

Do not remove these behaviors while evolving the API.

---

## 6. Current example

`examples/01-tool-agent`

This intentionally uses a fake model.

That is deliberate.

The goal was to prove the runtime loop independently of OpenAI, Anthropic, Mastra, LangChain, AI SDK or another provider-specific dependency.

Do not replace this example with a provider-specific example. A real provider example should be added separately.

---

## 7. Accepted architectural decisions

Read all files in `docs/decisions/` before making structural changes.

Currently accepted:

### ADR 0001 - Keep the core small

The core should contain only primitives required for execution.

### ADR 0002 - Tools should be portable

Domain tools should conceptually follow:

```ts
execute(input, context)
```

They should not receive AgentStride message envelopes.

### ADR 0003 - No event bus in core

No RxJS/global event bus as the primary communication mechanism.

Execution events may exist later for tracing and observability.

### ADR 0004 - Provider-agnostic core

Core depends on a small `Model` contract.

Provider packages should translate SDK-specific messages and tool formats.

### ADR 0005 - Tool input schemas via Standard Schema

Tool inputs validate through Standard Schema V1.

When the schema also supports Standard JSON Schema V1, `ToolDefinition.parameters` is derived for provider adapters.

Zod is recommended for authoring, not required by core.

Tool output validation is deferred.

---

## 8. Use cases that drive the design

Features should be justified by one or more of these use cases.

### 1. Internal support agent

Question -> internal knowledge -> operational tools -> response / ticket.

Tests:

- tools;
- RAG;
- context;
- structured output;
- tracing;
- approval.

### 2. Document analysis

Document -> extraction / analysis -> validated structured result.

Tests:

- retrieval/files;
- structured output;
- validation;
- traceability.

### 3. Operational backend agent

Agent embedded in a normal backend and calling business APIs.

This is important. AgentStride is not primarily a chatbot product.

Tests:

- typed tools;
- context;
- permissions;
- approvals;
- error handling.

### 4. Coordinator with specialized agents

Coordinator delegates to specialists.

Prefer simple agent-as-capability / agent-as-tool ideas before introducing graphs or an event bus.

### 5. A project that grows

A small project later needs a bigger orchestration platform.

This tests portability and migration discipline.

---

## 9. Scope discipline

Before adding any feature, classify it as one of:

- core;
- optional package;
- later;
- explicitly out of scope.

### Core candidates

Only if justified:

- Agent;
- Model;
- Tool;
- Context;
- structured output;
- AgentRun;
- AgentEvent lifecycle;
- hooks;
- basic guards.

### Optional-package candidates

Likely:

- OpenAI provider;
- Anthropic/provider adapters later;
- RAG;
- MCP;
- memory adapters;
- NestJS;
- OpenTelemetry;
- A2A.

### Not for v1

Do not build these now:

- durable distributed workflow engine;
- visual workflow editor;
- scheduler;
- chat-channel product;
- hosting platform;
- agent marketplace;
- vector database;
- browser automation platform;
- voice platform;
- huge provider catalog.

If the core starts growing toward those areas, stop and reassess.

---

## 10. Current next step

Phase 1 (typed tools / schemas) is complete.

Continue from **Phase 2 - Structured output** in `docs/IMPLEMENTATION_PLAN.md`.

Desired direction:

```ts
const result = await agent.run("Analyze customer", {
  output: schema
});
```

Design notes already constrained by ADR 0005:

- reuse Standard Schema for validation/inference;
- keep provider-specific structured-output APIs inside adapters;
- do not couple callers to OpenAI/Anthropic SDK types.

After Phase 2, the plan order remains:

3. AgentRun / lifecycle events;
4. hooks and basic guards;
5. first real model provider adapter;
6. stronger examples;
7. optional RAG;
8. MCP;
9. memory;
10. NestJS;
11. local multi-agent / Receptionist;
12. A2A;
13. migration examples;
14. public-release preparation.

Do not jump directly to RAG/MCP/A2A before the core API is stable enough.

---

## 11. Implementation plan

The detailed plan lives in `docs/IMPLEMENTATION_PLAN.md`.

---

## 12. Development style

The repository should feel like it is being built by engineers, not generated as a documentation exercise.

Guidelines:

- avoid inflated README language;
- avoid generic marketing claims;
- explain concrete trade-offs;
- keep docs proportional to the decision;
- use examples to validate abstractions;
- do not add files only to make the repo look complete;
- avoid unnecessary comments that restate code;
- prefer small coherent commits by phase;
- update the development log when a meaningful decision is made;
- add an ADR when a decision would otherwise be difficult to reconstruct later.

We want the public history to be useful later for GitHub, LinkedIn and technical interviews.

---

## 13. Git / branch rules

Current work branch:

`feature/project-foundation`

Rules:

- do not commit feature work directly to `main`;
- keep `main` stable;
- make coherent commits by phase;
- run tests/typecheck/build before considering a phase finished;
- document decisions before or with the implementation that depends on them;
- do not make the repository public yet.

---

## 14. Public narrative we want to preserve

The story is not:

> I saw LangChain and built a smaller LangChain.

The stronger and more accurate story is:

> I had already built an enterprise multi-agent architecture with specialized agents, tools, routing, correlation and delegation. It worked, but it also exposed where accidental complexity appears. AgentStride is an attempt to keep the ideas that aged well and remove the coupling that did not.

The project should demonstrate:

- agentic architecture;
- TypeScript/Node engineering;
- API/DX judgment;
- explicit trade-offs;
- portability;
- provider independence;
- multi-agent evolution;
- production-minded design.

This matters for the project itself and for the professional positioning of its author.

---

## 15. Before continuing

Read, in this order:

1. this file;
2. `README.md`;
3. `docs/vision.md`;
4. `docs/origins.md`;
5. `docs/use-cases.md`;
6. `docs/IMPLEMENTATION_PLAN.md`;
7. all ADRs under `docs/decisions/`;
8. `docs/development-log.md`;
9. current `packages/core/src/`;
10. current core tests.

Then continue from Phase 1 of the implementation plan without re-litigating decisions already marked Accepted unless code/tests reveal a real problem.

Before ending your session, apply the multi-tool continuity rule from section 0 so the next tool can continue from the repository alone.
