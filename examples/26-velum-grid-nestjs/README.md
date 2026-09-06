# Velum Grid over Nest HTTP

HTTP surface for [`examples/23-alarm-triage`](../23-alarm-triage) and [`examples/24-change-gate`](../24-change-gate): same domain + agents, exposed as Nest routes.

This repo is **private**. The Nest wrapper does **not** change `@agentstride/core`.

## Why this exists

Examples 23/24 proved alarm triage and change gate offline (propose → external approve). This example checks whether those slices embed cleanly in a Nest backend (API key, request context, abort on connection close) **without changing core**.

## Endpoints

```bash
POST /alarms/triage
POST /pages/:id/approve
POST /pages/:id/reject
POST /changes/gate
POST /executions/:id/approve
POST /executions/:id/reject

Headers:
  x-api-key      # required when AGENT_API_KEY is set
  x-tenant-id
  x-request-id
  x-user-id
  x-roles        # comma-separated; page needs sre-approver|admin; execute needs change-approver|admin
Body (triage / gate):
  { "input": "...", "scenario": "pulsebeat-crash" | "shipyard-hotfix" | ... }
```

## Modes

- **Fake only:** scripted models from examples 23/24. Set `VELUM_FAKE=1` in tests; no OpenAI/RAG deps.

```bash
npm start -w @agentstride/example-velum-grid-nestjs
npm test -w @agentstride/example-velum-grid-nestjs
```

Default port: `3260` (`PORT`).

## Notes

- Reuses 23/24 via dynamic `import()` of their `.mjs` modules (domain stays free of Nest).
- On module init: `resetAlarmStores()` + `resetChangeStores()`.
- Does not put Nest into `@agentstride/core`.
