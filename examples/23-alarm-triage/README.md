# Velum Grid — alarm triage

Multi-source alarm intake for the fictional org **Velum Grid**.

Three raw formats:

| Source | Team | Shape |
| --- | --- | --- |
| `pulsebeat` | platform | JSON event |
| `wirewatch` | netops | syslog-like line |
| `ledgerflare` | payments | nested envelope |

Flow:

```text
raw alarm → normalizeAndAssess → drop | ticket | proposePage
                HTTP: POST /alarms/triage
                HTTP: POST /pages/:id/approve|reject  (external)
```

- Ping/heartbeat → **drop**
- Warning → **idempotent ticket**
- Incident → ticket + **page proposal** (external SRE approval; agent never pages)

## Run

```bash
npm start -w @agentstride/example-alarm-triage
npm run start:http -w @agentstride/example-alarm-triage
npm test -w @agentstride/example-alarm-triage
npm run eval:alarm-triage
```

HTTP (default port `3230`):

| Method | Path | Who |
| --- | --- | --- |
| `POST` | `/alarms/triage` | triage agent (`body.scenario` selects fake raw) |
| `POST` | `/pages/:id/approve` | `admin` \| `sre-approver` |
| `POST` | `/pages/:id/reject` | `admin` \| `sre-approver` |
| `GET` | `/pages/:id` | proposal + audit |
| `GET` | `/tickets` | open tickets |

Core unchanged. No ACME.
