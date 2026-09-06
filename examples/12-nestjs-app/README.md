# NestJS mini-app consuming AgentStride

Real NestJS HTTP service that embeds `@agentstride/core` through `@agentstride/nestjs`.

```bash
npm start -w @agentstride/example-nestjs-app
npm test -w @agentstride/example-nestjs-app
```

```bash
curl -X POST http://localhost:3100/agent/run \
  -H "content-type: application/json" \
  -H "x-api-key: $AGENT_API_KEY" \
  -H "x-tenant-id: acme" \
  -H "x-request-id: demo-1" \
  -d "{\"input\":\"Find customer 42\"}"
```

Requires `OPENROUTER_API_KEY` or `OPENAI_API_KEY` in the repo-root `.env` for live runs.

Optional auth: set `AGENT_API_KEY` and send header `x-api-key`. When unset, the guard allows local demos.

Request context: `x-request-id` (echoed on the response) and `x-tenant-id` are forwarded into `agent.run({ context })`.
