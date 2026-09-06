# AgentStride - Current Handoff (2026-09-06)

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/usage-accounting`** (Track G)  
Repository visibility: **private**

Do not develop on `main`. Do not publish npm / make public unless explicitly requested.

## Progress

| Track | Status |
| --- | --- |
| A Evaluation harness | `main` |
| B Nested cancellation | `main` / ADR 0010 |
| C Run causality | `main` / ADR 0011 |
| D OpenTelemetry proof | `main` / ADR 0012 |
| E Human approval | `main` / PR #14 / example 20 |
| F Idempotency | `main` / PR #15 / example 21 |
| G Usage accounting | **this branch** / example 22 |
| H Pre-1.0 API | **paused** |
| I Narrative/release | **paused** |

## This branch

- `examples/22-usage-accounting` — aggregate tokens/steps/tools; external pricing only
- Core unchanged

```bash
npm test -w @agentstride/example-usage-accounting
```

## Pause

**The project should pause here for an owner decision.**

Tracks H and I (API freeze / public narrative / release) change product posture. Options:

1. Freeze current API as pre-1.0 and polish docs only.
2. Continue private incubation with more real use cases.
3. Explicitly approve public repo and/or npm publish (out of band).

Do not invent a workflow engine, policy engine, or publish without that decision.
