# Velum Grid — change-gate

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/change-gate`

## Context

After alarm triage (reactive), the owner asked for another private near-real vertical. Change execution is the complementary proactive risk: agents must not auto-deploy.

## Hypothesis

Same patterns (normalize → domain policy → idempotent record → propose side effect → external approve) transfer to change management without core growth.

## Evidence

- `examples/24-change-gate` — shipyard JSON, wiredesk email-text, ledgerops nested
- Domain + agent + HTTP tests
- `evals/change-gate` — 5/5 deterministic cases

## Decision

Reuse **Velum Grid**. Roles `admin` | `change-approver`. Minimal Node HTTP. Core unchanged.

## Rejected

ACME; agent self-execution; Nest for this slice; inventing a workflow engine.

## Result

Second private ops vertical proving the approval/idempotency story outside alarms.

## Related

See data-export and alarm-triage verticals; Nest embed in `examples/26-velum-grid-nestjs`.
