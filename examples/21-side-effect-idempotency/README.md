# Side-effect idempotency

Domain-first pattern: **one business side effect per idempotency key**, even when the model retries a tool or the client retries after a lost response.

## Key

Default: `tenantId + requestId + createSupportCase`  
Optional: explicit `idempotencyKey` on the tool input.

## Run

```bash
npm start -w @agentstride/example-side-effect-idempotency
npm test -w @agentstride/example-side-effect-idempotency
```

## What this is not

Not a core idempotency framework, not a workflow engine, not durable distributed consensus. In-memory domain store + in-flight promise map is enough to prove the pattern.
