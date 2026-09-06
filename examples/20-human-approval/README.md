# Human approval pattern

Validates:

```text
Agent proposes → external human/system approves → domain executes
```

**The agent is not its own approver.** There is no approve/grant tool on the agent.

## Run

```bash
npm start -w @agentstride/example-human-approval
npm test -w @agentstride/example-human-approval
node examples/20-human-approval/http.mjs
```

HTTP (plain Node, not Nest):

- `POST /support/run` — agent creates a pending proposal
- `POST /actions/:id/approve` — admin / security-approver executes grant once
- `POST /actions/:id/reject` — never grants

## Domain

| Module | Role |
| --- | --- |
| `proposal-service` | create / approve / reject |
| `customer-service` | grant side effect (domain only) |
| `audit-service` | in-memory trail |
| `permissions` | propose ≠ approve roles |

Core is unchanged. No workflow engine.
