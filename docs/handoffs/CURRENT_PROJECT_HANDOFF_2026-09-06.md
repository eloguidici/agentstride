# AgentStride - Current Handoff (2026-09-06)

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/side-effect-idempotency`** (Track F)  
Repository visibility: **private**

Do not develop on `main`. Do not publish npm / make public unless explicitly requested.

## Progress

| Track | Status |
| --- | --- |
| A–E | on `main` (E = PR #14) |
| F Idempotency | **this branch** — example 21 |
| G Usage accounting | next |

## This branch

- `examples/21-side-effect-idempotency`
- Domain key `tenantId:requestId:action` + in-flight dedupe
- Core unchanged

```bash
npm test -w @agentstride/example-side-effect-idempotency
```

## Next

`feature/usage-accounting` — Track G (aggregate usage; no prices in core).
