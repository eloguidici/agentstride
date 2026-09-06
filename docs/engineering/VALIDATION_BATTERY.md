# Validation battery — AgentStride health check

Date: 2026-09-06  
Goal: local verification of build, tests, evals, demos, and package dry-run.

This is not a feature track. It is a structured check of existing evidence.

## Scope

| In | Out |
| --- | --- |
| Build / typecheck / unit+example tests | Live OpenRouter/OpenAI (optional, key-gated) |
| All deterministic eval suites | New verticals or core changes |
| Offline demos (`npm start` fake models) | Spending GitHub Actions minutes unnecessarily |
| Package dry-run for `@agentstride/core` + `@agentstride/openai` | |

## Inventory (what we are validating)

### Foundation
- `@agentstride/core` / `@agentstride/openai` and optional packages build/typecheck
- `publish:check`

### Product patterns (examples)
- `19` OTel proof  
- `20` human approval  
- `21` idempotency  
- `22` usage accounting  

### Near-real verticals (Velum Grid + enterprise)
- `17`/`18` enterprise support (+ HTTP)  
- `23` alarm triage (+ HTTP tests)  
- `24` change-gate (+ HTTP)  
- `25` data-export (+ HTTP)  
- `26` Velum Nest surface  

### Deterministic evals (decision quality)
| Suite | Cases (approx.) |
| --- | --- |
| enterprise-support | 22 |
| human-approval | 3 |
| alarm-triage | 7 |
| change-gate | 5 |
| data-export | 3 |
| **Total** | **~40** |

## Battery tiers

Run in order. Stop and investigate on first unexpected failure in T0–T4 (T5–T7 can still be reported).

### T0 — Gate de ingeniería
```bash
npm run build
npm run typecheck
npm run publish:check
```

### T1 — Core
```bash
npm test -w @agentstride/core
```

### T2 — Patrones productivos
```bash
npm test -w @agentstride/example-opentelemetry-tracing
npm test -w @agentstride/example-human-approval
npm test -w @agentstride/example-side-effect-idempotency
npm test -w @agentstride/example-usage-accounting
```

### T3 — Verticales
```bash
npm test -w @agentstride/example-enterprise-support-agent
npm test -w @agentstride/example-enterprise-support-http
npm test -w @agentstride/example-alarm-triage
npm test -w @agentstride/example-change-gate
npm test -w @agentstride/example-data-export
npm test -w @agentstride/example-velum-grid-nestjs
```

### T4 — Evals (decisiones)
```bash
npm run eval:enterprise-support
npm run eval:human-approval
npm run eval:alarm-triage
npm run eval:change-gate
npm run eval:data-export
```

### T5 — Monorepo completo
```bash
npm test
```

### T6 — Demos offline (smoke de salida)
```bash
npm start -w @agentstride/example-alarm-triage
npm start -w @agentstride/example-change-gate
npm start -w @agentstride/example-data-export
npm start -w @agentstride/example-human-approval
npm run examples:smoke
```

### T7 — Empaquetado
```bash
npm run package:dry-run
```

### T8 — Live (opcional)
Only if `OPENROUTER_API_KEY` or `OPENAI_API_KEY` is set:
```bash
npm start -w @agentstride/example-live-tool
```
Otherwise mark **skipped**.

## Automation

```bash
node scripts/validation-battery.mjs
```

Writes:
- `docs/engineering/validation-battery.last.json` (gitignored)
- updates analysis section via operator / follow-up note `VALIDATION_BATTERY_RESULTS.md`

## Pass criteria (“estamos bien”)

| Criterion | Bar |
| --- | --- |
| T0 | all green |
| T1–T3 | all green |
| T4 | every suite `failed = 0` |
| T5 | all workspaces `# fail 0` |
| T6 | processes exit 0; no thrown errors |
| T7 | dry-run PASSED |
| T8 | skipped OK without keys |

**Verdict bands**
- **GREEN** — all required tiers pass  
- **YELLOW** — required pass but demos/dry-run flaky or live skipped with intent to run later  
- **RED** — any T0–T5 failure  

## How to use the verdict

After a GREEN run, treat offline/fake-mode claims as evidence-backed.

After YELLOW/RED: fix failures before relying on those claims in docs or releases.
