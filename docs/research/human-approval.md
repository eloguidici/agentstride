# Human approval pattern (Track E)

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/human-approval`

## Context

Enterprise support already flagged `requiresHumanApproval`, but that was a result flag — not an execution pattern. Sensitive side effects (grant production access) needed propose → external approve → execute without a workflow/policy engine.

## Hypothesis

Keep proposals, permissions, grant, and audit in domain/application code. The agent only proposes via a tool. Approval is an external function/HTTP endpoint. Core stays unchanged.

## Evidence

- `examples/20-human-approval` — 15 tests (domain, agent, HTTP)
- Agent tools: `findCustomer`, `proposeProductionAccess` only — no approve/grant
- Duplicate approve returns prior execution without re-grant
- Reject / expire / unauthorized / unknown fail safely
- Evals: `evals/human-approval` baseline 3/3
- `@agentstride/core` unchanged

## Decision

Application-layer `ProposedAction` store + `approveProposedAction` / `rejectProposedAction`. No ADR (no core contract change).

## Rejected alternatives

| Option | Why rejected |
| --- | --- |
| `ProposedAction` in core | Not a runtime concern; domain-specific |
| Approval tool on the agent | Agent would be its own approver |
| Policy/workflow engine | Overkill for the validated pattern |
| Auto-approve when security says OK | Violates external-approval rule |

## Security notes

- Propose roles ≠ approve roles (`support` can propose; `admin` / `security-approver` approve)
- Side effect `grantProductionAccessService` only callable from approve path
- Audit records requester, approver, agentRunId, timestamps

## Relation to guards

Guards/hooks can block tools; they are not human approval. Approval is an explicit business decision after the agent finishes proposing.

## Result

We can reconstruct who asked, what was proposed, which run, who approved, and what executed — with in-memory audit.

## Next question

Track F: can side-effect tools be idempotent at the domain level under retries/duplicates?
