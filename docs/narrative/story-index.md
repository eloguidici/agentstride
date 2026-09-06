# Story index (evidence map)

Each row is a future public/tech narrative candidate grounded in repository artifacts.

| Story | Evidence |
| --- | --- |
| Origins: ReceptionistAgent before AgentStride | `docs/origins.md`, `docs/vision.md`, examples `04` / `17` |
| Removing the event bus | ADR 0003, `docs/architecture.md` |
| Standard Schema decision | ADR 0005 / 0006 |
| Cancellation is not Promise.race | ADR 0009, ADR 0010, `packages/core/test/nested-cancellation.test.mjs`, `docs/research/nested-cancellation.md` |
| Enterprise validation without core growth | examples `17`/`18`, PR #4/#5, development-log |
| Evals: testing decisions | `evals/`, `docs/research/evaluation-harness.md`, PR #8 |
| Correlation without a bus | ADR 0011, `docs/research/run-causality.md`, PR #10 |
| OpenTelemetry without core lock-in | ADR 0012, example `19`, `docs/research/opentelemetry-proof.md`, PR #12 |
| Human approval: the agent is not its own approver | example `20`, `docs/research/human-approval.md`, `evals/human-approval/` |
| Side effects: knowing whether the tool already ran | example `21`, `docs/research/side-effect-idempotency.md` |
| Usage without prices in core | example `22`, `docs/research/usage-accounting.md` |

Update this table when a track lands with durable evidence.
