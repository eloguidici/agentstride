# API review notes (pre-1.0)

Status: **Freeze decisions recorded in ADR 0013** (2026-09-06).  
Repo remains **private**; no npm publish without explicit owner approval.

## Keep (stable)

- `createAgent` / `defineTool` / `asAgentTool`
- `AgentRun` as the success value; throw on failure with optional `error.agentRun`
- Standard Schema for tools + structured output
- Nested cancel + causality (ADR 0010 / 0011)
- Optional packages outside core

## Done in Track H

| Item | Decision |
| --- | --- |
| `AgentRunResult` | **Removed** — use `AgentRun` |
| `toMastraTool` / `toLangChainTool` | **Removed** — use `*ToolConfig` |
| Package `exports.types` | **Switched** to `dist/index.d.ts` |
| ADR | `docs/decisions/0013-pre-1.0-api-freeze.md` |

## Legacy / postpone

| Item | Note |
| --- | --- |
| `withTimeout` | Prefer `runWithDeadline`; keep until callers migrate |
| `AgentLike.run` options index | Loose `[key: string]: unknown` — postpone |
| Reserved context key `abortSignal` | Keep; avoid colliding domain keys |

## Explicitly not public policy engines

Hooks/guards stay thin. Role checks live in domain (Velum Grid examples 23–26).

## Exit criteria vs publish

- Public API reviewed: **yes** (ADR 0013)
- Accidental aliases removed: **yes**
- Package types publish-ready: **yes** (`dist/*.d.ts`)
- Examples compile / tests: required on the Track H PR
- **npm publish / public repo: blocked** until owner signs `docs/narrative/RELEASE_READINESS.md`
