# Velum Grid — multi-source alarm triage

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/alarm-triage`

## Context

After Tracks A–G, the owner chose to stay private and exercise a near-real vertical slice: alarms from different teams, agents that categorize and act — without inventing ACME.

## Hypothesis

Domain owns normalize + ticket idempotency + page proposals; the agent only assesses and proposes. Approval stays external (same rule as Track E).

## Evidence

- `examples/23-alarm-triage` — pulsebeat JSON, wirewatch syslog, ledgerflare nested envelope
- Domain tests: noise drop, warning ticket, incident proposePage, fingerprint idempotency
- Agent tests: never auto-pages (`paged` stays false)
- `evals/alarm-triage` — 4/4 deterministic cases

## Decision

Fictional org **Velum Grid**. Sources: `pulsebeat` (platform), `wirewatch` (netops), `ledgerflare` (payments). Page requires external roles (`admin` | `sre-approver`). Core unchanged.

## Rejected

ACME naming; agent self-approval of pages; putting normalize/approval in core.

## Result

A portable “almost real” ops slice that reuses approval + idempotency patterns outside core.

## Next question

Owner: more private use cases, or resume Tracks H/I (API freeze / narrative)?
