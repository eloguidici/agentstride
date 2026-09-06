# Story index (evidence map)

Each row is a future public/tech narrative candidate grounded in repository artifacts.

**Status legend:** `raw` → `recommended` → `draftable` → `owner-selected` → `published`  
Pack 1 is `owner-selected (drafted)` for drafting only — not published. See [PUBLIC_STORY_SELECTION.md](./PUBLIC_STORY_SELECTION.md) and [drafts/](./drafts/).

| Story | Evidence | Status |
| --- | --- | --- |
| Origins: ReceptionistAgent before AgentStride | `docs/origins.md`, `docs/vision.md`, examples `04` / `17`, `drafts/01-origins.md` | owner-selected (drafted) |
| Removing the event bus | ADR 0003, `docs/architecture.md` | owner-selected (paired with origins) |
| Standard Schema decision | ADR 0005 / 0006 | raw |
| Cancellation is not Promise.race | ADR 0009, ADR 0010, tests, `drafts/02-cancellation.md` | owner-selected (drafted) |
| Enterprise validation without core growth | examples `17`/`18`, PR #4/#5, development-log | raw |
| Evals: testing decisions | `evals/`, research, `drafts/05-evals.md` | owner-selected (drafted) |
| Correlation without a bus | ADR 0011, research, `drafts/03-correlation.md` | owner-selected (drafted) |
| OpenTelemetry without core lock-in | ADR 0012, example `19` | raw (pack 2) |
| Human approval: the agent is not its own approver | example `20`, evals, `drafts/04-human-approval.md` | owner-selected (drafted) |
| Side effects: knowing whether the tool already ran | example `21` | raw (pack 2) |
| Usage without prices in core | example `22` | raw |
| Near-real ops: Velum Grid alarm triage | example `23`, evals | raw (case study) |
| Near-real ops: Velum Grid change-gate | example `24`, evals | raw (case study) |
| Near-real compliance: Velum Grid data-export | example `25`, evals | raw (case study) |
| Nest surface for Velum ops | example `26` | raw |
| Pre-1.0 API freeze (still private) | ADR 0013, RELEASE_READINESS | raw (meta) |

Update this table when a track lands with durable evidence or when the owner selects stories.
