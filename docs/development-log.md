# Development log

This is a lightweight running log of meaningful project changes.

It is not meant to duplicate Git history. It exists to preserve context that may later be useful when writing release notes, technical posts or explaining why the project evolved in a certain direction.

## 2026-09-05 - Project foundation

- Chose the working name AgentStride after checking for obvious collisions in GitHub and the AI agent ecosystem.
- Created the repository privately while the architecture is still being shaped.
- Decided that the eventual consumption model should be npm packages rather than requiring users to clone the repository.
- Kept the source repository as the future public reference for code, examples, architecture and contribution.
- Documented the connection to an earlier enterprise multi-agent architecture.
- Decided to keep nostalgic references such as ReceptionistAgent and AgentEvent where they still make architectural sense.
- Explicitly rejected copying the old RxJS event bus into the new core.
- Defined portability as a design constraint: tools and domain logic should not depend on AgentStride-specific message envelopes.
- Started with npm workspaces and a deliberately empty core package. The public API will be shaped by examples before it is frozen.

## 2026-09-05 - First runtime slice

- Added the first `Model`, `Tool`, `Agent` and `run()` contracts.
- Kept the model contract provider-agnostic. OpenAI is deliberately not a core dependency.
- Implemented the smallest useful tool-calling loop: model -> tool -> model -> result.
- Added `maxSteps` as a basic protection against accidental infinite loops.
- Passed execution context to tools without introducing a runtime-specific message DTO.
- Added behavior tests for direct responses, tool execution, unknown tools and max-step exhaustion.
- Added a provider-free example so the core can be exercised before provider adapters exist.
- Runtime input validation for tool arguments is intentionally not solved yet. The next design step is to decide how schemas fit without coupling the core to one validation library.

## 2026-09-05 - Codex handoff

- Consolidated the current state into `docs/handoffs/CURRENT_PROJECT_HANDOFF_2026-09-05.md`.
- Added a phased implementation plan in `docs/IMPLEMENTATION_PLAN.md`.
- Kept the next technical decision focused on typed runtime schemas for tools before adding provider integrations.
- Recorded explicit scope boundaries to reduce the risk of AgentStride drifting into another large agent platform.
- Documented the expected working style for future sessions: small coherent commits, tests, ADRs for important decisions and a human technical writing tone.

## 2026-09-05 - Multi-tool development workflow

- Made cross-tool continuity an explicit project requirement.
- AgentStride may be developed interchangeably from ChatGPT, Codex and Cursor.
- The repository documentation is the shared memory between tools; conversational context must not be required to continue.
- Future sessions should leave meaningful progress in the development log, architectural decisions in ADRs, plan changes in the implementation plan and the latest starting point in the current handoff.
- The goal is to be able to switch development environments without losing decisions, redoing analysis or asking the owner to repeat context.

## 2026-09-05 - Typed tool schemas (Phase 1)

- Evaluated Zod-in-core, a custom schema contract, Standard Schema, and JSON Schema-only.
- Accepted ADR 0005: validate tool inputs through Standard Schema V1; derive JSON Schema through Standard JSON Schema V1 when the library supports it.
- Kept Zod out of `@agentstride/core` runtime dependencies. It remains the recommended way to author schemas.
- Extended `defineTool()` with optional `inputSchema`, TypeScript inference, and derived `parameters`.
- Agent execution now validates model tool arguments before calling `execute`.
- Added `ToolInputValidationError` with issue details.
- Deferred tool output validation until structured output / harder boundaries justify it.
- Updated the fake-model example to pass a Zod schema and show parameters reaching the model.
- Tests: 8 passing, including valid input, invalid input, untyped tools, and JSON Schema derivation.

## 2026-09-05 - Migration proof with measured reuse

- Added `examples/migration-shared` with a framework-free domain module.
- Added baseline AgentStride + Mastra + LangChain migration examples.
- Extended `@agentstride/migrate` with `toMastraToolConfig()` and `toLangChainToolConfig()`.
- Measured reuse as shared domain lines / (shared + framework adapter lines).
- Local run: Mastra used real `@mastra/core` createTool; LangChain demo kept a compatible shim when the full LangChain dep tree was unavailable.


- Added an AgentStride-owned demo MCP server (`examples/mcp-demo-server`) with `echo` and `add`. Did not modify any personal MCP projects outside the repo.
- Extended `@agentstride/mcp` with `connectMcpStdio()` and MCP result unwrapping.
- Added `examples/11-live-mcp` proving OpenRouter + MCP tools end-to-end.
- Added `examples/12-nestjs-app`, a real NestJS HTTP service exposing `POST /agent/run` and injecting AgentStride via `@agentstride/nestjs`.


- Confirmed OpenRouter works with `@agentstride/openai`.
- Added `examples/08-live-tool`: real tool calling (`findCustomer`) against OpenRouter.
- Added `examples/09-live-structured`: real structured output validation against OpenRouter.
- Added `examples/10-live-receptionist`: live ReceptionistAgent delegation to a security specialist.
- Adapter now injects JSON Schema hints for structured output and retries without `response_format` when a gateway rejects it.
- Core structured-output parsing tolerates fenced / surrounding JSON text.


- Phase 2: structured output via `run(input, { output })`, ADRs 0006, fallback JSON parsing.
- Phase 3: `AgentRun`, run ids, lifecycle events, `onEvent` callback (ADR 0007).
- Phase 4: hooks + guards (`timeoutMs`, allow/deny tools) (ADR 0008).
- Phase 5: `@agentstride/openai` adapter.
- Phase 6: expanded examples (simple, structured, receptionist, document analysis, backend, openai).
- Phase 7: `@agentstride/rag` with in-memory retriever.
- Phase 8: `@agentstride/mcp` tool bridge (does not reimplement MCP).
- Phase 9: `Memory` in core + `@agentstride/memory` in-memory adapter.
- Phase 10: `@agentstride/nestjs` `AgentStrideModule.forRoot`.
- Phase 11: `AgentLike`, `asAgentTool`, Receptionist example.
- Phase 12: A2A research notes + experimental `@agentstride/a2a` remote AgentLike.
- Phase 13: `@agentstride/migrate` portable tool helpers.
- Phase 14 prep: MIT license, CI, architecture docs, `.env.example`, security/release notes.
- Repository remains private; public publish is still an intentional later step.

## 2026-09-06 - CI green follow-up

- CI was failing on typecheck because package `exports` point at `dist/` before build, and core inference required missing `@types/node`.
- Workflow now builds before typecheck; root adds `@types/node`; inference tsconfig no longer forces Node types.

## 2026-09-06 - Runtime hardening (stabilize)

Switched from build mode to stabilize on `feature/runtime-hardening`.

Docs:

- New handoff `CURRENT_PROJECT_HANDOFF_2026-09-06.md` (main is source of truth; old handoff superseded).
- Phase 13 marked Done consistently; stabilize track noted in the implementation plan.
- ADR 0009: AbortSignal for timeout/cancellation.
- API review notes in `docs/research/api-review-pre-1.0.md`.

Core:

- Failed runs attach `error.agentRun` with real `steps`, messages, events, timing, and last assistant text when present (no more hard-coded `steps: 0`).
- `runWithDeadline` combines `timeoutMs` and `AgentRunOptions.signal`; models get `ModelRequest.signal`; tools may read reserved `context.abortSignal`.
- Typed errors: `AgentRunTimeoutError`, `AgentAbortError`, `ToolExecutionError` (kept the set small).
- Internal split of model/tool steps for readability without new public abstractions.
- Expanded failure-path tests.

OpenAI / migrate / Nest / A2A:

- OpenAI adapter forwards AbortSignal to fetch; README clarifies structured output is not schema enforcement.
- Migrate package documents Zod-shaped target APIs vs Standard Schema in core (no new converter).
- Nest remains example-driven; A2A remains an experimental remote AgentLike sketch.

## 2026-09-06 - Real-world validation slice

Mode shift: **framework design → real-world validation** on `feature/real-world-validation`.

Added `examples/17-enterprise-support-agent`:

- Pure `domain/` (customer, security, cases, permissions, knowledge) with zero AgentStride imports.
- `ReceptionistAgent` delegates to `SecurityAgent` via `asAgentTool`; tools wrap domain; in-memory RAG for access policy.
- Structured support result; context (`tenantId`, `userId`, `requestId`, `roles`); no auto-grant of production access.
- Offline fake model + optional live script; memory intentionally unused.

### Ergonomics findings (`problem → example → possible solution`)

1. **Nested cancel signal** — Outer `run({ signal })` aborts the receptionist wait, but `asAgentTool` only forwards `context`, not `options.signal`, so the specialist model may not see `ModelRequest.signal`. *Resolved later as ADR 0010 / Track B:* `asAgentTool` maps `context.abortSignal` into `run({ signal })`.
2. **Reserved `abortSignal` key** — Cooperative tools work; domain authors must avoid colliding keys. Still acceptable vs widening `Tool.execute`.
3. **Lookup misses as throws** — Throwing from `findCustomer` aborted the whole run before structured `customer-not-found`. Fixed in the **example** by returning `{ found: false }` (app/adapter choice, not core).
4. **Trace ergonomics** — Manual `onEvent` printer is enough; OTel still not justified.
5. **Features not needed** — Memory, Nest, MCP, migrate, A2A unused here without pain.

Next step recommendation: merge this branch, then either embed the slice behind Nest HTTP or tighten `asAgentTool` signal forwarding **only if** a product cancel path needs nested abort.

## 2026-09-06 - Enterprise slice behind Nest HTTP

Added `examples/18-enterprise-support-http`:

- Reuses example 17 domain/agents via dynamic import (Nest stays out of domain).
- `POST /support/run` with api-key + tenant/user/roles/request-id headers.
- Fake mode for CI; AbortSignal from HTTP close.
- Confirmed embedding does not require core changes.

Merged to `main` as PR #5. Real-world validation track for this slice is closed until a new product need appears.


## 2026-09-06 - Production validation and narrative plan

- Reviewed `main` after the enterprise support and Nest HTTP validation slices were merged.
- Confirmed that the realistic support path did not force a core API expansion; this is now treated as evidence that the current core boundary is healthy.
- Shifted the next roadmap from feature expansion to production validation.
- Added `docs/plans/PRODUCTION_VALIDATION_AND_PUBLIC_NARRATIVE_PLAN_2026-09-06.md`.
- Planned evaluation, nested cancellation, run causality, OpenTelemetry proof, human approval, idempotent side effects, usage accounting and pre-1.0 API stabilization.
- Made narrative evidence capture part of the Definition of Done for future tracks so future public notes can be grounded in commits, tests, ADRs and measurements.

## 2026-09-06 - Track A evaluation harness

### Context

Functional tests proved the runtime. They did not systematically score whether the enterprise support path made the right business decisions.

### Hypothesis

A private deterministic harness over example 17 would measure decisions without a public evals package or core growth.

### Evidence

- 22 scripted cases across customer / security / support-case / behavior
- Scorers for decision, human-approval flag, mustCall/mustNotCall, nested tools, expected failures
- Baseline: 22/22 pass; decision/tool/structured-output metrics at 100% in scripted mode
- Artifact: `evals/results/baseline-enterprise-support.json`
- Note: `docs/research/evaluation-harness.md`

### Decision

Ship internal `evals/` workspace; keep models scripted for CI; reuse example 17; add only `onSecurityEvent` for nested tool visibility.

### Rejected

Public `@agentstride/evals`, live-first scoring, LLM-as-judge, core eval APIs.

### Result

We can fail a case with `caseId` + check reason. Core unchanged.

### Next question

Track B: nested cancellation across `asAgentTool`.

## 2026-09-06 - Track B nested cancellation

### Context

Outer abort rejected the parent wait while nested specialists could keep running (`asAgentTool` did not pass `signal`).

### Hypothesis

Map `context.abortSignal` → nested `run({ signal })` with no new public options.

### Evidence

Core tests in `nested-cancellation.test.mjs`: nested model/tool abort on parent cancel; success/context/no-signal paths unchanged.

### Decision

Ship the forward in `asAgentTool`. ADR 0010. Research note `docs/research/nested-cancellation.md`.

### Rejected

AgentLike cancel expansion; caller-managed-only; cancellation bus.

### Result

HTTP disconnect / outer `AbortSignal` can cooperatively stop nested local delegation when work honors the signal.

### Next question

Track C: parent/child run causality.

## 2026-09-06 - Track C run causality

### Context

Nested AgentRuns existed without a parent link; reconstructing Receptionist → Security required a bus we refuse to bring back.

### Hypothesis

Optional `parentRunId` auto-set by `asAgentTool` reconstructs local trees.

### Evidence

Core causality tests + example 17 integration assert nested `run:start.parentRunId`.

### Decision

ADR 0011. Reserved `context.agentRunId`. No registry / rootRunId / toolCallId yet.

### Rejected

Global registry; mandatory IDs; OTel-in-core; full correlation field set.

### Result

Local parent/child trees are reconstructable; top-level callers unchanged.

### Next question

Track D: OpenTelemetry proof without core OTel dependency.

## 2026-09-06 - Track D OpenTelemetry proof

### Context

Needed standard traces without turning core into an observability platform.

### Hypothesis

`AgentEvent` + `parentRunId` map cleanly to GenAI-shaped OTel spans in an example bridge.

### Evidence

`examples/19-opentelemetry-tracing` — in-memory tests for run/model/tool spans, nested parent link, failures, privacy defaults. Core has zero `@opentelemetry/*` deps.

### Decision

ADR 0012: OTel out of core; defer `@agentstride/otel` until demand justifies it.

### Rejected

Core OTel; public package now; exporting prompts by default.

### Result

Working proof. Optional package not justified yet.

### Next question

Track E: human approval as propose → approve → act without a workflow engine.

## 2026-09-06 - Track E human approval

### Context

`requiresHumanApproval` was only a flag. We needed a real propose → external approve → execute path for production access.

### Hypothesis

Domain/application proposals + external approve/reject are enough; core and agents must not auto-approve.

### Evidence

- example 20: 15 tests; HTTP approve/reject; no approve tool on agent
- evals/human-approval baseline 3/3
- core unchanged

### Decision

Keep ProposedAction in domain. Agent only calls `proposeProductionAccess`.

### Rejected

Core ProposedAction; approval tool; policy/workflow engine; agent auto-approval.

### Result

Auditable human-in-the-loop without a platform. Narrative index started under `docs/narrative/`.

### Next question

Track F: domain-level idempotency for side effects under retries.

## 2026-09-06 - Track F side-effect idempotency

### Context

Duplicate tool calls and lost responses can create duplicate business side effects.

### Hypothesis

Domain idempotency keys (`tenantId+requestId+action`) + in-flight dedupe suffice without a core framework.

### Evidence

Example 21: 6 tests covering duplicates, concurrency, lost response, and agent double-call.

### Decision

Keep idempotency in domain. Core unchanged.

### Rejected

Core idempotency framework; workflow engine.

### Result

One case per key; retries report `replayed: true`.

### Next question

Track G: usage aggregation for runs/evals without pricing in core.

## 2026-09-06 - Track G usage accounting

### Context

Needed run/eval metrics (tokens, steps, tool counts) without baking provider prices into core.

### Hypothesis

Aggregate from AgentRun events; estimate cost only with caller-supplied pricing.

### Evidence

Example 22 tests for aggregateUsageFromRun / estimateCostUsd / multi-run rows.

### Decision

Helpers live in the example. No prices in core. No billing package.

### Rejected

Hard-coded rates; mandatory cost on AgentRun.

### Result

Operational metrics available beside quality evals.

### Next question / pause

Track H (pre-1.0 API freeze) and Track I (narrative/release) need an **owner decision** (what to freeze, whether to publish). Do not invent scope.

## 2026-09-06 - Velum Grid alarm triage (private slice)

### Context

Owner chose stay-private + a near-real case: multi-team alarms, categorize, ticket/page — not ACME.

### Hypothesis

Normalize + idempotent tickets + page proposals live in domain; agent never approves its own page.

### Evidence

Example 23 (`pulsebeat` / `wirewatch` / `ledgerflare`); domain + agent tests; `evals/alarm-triage` 4/4.

### Decision

Fictional org **Velum Grid**. External approve roles only. Core unchanged. H/I still paused.

### Rejected

ACME; auto-page from the agent; normalize/approval in core.

### Result

Portable ops vertical slice reusing Tracks E/F patterns.

### Next question

More private use cases, or resume H/I?

## 2026-09-06 - Velum Grid alarm triage HTTP deepen

### Context

Owner asked to deepen the private slice: HTTP surface + approve/reject end-to-end + stronger evals.

### Hypothesis

Same domain can be exposed over minimal Node HTTP without Nest or core changes; evals can assert post-run domain state (idempotent reopen, reject).

### Evidence

Example 23 `http.mjs` + HTTP tests (12 total example tests); evals 7/7 including ledgerflare, ticket idempotency, external reject.

### Decision

Keep HTTP minimal (pattern of example 20). Roles `admin` | `sre-approver` only. No Nest for this deepen.

### Rejected

Nest wrapper for this slice; putting approve tools on the agent.

### Result

Propose → external decide is now demonstrable over HTTP and covered by evals.

### Next question

Another private vertical, Nest packaging of this slice, or H/I?

## 2026-09-06 - Velum Grid change-gate (private vertical #2)

### Context

Owner merged alarm-triage HTTP (#19) and asked for another private near-real vertical.

### Hypothesis

Proactive change execution can reuse normalize + idempotent record + proposeExecute + external approval without core changes.

### Evidence

Example 24 (shipyard / wiredesk / ledgerops); domain/agent/HTTP tests; `evals/change-gate` 5/5.

### Decision

Same org **Velum Grid**. Roles `admin` | `change-approver`. Minimal HTTP. Core unchanged. H/I still paused.

### Rejected

ACME; auto-execute; Nest for this slice.

### Result

Second ops vertical complementary to reactive alarm triage.

### Next question

More private use cases, Nest packaging, or resume H/I?

## 2026-09-06 - Private polish pack (vertical #3 + Nest + H + I prep)

### Context

Owner asked to apply remaining options but keep the repo private until “perfecto”.

### Hypothesis

One more compliance vertical + Nest packaging + API freeze docs/packaging + narrative release gate can land without going public.

### Evidence

Example 25 data-export; example 26 Nest Velum; ADR 0013; types→dist; RELEASE_READINESS private gate.

### Decision

Do Track H cleanup now; Track I = readiness only. No public repo. No npm publish.

### Rejected

Auto-publish; skipping freeze docs; ACME.

### Result

Private polish pack on `feature/private-polish-pack`.

### Next question

Owner reviews RELEASE_READINESS; merge when green; public only later by explicit ask.

## 2026-09-06 - Release gate engineering pass

### Context

Owner approved closing the private engineering gate before any public move.

### Hypothesis

Full monorepo test/typecheck + secrets audit + package README refresh is enough to mark engineering ready while staying private.

### Evidence

`npm test` / `build` / `typecheck` / `publish:check` green; `.env` ignored; READMEs updated; `docs/research/release-gate.md`.

### Decision

Check engineering boxes in RELEASE_READINESS. Leave narrative picks and public/npm to the owner.

### Rejected

Publishing; opening the repo; adding platform/control-plane scope.

### Result

Private polish engineering complete on `chore/release-gate`.

### Next question

Owner: story selection + origins/vision wording, then decide public posture.
