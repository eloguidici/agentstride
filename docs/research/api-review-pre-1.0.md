# API review notes (pre-1.0)

Captured during the 2026-09-06 stabilize / runtime-hardening pass.

No drive-by breaking changes in this phase. Clean up before a public 1.0 if still relevant.

## Keep

- `createAgent` / `defineTool` / `asAgentTool` — small and clear.
- `AgentRun` as the success value; throw on failure with optional `error.agentRun`.
- Standard Schema for tools + structured output.
- Optional packages outside core.

## Clean later (non-urgent)

| Item | Note |
| --- | --- |
| `AgentRunResult` | Deprecated alias of `AgentRun` — remove after a deprecation window. |
| `withTimeout` | Prefer `runWithDeadline`; keep until external callers migrate. |
| Deprecated migrate helpers | `toMastraTool` / `toLangChainTool` — remove when unused. |
| `AgentLike.run` options index signature | Loose `[key: string]: unknown` — tighten once remote agents stabilize. |
| Reserved context key `abortSignal` | Documented; avoid colliding domain keys. Long-term alternative: optional tool middleware without expanding `execute` arity. |
| Package `exports.types` → `src/` | Incubation convenience for monorepo builds; switch to `dist/*.d.ts` before npm publish. |

## Explicitly not public policy engines

Hooks/guards stay thin. Do not grow them into a rules framework in core.
