# Velum Grid — change-gate

Proactive change intake for **Velum Grid** (distinct from reactive alarm triage).

Three raw formats:

| Source | Team | Shape |
| --- | --- | --- |
| `shipyard` | platform | JSON change ticket |
| `wiredesk` | netops | email-like text |
| `ledgerops` | payments | nested portal payload |

Flow:

```text
raw change → normalizeAndAssess → record | proposeExecute
                HTTP: POST /changes/gate
                HTTP: POST /executions/:id/approve|reject  (external)
```

- Routine → **record** only
- Elevated / emergency → record + **execute proposal** (external `admin` | `change-approver`; agent never executes)

## Run

```bash
npm start -w @agentstride/example-change-gate
npm run start:http -w @agentstride/example-change-gate
npm test -w @agentstride/example-change-gate
npm run eval:change-gate
```

Core unchanged. No ACME.
