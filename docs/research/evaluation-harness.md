# Evaluation harness (Track A)

Date: 2026-09-06  
Status: Implemented (deterministic baseline)  
Branch: `feature/evaluation-harness`

## Context

Functional tests already prove that AgentStride can call tools, validate schemas, cancel runs and preserve failed `AgentRun` state. They do **not** answer whether an agent path makes the right *business* decision (approval required, no fabricated customer, no unnecessary side effects).

## Hypothesis

If we encode enterprise-support expectations as an explicit dataset and score `AgentRun` artifacts deterministically, we can measure decision quality without inventing a public `@agentstride/evals` package or changing core.

## Evidence

- `evals/` private workspace `@agentstride/evals-internal`
- 22 cases in `evals/enterprise-support/cases.json` across customer / security / support-case / behavior
- Scorers: decision, `requiresHumanApproval`, mustCall / mustNotCall, nested tools, expected failures
- Baseline run (scripted models): **22/22 passed**
  - decisionAccuracy 100% (18/18 completed cases with decision checks)
  - requiredToolSelection 100% (39/39)
  - unnecessaryToolAvoidance 100% (37/37)
  - structuredOutputValidity 100% (40/40)
- Result artifact: `evals/results/baseline-enterprise-support.json`

## Decision

1. Keep evals **internal** under `evals/` (workspace member, `private: true`).
2. Start with **scripted deterministic models**, not LLM-as-judge.
3. Reuse example 17 agents/domain via import; do not fork domain into evals.
4. Add optional `onSecurityEvent` to Receptionist wiring so nested tool calls are observable without core changes.
5. Use real schema decisions (`needs-human-approval`), not the plan's illustrative `approval-required` label.

## Rejected alternatives

| Option | Why rejected |
| --- | --- |
| Public `@agentstride/evals` now | No evidence yet that packaging/API surface is needed |
| Live-model-first evals | Non-reproducible CI; unstable baseline |
| LLM-as-judge | Unnecessary for structured decisions we can score exactly |
| Core eval APIs | Violates evidence-before-abstraction |

## Result

We can answer: “for this scripted policy + wired tools, did the run match the expected decision and tool constraints?” Failures identify `caseId` + check reason. Core unchanged.

## Limitations (honest)

Scripted models encode the policy under test. Baseline numbers measure harness + stack consistency, **not** live LLM judgment quality. Live scoring is a later expansion once the dataset and scorers are trusted.

Nested tools are visible only because example 17 now forwards `onSecurityEvent`. Parent `AgentRun.events` still do not automatically include child tool events (causality track is separate).

## Narrative candidates

- Unit tests tell you whether the runtime works. Evals tell you whether the agent path behaves.
- 22 scenarios made decision expectations explicit without growing core.
- We refused a public evals package until evidence demanded one.

## Next question

Does nested cancellation across `asAgentTool` need a core fix (Track B), and can evals later assert abort behavior as an expected failure mode?

**Update:** Track B shipped (ADR 0010). Evals abort scenarios remain optional later.
