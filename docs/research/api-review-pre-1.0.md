# API review notes (pre-1.0)

Captured during the 2026-09-06 stabilize / runtime-hardening pass, then updated with evidence from `examples/17-enterprise-support-agent`.

No drive-by breaking changes unless a vertical slice cannot proceed.

## Keep

- `createAgent` / `defineTool` / `asAgentTool` — small and clear; sufficient for Receptionist → Security.
- `AgentRun` as the success value; throw on failure with optional `error.agentRun`.
- Standard Schema for tools + structured output.
- Optional packages outside core (RAG used; memory/Nest/MCP unused on purpose).

## Clean later (non-urgent)

| Item | Note |
| --- | --- |
| `AgentRunResult` | Deprecated alias of `AgentRun` — remove after a deprecation window. Unused in the enterprise slice. |
| `withTimeout` | Prefer `runWithDeadline`; keep until external callers migrate. |
| Deprecated migrate helpers | `toMastraTool` / `toLangChainTool` — remove when unused. |
| `AgentLike.run` options index signature | Loose `[key: string]: unknown` — tighten once remote agents stabilize. |
| Reserved context key `abortSignal` | **Validated in slice:** cooperative tool cancel works. Avoid colliding domain keys. |
| Package `exports.types` → `src/` | Incubation convenience for monorepo builds; switch to `dist/*.d.ts` before npm publish. |
| `asAgentTool` signal forwarding | **Evidence:** nested specialist does not receive `run({ signal })` unless the wrapper maps `context.abortSignal`. Documented; change only if product cancel needs nested abort. |

## Explicitly not public policy engines

Hooks/guards stay thin. Role checks in the enterprise example live in **domain/permissions**, not core.

## Evidence from enterprise slice

- Structured output + Zod schema in the example was straightforward.
- Domain/tool split kept AgentStride out of business logic.
- Event trace via `onEvent` was enough for a demo; no need for OTel yet.
- No pressure to expand core public helpers for this case.
