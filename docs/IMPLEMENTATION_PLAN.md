# AgentStride - Implementation Plan

This is the current implementation plan for AgentStride.

It is intentionally ordered to stabilize the smallest useful runtime before adding integrations.

The plan can evolve, but changes should be documented.

## Working across ChatGPT, Codex and Cursor

This plan is also a coordination artifact between development tools.

The project may move between ChatGPT, Codex and Cursor frequently. Each environment should treat the repository documentation as shared state.

When a phase is completed or materially changed:

- mark the result clearly in the development log;
- update this plan if the next phase or scope changed;
- create/update the relevant ADR;
- update the current handoff if the next starting point changed;
- commit before handing the project to another tool.

Do not rely on the previous assistant's chat context. The next environment may only have the repository.

---

## Phase 1 - Typed tools and runtime schemas

### Goal

Make tools genuinely safe and ergonomic at the boundary between an LLM and application code.

### Work

- evaluate schema strategy;
- document the chosen approach in an ADR;
- add typed input schema support to `defineTool()`;
- validate model-provided tool input at runtime;
- preserve TypeScript inference;
- determine how provider adapters can obtain JSON Schema or equivalent tool definitions;
- decide whether tool output validation belongs in this phase or later;
- add tests for valid and invalid input;
- update the example to demonstrate inferred tool input.

### Constraints

- do not tie business code to model-provider types;
- do not make the core dependent on a large validation abstraction unless the DX gain justifies it;
- avoid creating an AgentStride-specific schema language unless necessary.

### Done when

A tool can declare its input contract once and get:

- compile-time inference;
- runtime validation;
- provider-usable schema information.

---

## Phase 2 - Structured output

### Goal

Allow an agent run to return validated structured data, not only text.

Desired direction:

```ts
const result = await agent.run("Analyze customer", {
  output: schema
});
```

### Work

- design structured-output contract;
- decide whether validation belongs in core;
- keep provider-specific structured-output APIs inside adapters;
- support fallback validation where appropriate;
- add tests;
- add a document-analysis-style example.

### Done when

A caller can request typed structured output without becoming coupled to a provider SDK.

---

## Phase 3 - AgentRun and execution lifecycle

### Goal

Move from a minimal `steps + messages` return value toward an explicit execution model without over-engineering it.

### Candidate concepts

- run id;
- status;
- steps;
- model calls;
- tool calls;
- timestamps / duration;
- usage metadata where providers expose it;
- error state.

### Nostalgic continuity

This is one place where ideas from the old `TaskMemory` model can evolve into a cleaner `AgentRun`.

### Work

- design `AgentRun`;
- add stable run identifiers;
- preserve simple `result.text`;
- add lifecycle events such as:
  - run:start
  - model:start
  - model:end
  - tool:start
  - tool:end
  - run:end
  - run:error
- do **not** reintroduce a global event bus.

### Done when

The runtime can be observed without requiring an external observability platform.

---

## Phase 4 - Hooks and basic guards

### Goal

Allow applications to add cross-cutting behavior without modifying core execution logic.

Candidate hooks:

- beforeRun;
- beforeModel;
- afterModel;
- beforeTool;
- afterTool;
- onError.

Candidate guards:

- max steps;
- timeout;
- tool allow/deny;
- optional approval marker;
- eventually max cost when provider metadata exists.

### Work

- keep APIs composable;
- avoid building a policy engine;
- test ordering and failure behavior;
- document when hooks vs guards should be used.

---

## Phase 5 - First real provider adapter

### Preferred first provider

OpenAI, unless implementation research gives a strong reason otherwise.

Package direction:

`@agentstride/openai`

### Goal

Prove that the core `Model` abstraction works against a real provider without leaking provider details.

### Work

- message translation;
- tool schema translation;
- tool call translation;
- text output;
- structured output support if Phase 2 is ready;
- usage metadata;
- error normalization only where it adds value;
- integration example using environment variables;
- no secrets in repository.

### Important

Keep the existing fake-model example.

---

## Phase 6 - Examples as API tests

Build examples that each validate a real use case.

Suggested order:

### 01 - simple agent

No tools.

### 02 - typed tool

One business tool with schema validation.

### 03 - structured output

Analysis returning a typed object.

### 04 - receptionist

Nostalgic reference to the original system.

A coordinator chooses among specialized capabilities.

### 05 - document analysis

Becomes the first RAG-oriented vertical slice later.

### 06 - backend integration

Example shaped like a normal backend service, not a chatbot.

Examples should remain small.

If an example needs excessive ceremony, treat that as feedback on the API.

---

## Phase 7 - RAG as an optional layer

Package direction:

`@agentstride/rag`

### Goal

Support retrieval without turning AgentStride into a document-processing platform.

Candidate minimal contract:

```ts
interface Retriever {
  retrieve(query: string, options?: RetrieveOptions): Promise<Document[]>;
}
```

### Possible first integrations

- in-memory documents;
- local files;
- pgvector adapter later.

### Avoid

- building our own vector database;
- dozens of loaders;
- dozens of splitters;
- large embedding abstractions too early.

A LangChain Retriever bridge could be valuable later because it supports the portability story.

---

## Phase 8 - MCP

Package direction:

`@agentstride/mcp`

### Goal

Expose MCP tools/resources to an AgentStride agent without polluting core.

Ideal user experience should be approximately:

```ts
const server = await mcp(...);

const agent = createAgent({
  model,
  tools: {
    ...server.tools()
  }
});
```

### Avoid

Do not redesign MCP.

Adapt it into AgentStride's existing capability/tool model.

---

## Phase 9 - Memory

### Goal

Support conversation/execution persistence through a small interface.

Candidate direction:

```ts
interface Memory {
  load(threadId: string): Promise<AgentMessage[]>;
  save(threadId: string, messages: readonly AgentMessage[]): Promise<void>;
}
```

### Packages later

- in-memory default/example;
- Redis;
- Postgres if justified.

### Avoid

Do not start with a taxonomy of semantic/episodic/observational memory.

---

## Phase 10 - NestJS integration

Package direction:

`@agentstride/nestjs`

This is strategically useful because AgentStride is TypeScript/backend oriented.

### Goal

Make AgentStride feel natural inside an existing NestJS application without making NestJS part of core.

Possible API:

```ts
AgentStrideModule.forRoot(...)
```

or providers/factories if that is simpler.

### Work

- dependency injection;
- model/provider registration;
- tool providers;
- context integration;
- lifecycle integration.

Keep this package optional.

---

## Phase 11 - Local multi-agent delegation

### Goal

Reintroduce one of the strongest ideas from the original project in a simpler form.

Desired abstraction:

```ts
interface AgentLike<I = unknown, O = unknown> {
  run(input: I, context?: AgentContext): Promise<O>;
}
```

Then a coordinator should be able to treat another agent as a capability.

### Receptionist example

Build an official `ReceptionistAgent` example as a deliberate historical reference.

Possible specialists:

- security;
- support;
- work order / operations.

Do not recreate the old event bus.

Prefer explicit delegation.

---

## Phase 12 - Remote agents / A2A

Not core v1.

### Goal

Explore whether local and remote agents can share the same `AgentLike` concept.

Possible future package:

`@agentstride/a2a`

### Research first

- current A2A standard;
- authentication;
- capability discovery;
- streaming/task lifecycle;
- error semantics.

Only implement after local agent delegation is clean.

---

## Phase 13 - Migration / portability proof

This is strategically important.

### Goal

Demonstrate that AgentStride does not trap business logic.

Build migration examples toward:

- Mastra;
- LangChain / LangGraph.

Focus on reuse of:

- tools;
- schemas;
- prompts;
- domain services;
- retrievers where reasonable.

Possible helpers later:

- `toMastraTool()`;
- `toLangChainTool()`.

Do not fake metrics.

If code reuse is measured publicly, calculate it from real examples.

---

## Phase 14 - Public release preparation

The repository remains private until this phase is intentionally triggered.

Before public release:

- strong but concise README;
- clear package installation path;
- meaningful examples;
- architecture docs;
- ADRs;
- tests;
- CI;
- lint/typecheck/build;
- no secrets;
- `.env.example` only;
- license decision (MIT vs Apache 2.0);
- npm scope/package availability;
- contribution guide if useful;
- security policy if useful;
- first release notes;
- public narrative prepared from the actual development log.

---

## Quality bar for every phase

Before closing a phase:

1. implementation works;
2. tests cover the meaningful behavior;
3. typecheck passes;
4. build passes;
5. API remains small;
6. docs explain new architectural decisions;
7. development log is updated;
8. no provider/integration leakage into core unless explicitly accepted;
9. examples remain understandable;
10. no secrets or generated clutter are committed.

---

## Stop conditions

Pause feature growth and reassess if any of the following happens:

- a simple agent takes dozens of lines of framework ceremony;
- core starts importing provider SDKs;
- tools need AgentStride-specific runtime messages;
- optional integrations begin changing core abstractions repeatedly;
- a workflow engine starts emerging accidentally;
- agent-to-agent support requires a global bus;
- documentation becomes more elaborate than the implementation;
- features are added because competitors have them rather than because use cases need them.
