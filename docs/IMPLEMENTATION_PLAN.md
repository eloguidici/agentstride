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

Status: **Done** (2026-09-05)

See ADR 0005.

---

## Phase 2 - Structured output

Status: **Done** (2026-09-05)

- `run(input, { output: schema })`
- validates `ModelResponse.output` or JSON text fallback
- ADR 0006

---

## Phase 3 - AgentRun and execution lifecycle

Status: **Done** (2026-09-05)

- `AgentRun` with id/status/timing/events
- lifecycle events via `onEvent` (no bus)
- ADR 0007

---

## Phase 4 - Hooks and basic guards

Status: **Done** (2026-09-05)

- hooks: before/after run/model/tool + onError
- guards: maxSteps, timeoutMs, allowedTools, deniedTools
- ADR 0008

---

## Phase 5 - First real provider adapter

Status: **Done** (2026-09-05)

- `@agentstride/openai` via fetch (no SDK required)
- fake-model example retained

---

## Phase 6 - Examples as API tests

Status: **Done** (2026-09-05)

Examples under `examples/` cover simple, typed tool, structured output, receptionist, document analysis, backend integration and OpenAI.

---

## Phase 7 - RAG as an optional layer

Status: **Done** (2026-09-05)

- `@agentstride/rag` with `Retriever` + in-memory implementation

---

## Phase 8 - MCP

Status: **Done** (minimal) (2026-09-05)

- `@agentstride/mcp` bridge from MCP-shaped tools into AgentStride tools
- does not reimplement MCP protocol/client

---

## Phase 9 - Memory

Status: **Done** (2026-09-05)

- `Memory` interface in core
- `@agentstride/memory` in-memory adapter
- `run(..., { threadId, memory })`

---

## Phase 10 - NestJS integration

Status: **Done** (minimal) (2026-09-05)

- `@agentstride/nestjs` `AgentStrideModule.forRoot`

---

## Phase 11 - Local multi-agent delegation

Status: **Done** (2026-09-05)

- `AgentLike`, `asAgentTool`
- Receptionist example

---

## Phase 12 - Remote agents / A2A

Status: **Explored** (2026-09-05)

- research notes in `docs/research/a2a.md`
- experimental `@agentstride/a2a` remote AgentLike
- full protocol client still deferred

---

## Phase 13 - Migration / portability proof

Status: **Done (measured)** (2026-09-05)

- Shared domain in `examples/migration-shared`
- Baseline AgentStride example
- Mastra migration example (`toMastraToolConfig`, real `@mastra/core` when available)
- LangChain migration example (`toLangChainToolConfig`, shim/real DynamicStructuredTool)
- Honest reuse metric script (shared domain lines / shared+adapter lines)

Observed in local runs (approximate):

- AgentStride baseline reuse ~34%
- Mastra adapter reuse ~29%
- LangChain adapter reuse ~28%

Interpretation: the domain module is fully reused; framework examples differ mainly in adapter ceremony.

---

## Phase 14 - Public release preparation

Status: **Prepared, not published** (2026-09-05)

Done locally:

- README, architecture, ADRs, CI, MIT license, `.env.example`, security notes, draft release notes

Still intentional later:

- make repository public
- npm publish under `@agentstride/*`
- final public narrative polish

Hardening added without publishing:

- `docs/PUBLISH.md` + `npm run publish:check`
- CI matrix (Node 20/22) + example smoke
- Nest example auth/context + HTTP tests
- N-agent orchestrator example (`16-orchestrator-n-agents`)

---

## Stabilize track (post–Phase 14 incubation)

Status: **Done** on `main` via PR #3 (2026-09-06)

---

## Real-world validation track

Status: **Done for current slice** on `main` via PR #4 + PR #5 (2026-09-06)

- `examples/17-enterprise-support-agent` — enterprise Receptionist slice with domain separation
- `examples/18-enterprise-support-http` — Nest `POST /support/run` wrapping the slice
- Offline tests + optional live run
- Core frozen (ergonomics documented; no drive-by API changes)
- Evidence fed into `docs/research/api-review-pre-1.0.md` and development-log
- Next: only if a real product need appears (`asAgentTool` signal forward, publish, or a new use case)

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

---

## Production validation + narrative track

Status: **In progress** — Tracks A–G on `main`; H/I paused; private slice **Velum Grid alarm triage** on `feature/alarm-triage` (2026-09-06)

Detailed source of truth:

`docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`

Preferred order:

1. evaluation harness — **done**;
2. nested cancellation — **done** (ADR 0010);
3. run causality — **done** (ADR 0011);
4. OpenTelemetry proof — **done** (ADR 0012 / example 19);
5. human approval — **done** (example 20);
6. idempotent side-effect tools — **done** (example 21);
7. usage accounting — **done** (example 22);
8. pre-1.0 API stabilization — **paused for owner decision**;
9. narrative/release decision — **paused for owner decision**.

Post-pause private evidence: example `23-alarm-triage` (Velum Grid) — see `docs/research/alarm-triage.md`.

The objective is to increase production credibility without turning AgentStride into a large framework.
