# Public story selection

Date: 2026-09-06  
Status: **Pack 1 owner-directed — drafts ready (not published)**  
Plan: `docs/plans/PUBLIC_PRODUCTIZATION_AND_RELEASE_DECISION_PLAN_2026-09-06.md`

Owner asked to start with the stories (2026-09-06). The recommended five-story sequence is treated as **owner-selected for drafting**. Publication of posts/articles still requires an explicit later OK.

## Pack 1 sequence

| # | Story | Status | Draft |
| --- | --- | --- | --- |
| 1 | Origins / ReceptionistAgent (and why the bus left) | owner-selected → drafted | `drafts/01-origins.md` |
| 2 | Cancellation is not Promise.race | owner-selected → drafted | `drafts/02-cancellation.md` |
| 3 | Correlation without a bus | owner-selected → drafted | `drafts/03-correlation.md` |
| 4 | The agent is not its own approver | owner-selected → drafted | `drafts/04-human-approval.md` |
| 5 | Evals measure behavior, not just code | owner-selected → drafted | `drafts/05-evals.md` |

Strong runners-up (pack 2): idempotent side effects; OTel out of core; Standard Schema; Velum Grid verticals.

## Editorial briefs

(See earlier sections historically; full briefs remain valid. Drafts expand them into publishable structure.)

### 1. Origins / ReceptionistAgent (and removing the event bus)

**Problem** — Bus + runtime DTOs accumulate before needed.  
**Insight** — Keep delegation/correlation; drop global bus.  
**Evidence** — origins, ADR 0003, examples 04/17, ADR 0011.  
**Risks** — No employer/customer names; not a proprietary rewrite claim.

### 2. Cancellation is not Promise.race

**Problem** — Outer race ≠ stop in-flight work.  
**Insight** — AbortSignal through nested agents.  
**Evidence** — ADR 0009/0010, nested-cancellation tests.  
**Risks** — Cooperative cancel; no universal provider guarantees.

### 3. Correlation without a bus

**Problem** — Need parent/child causality after removing the bus.  
**Insight** — `parentRunId` / `agentRunId`.  
**Evidence** — ADR 0011, research, PR #10.  
**Risks** — Not full distributed APM; A2A experimental.

### 4. The agent is not its own approver

**Problem** — Approve-as-tool is false control.  
**Insight** — Propose in-agent; approve in app.  
**Evidence** — example 20, evals, Velum 23–25.  
**Risks** — Not a GRC product.

### 5. Evals measure behavior, not just code

**Problem** — Tool unit tests ≠ decision tests.  
**Insight** — Scripted eval harness + scorers.  
**Evidence** — `evals/`, baselines, validation battery T4 GREEN.  
**Risks** — Not live-LLM benchmarks.

## Remaining gates

- Owner review/edit of drafts before any LinkedIn/article publish  
- Package scope / semver / visibility still open (Gates 2–3 + launch)
