# Story index (evidence map)

Each row is a future public/tech narrative candidate grounded in repository artifacts.

**Status legend:** `raw` → `recommended` → `draftable` → `owner-selected` → `published`  
Nothing is `owner-selected` or `published` without an explicit owner decision. See [PUBLIC_STORY_SELECTION.md](./PUBLIC_STORY_SELECTION.md).

| Story | Evidence | Status |
| --- | --- | --- |
| Origins: ReceptionistAgent before AgentStride | `docs/origins.md`, `docs/vision.md`, examples `04` / `17` | recommended |
| Removing the event bus | ADR 0003, `docs/architecture.md` | recommended (paired with origins) |
| Standard Schema decision | ADR 0005 / 0006 | raw |
| Cancellation is not Promise.race | ADR 0009, ADR 0010, `packages/core/test/nested-cancellation.test.mjs`, `docs/research/nested-cancellation.md` | recommended |
| Enterprise validation without core growth | examples `17`/`18`, PR #4/#5, development-log | raw |
| Evals: testing decisions | `evals/`, `docs/research/evaluation-harness.md`, PR #8 | recommended |
| Correlation without a bus | ADR 0011, `docs/research/run-causality.md`, PR #10 | recommended |
| OpenTelemetry without core lock-in | ADR 0012, example `19`, `docs/research/opentelemetry-proof.md`, PR #12 | raw (pack 2) |
| Human approval: the agent is not its own approver | example `20`, `docs/research/human-approval.md`, `evals/human-approval/` | recommended |
| Side effects: knowing whether the tool already ran | example `21`, `docs/research/side-effect-idempotency.md` | raw (pack 2) |
| Usage without prices in core | example `22`, `docs/research/usage-accounting.md` | raw |
| Near-real ops: Velum Grid alarm triage | example `23` (+ HTTP), `docs/research/alarm-triage.md`, `evals/alarm-triage/` | raw (case study) |
| Near-real ops: Velum Grid change-gate | example `24` (+ HTTP), `docs/research/change-gate.md`, `evals/change-gate/` | raw (case study) |
| Near-real compliance: Velum Grid data-export | example `25`, `evals/data-export/` | raw (case study) |
| Nest surface for Velum ops | example `26` | raw |
| Pre-1.0 API freeze (still private) | ADR 0013, `docs/research/api-review-pre-1.0.md`, `docs/narrative/RELEASE_READINESS.md` | raw (meta) |

Update this table when a track lands with durable evidence or when the owner selects stories.
