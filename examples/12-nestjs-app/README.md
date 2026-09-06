# NestJS mini-app consuming AgentStride

Real NestJS HTTP service that embeds `@agentstride/core` through `@agentstride/nestjs`.

```bash
npm start -w @agentstride/example-nestjs-app
curl -X POST http://localhost:3100/agent/run -H "content-type: application/json" -d "{\"input\":\"Find customer 42\"}"
```

Requires `OPENROUTER_API_KEY` or `OPENAI_API_KEY` in the repo-root `.env`.
