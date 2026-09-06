# Public story selection (recommendation)

Date: 2026-09-06  
Status: **Recommended — awaiting OWNER GATE 1**  
Plan: `docs/plans/PUBLIC_PRODUCTIZATION_AND_RELEASE_DECISION_PLAN_2026-09-06.md`

This document proposes a first public narrative pack. Nothing here is owner-selected or approved for publication.

## Recommended sequence (5 stories)

Order is intentional: origins → hard runtime insight → multi-agent without bus → sensitive actions → measuring decisions.

| # | Story | Status |
| --- | --- | --- |
| 1 | Origins / ReceptionistAgent (and why the bus left) | recommended |
| 2 | Cancellation is not Promise.race | recommended |
| 3 | Correlation without a bus | recommended |
| 4 | The agent is not its own approver | recommended |
| 5 | Evals measure behavior, not just code | recommended |

Strong runners-up (defer for pack 2): idempotent side effects; OTel out of core; Standard Schema; Velum Grid verticals.

---

### 1. Origins / ReceptionistAgent (and removing the event bus)

**Problem**  
Enterprise multi-agent systems often accumulate a global bus, runtime message DTOs and orchestration infrastructure before the product needs them.

**Insight**  
Keep delegation and correlation; drop the RxJS bus and message-coupled tools. AgentStride inherits useful ideas from an older Receptionist-style architecture without replaying that complexity.

**Evidence**  
- `docs/origins.md`, `docs/vision.md`  
- ADR 0003 (no event bus)  
- examples `04-receptionist`, `17-enterprise-support-agent`  
- ADR 0011 (causality without a bus)

**Audience**  
Engineers who have lived through “bus + DTO” agent platforms; tech leads evaluating framework weight.

**Snippets / diagrams**  
- Old: agents ↔ global bus  
- New: `Receptionist → asAgentTool(specialist)` + `parentRunId`  
- Code: `asAgentTool` + local `run`

**Risks / claims to avoid**  
- Do not name employers, customers or confidential systems.  
- Do not claim the old system was “wrong”; describe trade-offs.  
- Do not imply AgentStride is a full rewrite of a proprietary product.

---

### 2. Cancellation is not Promise.race

**Problem**  
Racing the outer promise looks like cancellation but leaves model/tool/nested work running.

**Insight**  
Cooperative `AbortSignal` must reach tools and nested agents (`asAgentTool` forwards `run({ signal })`).

**Evidence**  
- ADR 0009, ADR 0010  
- `packages/core/test/nested-cancellation.test.mjs`  
- `docs/research/nested-cancellation.md`  
- HTTP abort paths in Nest examples

**Audience**  
Backend engineers embedding agents in HTTP servers.

**Snippets / diagrams**  
- Wrong: `Promise.race(run, timeout)`  
- Right: `runWithDeadline` / `AbortSignal` through nested tools

**Risks / claims to avoid**  
- Do not claim all provider SDKs cancel perfectly; OpenAI adapter forwards `fetch` signal (documented limits).  
- Do not say “we kill threads”; it is cooperative cancel.

---

### 3. Correlation without a bus

**Problem**  
After removing the bus, multi-agent traces still need parent/child causality.

**Insight**  
Optional `parentRunId` / `context.agentRunId` reconstructs nested runs without a global event fabric.

**Evidence**  
- ADR 0011  
- `docs/research/run-causality.md`  
- PR #10  
- Receptionist / enterprise examples

**Audience**  
People who equate “observability” with “we need a bus.”

**Snippets / diagrams**  
- Tree: parent run → child run ids  
- Event list filtered by `parentRunId`

**Risks / claims to avoid**  
- Do not claim distributed tracing is built-in (OTel is out of core — ADR 0012).  
- Do not claim remote A2A causality is done (`@agentstride/a2a` is experimental).

---

### 4. The agent is not its own approver

**Problem**  
Giving an agent an “approve” tool for sensitive side effects is a false control.

**Insight**  
Propose in-agent; approve/reject via application endpoints and roles outside the model loop.

**Evidence**  
- example `20-human-approval`  
- `evals/human-approval/`  
- `docs/research/human-approval.md`  
- Velum Grid page/execute/export approvals (23–25)

**Audience**  
Security-minded product engineers; ops/platform teams.

**Snippets / diagrams**  
- Flow: propose → pending → external approve → execute  
- HTTP: `/actions/:id/approve` (example 20)

**Risks / claims to avoid**  
- Do not claim AgentStride is a GRC/compliance product.  
- Do not claim role checks live in core (they live in domain).

---

### 5. Evals measure behavior, not just code

**Problem**  
Unit tests prove tools exist; they do not prove the agent chose the right action under scripted pressure.

**Insight**  
Deterministic scripted models + scorers (mustCall / mustNotCall / structured fields / postAssert) measure decisions.

**Evidence**  
- `evals/` harness + baselines  
- `docs/research/evaluation-harness.md`  
- PR #8  
- domain evals: enterprise-support, human-approval, alarm-triage, change-gate, data-export

**Audience**  
Teams shipping agents who only have golden-file chat tests today.

**Snippets / diagrams**  
- Case JSON → scripted model → score summary  
- Baseline JSON as regression artifact

**Risks / claims to avoid**  
- Do not claim live-LLM eval quality.  
- Do not claim evals replace production monitoring.

---

## Deferred (pack 2+)

| Story | Why defer |
| --- | --- |
| Idempotent side effects | Excellent follow-up to approval; keep pack 1 shorter |
| OTel out of core | Strong, but secondary to cancel/causality |
| Standard Schema | Important design note; less narrative arc alone |
| Velum Grid verticals | Great proof; more “case study” than first principles |
| Usage without prices | Niche; good later LinkedIn |

## Owner gate

**OWNER GATE 1:** choose which of the recommended stories (or alternatives) become `owner-selected` for draft writing (PP-8).

Until then: status stays `recommended`. No LinkedIn/articles. No publication.
