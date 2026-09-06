# Velum Grid — multi-source alarm triage

Date: 2026-09-06  
Status: Implemented (+ HTTP deepen)  
Branch: `feature/alarm-triage-http` (slice landed via `feature/alarm-triage` on `main`)

## Context

After earlier production-pattern tracks, we exercised a near-real vertical slice: alarms from different teams, agents that categorize and act — without inventing ACME.

## Hypothesis

Domain owns normalize + ticket idempotency + page proposals; the agent only assesses and proposes. Approval stays external (same rule as Track E), exposed as HTTP application endpoints.

## Evidence

- `examples/23-alarm-triage` — pulsebeat JSON, wirewatch syslog, ledgerflare nested envelope
- Domain + agent tests; HTTP tests for triage → approve/reject/403
- `evals/alarm-triage` — 7 deterministic cases (incl. ledgerflare, ticket idempotency, external reject)

## Decision

Fictional org **Velum Grid**. Sources: `pulsebeat` (platform), `wirewatch` (netops), `ledgerflare` (payments). Page requires external roles (`admin` | `sre-approver`). Minimal Node HTTP (no Nest). Core unchanged.

## Rejected

ACME naming; agent self-approval of pages; normalize/approval in core; Nest for this slice.

## Result

Portable ops vertical slice with end-to-end propose → external decide, reusing human-approval and idempotency patterns.

## Related

See also change-gate and data-export verticals under `examples/`.