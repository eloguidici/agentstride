# Enterprise support agent (vertical slice)

Business problem: an internal operator asks AgentStride to help when **customer ACME cannot access production** — look up the account, check security restrictions, open a support case if allowed, and **never** auto-grant production access.

## What each layer does

| Layer | Responsibility |
| --- | --- |
| **Domain** (`domain/`) | Customer lookup, security assessment, case creation, permissions, knowledge corpus. **No AgentStride imports.** |
| **Tools / agents** | Thin adapters: `defineTool`, `asAgentTool`, `createAgent`. |
| **AgentStride** | Loop, schemas, structured output, events, AbortSignal, guards. |
| **Deliberately out** | Workflow engine, policy engine, OTel, Nest (see example 12), memory (one-shot request). |

## Architecture

```text
Incoming support request + AgentContext
        |
        v
 ReceptionistAgent
        |
   +----+----+---------+
   |         |         |
findCustomer askSecurity  createSupportCase
             |
        SecurityAgent
             |
      assessSecurity + searchKnowledge (RAG)
             |
        Structured result (Zod)
```

### Old vs new (Receptionist)

```text
OLD                         NEW
Receptionist                ReceptionistAgent
   ↓                           ↓
Global Event Bus            AgentLike / Tool (asAgentTool)
   ↓                           ↓
Messages / DTOs             Specialist agent + domain services
```

No RxJS bus, no `MessageDto`, no fan-in subscriptions.

## Context

```js
{
  tenantId: "acme",
  userId: "user-123",
  requestId: "req-456",
  roles: ["support"]
}
```

Roles gate `createSupportCase`. Lookups/security need `support` | `security` | `admin`.

## Structured output

Validated with Zod / Standard Schema via `run(..., { output })`:

- `decision`, `risk`, `customerId`, `caseId`, `summary`, `requiresHumanApproval`

Production access always ends with **human/security approval required** — there is no grant tool.

## Observability

`onEvent` prints `run:*`, `model:*`, `tool:*`. Enough for a simple app trace; not OpenTelemetry.

## Failure behavior

| Scenario | Behavior |
| --- | --- |
| Unknown customer | Tool returns `{ found: false }`; structured `customer-not-found` |
| High security risk | Domain assessment + ticket with `requiresHumanApproval: true` |
| Case backend down | Tool throws → `ToolExecutionError` + `error.agentRun` |
| Missing role | Permission error on create |
| AbortSignal | Cooperative cancel on `slowAuditPing` / race on run |
| Invalid output | `StructuredOutputValidationError` |

## Run offline (CI / default)

```bash
npm start -w @agentstride/example-enterprise-support-agent
npm test -w @agentstride/example-enterprise-support-agent
```

## Run live (optional)

Requires root `.env` with `OPENROUTER_API_KEY` or `OPENAI_API_KEY`.

```bash
npm run start:live -w @agentstride/example-enterprise-support-agent
```

## What this example taught us

See `docs/development-log.md` and updates in `docs/research/api-review-pre-1.0.md`.

Short version:

- Domain separation worked without core changes.
- `asAgentTool` is enough for Receptionist → Security; nested runs inherit **context** but not a top-level `signal` option (outer cancel still wins via `runWithDeadline`).
- Memory was unnecessary for this one-shot case.
- In-memory RAG was enough to prove knowledge lookup.
- `abortSignal` on context is usable for cooperative tools; document the reserved key.
