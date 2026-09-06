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
```

- Ping/heartbeat → **drop**
- Warning → **idempotent ticket**
- Incident → ticket + **page proposal** (external SRE approval; agent never pages)

## Run

```bash
npm start -w @agentstride/example-alarm-triage
npm test -w @agentstride/example-alarm-triage
npm run eval:alarm-triage
```

Core unchanged. No ACME.
