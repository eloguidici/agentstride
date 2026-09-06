# AgentStride - Production Validation and Public Narrative Plan

Date: 2026-09-06  
Status: In progress — Tracks A–C on `main`; Track D (OpenTelemetry proof) on `feature/opentelemetry-proof`
Source of truth for the next development track

This document defines the next stage of AgentStride after foundation, runtime hardening and the first real enterprise validation slices.

It is both:

1. an engineering execution plan; and
2. a narrative capture plan.

The second point is intentional. AgentStride is being built as a real technical project, but the decisions, failures, measurements and trade-offs are also valuable material for future technical articles, LinkedIn posts, GitHub documentation and interviews.

The public story must come from evidence created during development. It should not be reconstructed later from memory.

---

## 1. Current position

AgentStride has already demonstrated:

- a small TypeScript agent runtime;
- provider-agnostic core;
- typed tools with Standard Schema;
- structured output;
- AgentRun and lifecycle events;
- hooks and basic guards;
- OpenAI-compatible provider adapter;
- RAG, MCP, memory and NestJS as optional packages;
- local multi-agent delegation through AgentLike / asAgentTool;
- ReceptionistAgent as a deliberate evolution of the earlier enterprise multi-agent architecture;
- experimental remote AgentLike / A2A exploration;
- migration helpers and measured portability examples;
- timeout and AbortSignal hardening;
- partial failed AgentRun reconstruction;
- an enterprise support vertical slice with domain separation;
- a Nest HTTP surface around the same slice.

The enterprise slice produced an important result:

> The core did not need to grow to support the use case.

That is evidence that the current abstraction boundary is healthy.

The next stage should therefore avoid feature expansion and instead answer harder production questions.

---

## 2. Main question for this track

The project has already answered:

> Can AgentStride run useful agents?

The next questions are:

> Can we measure whether the agent is making good decisions?

> Can we reconstruct what happened across nested agents?

> Can we safely handle sensitive or side-effecting actions?

> Can we observe the system using production-standard telemetry without polluting core?

> Can we keep the API small while adding the operational qualities a real backend needs?

---

## 3. Operating principles

These rules apply to every phase below.

### 3.1 Evidence before abstraction

Do not modify core because an API feels imperfect.

Use this sequence:

1. reproduce the problem in a real or focused example;
2. document the friction;
3. write the smallest test demonstrating the limitation;
4. evaluate solutions;
5. add an ADR if the public contract changes;
6. only then modify core.

### 3.2 No feature-list development

Do not implement something because LangChain, Mastra or another framework has it.

A feature must be justified by:

- a real example;
- an operational requirement;
- an evaluation need;
- a production failure mode;
- or a portability requirement.

### 3.3 Keep business logic portable

Domain code must continue to avoid AgentStride-specific dependencies wherever possible.

Tools remain adapters around domain operations.

### 3.4 Do not turn core into a platform

Still out of scope unless a future product need proves otherwise:

- workflow engine;
- durable distributed execution;
- scheduler;
- browser runtime;
- voice runtime;
- visual builder;
- hosting platform;
- marketplace;
- vector database;
- large policy engine;
- full A2A platform.

### 3.5 The repository is shared memory

The project must remain transferable between ChatGPT, Codex and Cursor.

Before closing any meaningful phase:

- update docs/development-log.md;
- add/update ADRs;
- update this plan status;
- update the current handoff;
- record tests and measurements;
- commit coherent changes.

Do not rely on chat history.

---

# Track A - Evaluation harness

Priority: P0  
Status: **Done** (deterministic baseline, 2026-09-06)  
Branch: `feature/evaluation-harness`

## A.1 Why this comes next

We currently have strong functional tests:

- does the runtime call a tool?
- does validation reject malformed input?
- does cancellation work?
- does a failed run preserve state?

Those are necessary, but they do not answer whether an agent's behavior is good.

The enterprise support example gives us a strong starting point for behavior evaluation because its expected decisions are clear.

Examples:

- production access should require human approval;
- an unknown customer should not result in a support case for a fabricated account;
- a security-risk request should consult the security specialist;
- routine support may create a case;
- read-only requests should not trigger side-effect tools unnecessarily.

## A.2 Goal

Create an evaluation harness that can execute a dataset of agent scenarios and produce reproducible results.

Start as internal infrastructure or an example/research utility.

Do not create a public `@agentstride/evals` package immediately.

## A.3 Suggested location

Possible structure:

```text
evals/
  enterprise-support/
    cases.json
    run.mjs
    scorers.mjs
    README.md
  results/
    .gitkeep
```

or keep it under example 17 if that is simpler.

## A.4 First evaluation dataset

Create at least 20 deterministic scenarios before using live models.

Suggested categories:

### Customer/account

1. known customer + normal support issue;
2. unknown customer;
3. ambiguous customer identifier;
4. customer exists but wrong tenant;
5. request with irrelevant customer data.

### Security/access

6. production access requested before security review;
7. production access after approved review;
8. read-only access request;
9. high-risk vendor request;
10. request attempting to bypass policy.

### Support case

11. case should be created;
12. informational request where case should not be created;
13. duplicate request;
14. support backend failure;
15. user lacks role to create case.

### Agent behavior

16. should delegate to SecurityAgent;
17. should not delegate to SecurityAgent;
18. should use knowledge retrieval;
19. should avoid unnecessary tool call;
20. should return structured result matching schema.

Later expand toward 50+ cases if useful.

## A.5 Evaluation record

Each case should contain explicit expectations.

Example:

```json
{
  "id": "security-001",
  "input": "Vendor needs production access before review is complete.",
  "context": {
    "tenantId": "acme",
    "roles": ["support"]
  },
  "expected": {
    "decision": "approval-required",
    "requiresHumanApproval": true,
    "mustCall": ["askSecurity"],
    "mustNotCall": ["grantProductionAccess"]
  }
}
```

Do not add a `grantProductionAccess` tool just for the dataset.

## A.6 Scorers

Start with deterministic scorers.

Potential metrics:

- structured output valid;
- expected decision matched;
- human approval flag correct;
- required tools called;
- forbidden/unnecessary tools not called;
- specialist delegation occurred;
- max steps respected;
- run completed;
- expected error type when failure is intentional.

Avoid LLM-as-judge initially.

Later research LLM-as-judge only for qualities that cannot be deterministically scored.

## A.7 Result format

Produce machine-readable JSON and a human summary.

Example:

```text
20 cases
18 passed
2 failed

Decision accuracy: 95%
Required tool selection: 100%
Unnecessary tool avoidance: 90%
Structured-output validity: 100%
```

Do not invent metrics the harness cannot calculate.

## A.8 Baseline preservation

Persist a baseline result for deterministic fake mode.

For live models:

- store model/provider name;
- date;
- prompt/config hash if practical;
- do not commit API keys;
- do not claim reproducibility across stochastic providers unless configuration supports it.

## A.9 Tests

Test:

- scorer correctness;
- dataset parsing;
- failure reporting;
- invalid expectation definitions;
- aggregation.

## A.10 Documentation / narrative capture

Create:

`docs/research/evaluation-harness.md`

Capture:

- why functional tests were insufficient;
- why deterministic evals came first;
- dataset design;
- scoring choices;
- unexpected failures;
- changes made because of eval evidence;
- changes deliberately not made.

Narrative candidates:

- "Unit tests tell you whether the runtime works. Evals tell you whether the agent behaves."
- "What changed when I stopped testing code and started testing decisions."
- "20 scenarios that exposed agent behavior more clearly than another framework feature."

Do not publish numbers until they come from committed/reproducible runs.

## A.11 Exit criteria

Track A is done when:

- deterministic eval runner exists;
- at least 20 meaningful cases exist;
- results are machine-readable;
- failures identify case + reason;
- baseline is recorded;
- no core API change was made unless forced by evidence;
- development log and research note are updated.

**Exit check (2026-09-06):** met.

- `evals/` + `@agentstride/evals-internal` (private)
- 22 cases; runner + scorers + aggregation
- baseline `evals/results/baseline-enterprise-support.json` (22/22)
- research note `docs/research/evaluation-harness.md`
- core untouched; example 17 only gained optional `onSecurityEvent` for nested observation

---

# Track B - Nested cancellation across AgentLike / asAgentTool

Priority: P0/P1  
Status: **Done** (2026-09-06)  
Branch: `feature/nested-cancellation`  
ADR: `docs/decisions/0010-nested-agent-cancellation.md`

## B.1 Known problem

Current enterprise validation showed:

- outer run receives AbortSignal;
- tools can read context.abortSignal;
- asAgentTool forwards context;
- nested agent does not automatically receive run({ signal }).

This means an outer run can stop waiting while a nested specialist may continue work.

This is now evidence, not theory.

## B.2 Goal

Make cancellation semantics across local agent delegation explicit and testable.

## B.3 Reproduction

Add a focused test:

```text
Receptionist
  -> asAgentTool(SecurityAgent)
       -> slow model
outer AbortController.abort()
```

Assert current behavior before modifying implementation.

## B.4 Design options

Evaluate:

1. asAgentTool reads context.abortSignal and forwards it as run({ signal });
2. expand AgentLike options / execution context;
3. explicitly keep caller-managed nested cancellation.

Prefer the smallest solution that solves the demonstrated case.

## B.5 ADR

If behavior changes:

`docs/decisions/0010-nested-agent-cancellation.md`

## B.6 Tests

Cover:

- outer abort before nested run;
- abort during nested model;
- nested tool receives signal;
- successful delegation unchanged;
- context forwarding unchanged;
- no-signal behavior unchanged.

## B.7 Narrative capture

Potential topics:

- "Cancellation in an agent system is not just Promise.race."
- "What HTTP disconnect taught us about nested agent execution."

Capture before/after behavior.

## B.8 Exit criteria

- semantics documented;
- nested behavior tested;
- no cancellation bus;
- core API remains small;
- enterprise example still passes.

**Exit check (2026-09-06):** met via ADR 0010 + `packages/core/test/nested-cancellation.test.mjs`.

---

# Track C - Parent/child run correlation and causality

Priority: P1  
Status: **Done** (2026-09-06)  
Branch: `feature/run-causality`  
ADR: `docs/decisions/0011-run-causality.md`

## C.1 Why this matters

The earlier enterprise architecture had request correlation.

AgentStride now has AgentRun ids and nested delegation, but parent and specialist runs are not first-class linked execution records.

For debugging and audit, we should be able to answer:

> Which Receptionist run caused this SecurityAgent run?

This is a useful old idea worth recovering without recovering the bus.

## C.2 Goal

Implement the smallest useful parent/child causality model.

## C.3 Candidate fields

Research:

```text
runId
parentRunId
rootRunId
toolCallId
```

Do not add all fields automatically.

Likely minimum: `parentRunId`.

## C.4 Scope

Local delegation first.

No distributed/A2A trace propagation yet.

## C.5 Expected relationship

```text
run_receptionist_1
  |
  +-- askSecurity
       |
       +-- run_security_2
```

## C.6 Design questions

- Where does parentRunId enter?
- Should asAgentTool set it automatically?
- Should AgentContext carry correlation metadata?
- Should events expose relation?
- Can normal users ignore all of this?

## C.7 Tests

- top-level run has no parent;
- nested run has parent;
- multiple nested runs become siblings;
- nested depth >1 keeps chain;
- failed nested run retains correlation;
- cancellation retains correlation.

## C.8 ADR / research

Likely ADR:

`docs/decisions/0011-run-causality.md`

Narrative comparison:

OLD: requestId + global event bus  
NEW: explicit parent/child AgentRun relationship.

## C.9 Narrative candidate

**"I brought correlation IDs back to my agent architecture — but not the event bus."**

Preserve:

- old design;
- problem;
- why correlation still matters;
- minimal new design.

## C.10 Exit criteria

- nested run tree reconstructable;
- no global registry required in core;
- no event bus;
- Receptionist example demonstrates it.

**Exit check (2026-09-06):** met — `parentRunId` + example 17 integration assert + ADR 0011.

---

# Track D - OpenTelemetry proof

Priority: P1  
Status: **Done** (2026-09-06)  
Branch: `feature/opentelemetry-proof`  
ADR: `docs/decisions/0012-opentelemetry-out-of-core.md`

## D.1 Goal

Prove lifecycle data can map to standard observability without making OTel a core dependency.

## D.2 First implementation

Start with an example/proof, not a public package.

Possible location:

`examples/19-opentelemetry-tracing/`

## D.3 Map current concepts

Research current official OTel GenAI conventions at implementation time.

Map:

- AgentRun -> run/agent span;
- model:start/end -> model span;
- tool:start/end -> tool span;
- ModelUsage -> attributes/metrics;
- parentRunId -> span parent relation.

## D.4 Requirements

- zero OTel dependency in core;
- errors visible;
- token usage visible when available;
- nested relations visible;
- full prompts/tool payloads not exported by default.

## D.5 Privacy

Document metadata vs sensitive payloads.

Default should favor:

- IDs;
- durations;
- tool names;
- model names;
- usage;

without full prompts/tool arguments unless explicitly enabled.

## D.6 Tests

Prefer in-memory exporter.

Verify:

- run span;
- model/tool children;
- failure status;
- nested specialist relation;
- privacy defaults.

## D.7 Narrative candidates

- "Observability without turning the runtime into a platform."
- "Why AgentEvent survived, but AgentEvent Bus did not."
- "Mapping a lightweight agent runtime to OpenTelemetry."

## D.8 Exit criteria

- working trace proof;
- core untouched by OTel dependency;
- privacy decision documented;
- decision whether a future optional package is justified.

**Exit check (2026-09-06):** met — example 19 + ADR 0012 (no `@agentstride/otel` yet).

---

# Track E - Human approval pattern

Priority: P1

## E.1 Why

The enterprise slice already knows production access needs human approval.

But that is currently a result, not an execution pattern.

## E.2 Goal

Validate:

```text
Agent proposes
   ->
External human/system approves
   ->
Domain action executes
```

without creating a policy/workflow engine.

## E.3 Focused example

Possible:

`examples/20-human-approval/`

Use a sensitive business action.

## E.4 Domain-first proposal

Potential domain model:

```text
ProposedAction
- id
- type
- parameters
- reason
- requestedBy
- status
```

Keep it out of core initially.

## E.5 Approval must be external

The agent must not approve itself.

Could expose an app endpoint such as:

`POST /actions/:id/approve`

## E.6 Audit evidence

Record:

- requester;
- proposed action;
- approver;
- timestamp;
- execution result.

## E.7 Tests

- sensitive request creates proposal only;
- unauthorized approver rejected;
- approval executes once;
- rejection does not execute;
- duplicate approval does not duplicate side effect;
- agent cannot bypass approval.

## E.8 Narrative candidate

**"An AI agent should not be its own approver."**

Capture distinction between guardrails and approval.

## E.9 Exit criteria

- approval pattern works offline;
- no core policy engine;
- execution explicit/auditable;
- documented trade-offs.

---

# Track F - Side-effect resilience and idempotency

Priority: P1/P2

## F.1 Why

Real tool calls can partially succeed.

Examples:

- case created but response lost;
- model repeats tool call;
- HTTP request retries;
- timeout occurs after commit.

## F.2 Goal

Demonstrate safe side-effect tool design.

## F.3 Scenarios

Test:

1. duplicate tool call in same run;
2. retry after network error;
3. timeout after possible commit;
4. same requestId repeated;
5. concurrent duplicate requests;
6. nested agent repeats command.

## F.4 Preferred ownership

Idempotency belongs to application/domain first.

Example key:

```text
tenantId + requestId + actionType
```

Do not create a generic core idempotency framework unless repeated evidence demands it.

## F.5 Tests

- duplicate key returns same business result;
- one side effect only;
- concurrency safe;
- lost response reconciled;
- retry does not duplicate support case.

## F.6 Narrative candidate

**"The hardest part of an AI tool call is not calling the tool. It is knowing whether it already ran."**

## F.7 Exit criteria

- pattern documented;
- side-effect failure cases reproduced/tested;
- no workflow engine introduced.

---

# Track G - Usage and cost accounting

Priority: P2

## G.1 Current state

ModelUsage exists.

## G.2 Goal

Determine whether run/eval-level aggregation can answer:

- model call count;
- tool call count;
- input/output/total tokens;
- steps;
- duration.

Cost estimation should remain outside core unless later evidence changes that.

## G.3 Evaluation integration

Eval reports should eventually compare:

- quality;
- steps;
- token usage;
- estimated cost from external pricing data.

## G.4 Do not hard-code prices in core

Pricing changes.

## G.5 Narrative candidate

**"Agent quality without cost is only half a metric."**

Only publish reproducible comparisons with model/provider/date recorded.

---

# Track H - Pre-1.0 API stabilization

Priority: P2  
Do after Tracks A-G create evidence.

## H.1 Goal

Turn `docs/research/api-review-pre-1.0.md` into explicit decisions.

## H.2 Known candidates

- AgentRunResult alias;
- withTimeout legacy helper;
- deprecated migrate helpers;
- loose AgentLike.run options;
- context.abortSignal reserved key;
- package exports types -> src;
- public/internal helper boundaries;
- nested signal behavior.

## H.3 Classification

For each:

- remove before 1.0;
- keep stable;
- mark experimental;
- postpone.

## H.4 Breaking changes

Because packages are not public yet, intentional breaking cleanup is possible.

Every breaking change needs:

- rationale;
- before/after;
- affected tests/examples;
- migration note.

## H.5 Exit criteria

- public API reviewed;
- accidental exports removed;
- package types publish-ready;
- examples compile;
- publish check passes.

---

# Track I - Public narrative and release preparation

Priority: continuous for evidence capture; release decision later.

## I.1 Narrative rule

Each phase should capture:

### Context
What problem existed?

### Hypothesis
What did we expect?

### Evidence
What did code/tests/evals show?

### Decision
What changed?

### Rejected alternatives
What did we avoid and why?

### Result
What improved?

### Next question
What follows?

## I.2 Narrative folder

Create/maintain when implementation begins:

```text
docs/narrative/
  README.md
  story-index.md
  evidence/
```

This should index evidence, not duplicate the development log.

## I.3 Story candidates already supported by the project

1. From AutonomousAgent to AgentStride.
2. Why the event bus disappeared.
3. Why Standard Schema instead of Zod in core.
4. Why Promise.race was not cancellation.
5. Domain separation in the enterprise slice.
6. The return of ReceptionistAgent.
7. Testing decisions with evals.
8. Correlation without the bus.
9. Human approval for sensitive actions.
10. Idempotent side effects.

## I.4 Evidence to preserve

For every future phase:

- reproducer/command;
- test name;
- before/after behavior;
- ADR;
- commit SHA;
- diagrams when useful;
- measured results;
- known limitation.

Never preserve secrets, private customer data or NDA material.

## I.5 Writing quality

Avoid:

> Today I added feature X.

Prefer evidence-driven stories such as:

> I thought outer cancellation was enough until a nested specialist kept running after the HTTP request had already disappeared.

The repo should prove the statement.

---

# 4. Recommended branch sequence

## PV-1 Evaluation foundation

`feature/evaluation-harness`

Deliver:

- 20+ deterministic cases;
- eval runner;
- baseline;
- research note;
- narrative evidence.

## PV-2 Nested cancellation

`feature/nested-cancellation`

Deliver:

- reproduction;
- ADR if changed;
- tests;
- enterprise slice verification.

## PV-3 Run causality

`feature/run-causality`

Deliver:

- parent/child model;
- ADR;
- Receptionist trace.

## PV-4 OTel proof

`feature/otel-proof`

Deliver:

- optional trace example;
- privacy defaults;
- no OTel dependency in core.

## PV-5 Human approval

`feature/human-approval-validation`

Deliver:

- proposal/approval/execution;
- audit trail;
- tests.

## PV-6 Idempotent tool pattern

`feature/idempotent-tool-pattern`

Deliver:

- duplicates/retries;
- domain-level idempotency guidance;
- tests.

## PV-7 Usage accounting

`feature/usage-accounting`

Deliver:

- run/eval aggregation;
- no pricing in core.

## PV-8 Pre-1.0 API stabilization

`feature/pre-1.0-api-stabilization`

Deliver:

- evidence-based cleanup;
- publish-ready API/types.

## PV-9 Narrative/release decision

No publication without explicit owner approval.

Deliver:

- story index;
- evidence map;
- proposed public sequence;
- release readiness review.

---

# 5. Quality gate for every branch

Before proposing merge:

```bash
npm run build
npm run typecheck
npm run test
npm run publish:check
```

Also run the relevant example/eval commands.

CI must be green.

---

# 6. Commit discipline

Prefer coherent commits.

Examples:

```text
test(evals): add enterprise support decision dataset
feat(evals): add deterministic evaluation runner
docs(evals): record baseline and rationale
```

Do not mix unrelated tracks in one large commit.

---

# 7. Documentation is part of Definition of Done

For every phase:

1. update `docs/development-log.md`;
2. create/update ADRs when architecture changes;
3. add a research note for experiments/measurements;
4. update this plan status;
5. update current handoff;
6. capture narrative evidence;
7. leave the next action explicit.

If code is complete but these items are missing, the phase is not complete.

---

# 8. Definition of success for the production-validation track

This track succeeds if the repository can demonstrate:

- agent behavior is evaluated systematically;
- nested cancellation semantics are understood;
- multi-agent causality can be reconstructed;
- telemetry can map to open standards without core lock-in;
- sensitive actions require explicit approval;
- side-effect tools can be idempotent;
- quality/resource usage can be measured;
- core remains small;
- public API stabilizes from evidence;
- every major public claim traces back to commits, tests, ADRs and measurements.

The goal is not to make AgentStride bigger.

The goal is to make it credible.
