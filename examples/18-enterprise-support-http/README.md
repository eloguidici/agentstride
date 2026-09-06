# Enterprise support over Nest HTTP

HTTP surface for [`examples/17-enterprise-support-agent`](../17-enterprise-support-agent): same domain + ReceptionistAgent, exposed as `POST /support/run`.

## Why this exists

The vertical slice proved AgentStride can coordinate the business case offline. This example checks whether that same slice embeds cleanly in a Nest backend (auth header, request context, abort on connection close) **without changing core**.

## Endpoints

```bash
POST /support/run
Headers:
  x-api-key      # required when AGENT_API_KEY is set
  x-tenant-id
  x-request-id
  x-user-id
  x-roles        # comma-separated, default support
Body:
  { "input": "Customer ACME cannot access production...", "roles": ["support"] }
```

Response includes `output` (structured support result), `steps`, `requestId`, etc. Failures return `{ error, agentRun? }` with partial progress when available.

## Modes

- **Fake (default for tests / no API key):** `ENTERPRISE_FAKE=1` or missing OpenAI/OpenRouter key.
- **Live:** set `OPENROUTER_API_KEY` or `OPENAI_API_KEY` and unset `ENTERPRISE_FAKE`.

```bash
npm start -w @agentstride/example-enterprise-support-http
npm test -w @agentstride/example-enterprise-support-http
```

Default port: `3200` (`PORT`).

## Notes

- Reuses example 17 via dynamic `import()` of its `.mjs` modules (domain stays free of Nest).
- Does not put Nest into `@agentstride/core`.
- AbortSignal is wired from HTTP `close` → `run({ signal })`.
