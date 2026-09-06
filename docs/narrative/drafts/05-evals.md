# Draft 05 — Evals measure behavior, not just code

Status: **draft** (not published)  
Pack: 1 · Story order: 5/5

## Title

Si solo testeás tools, no sabés si el agente decide bien

## Hook

Un unit test verde prueba que `openTicket` existe. No prueba que, ante un ping de heartbeat, el agente **no** abrió ticket ni propuso un page.

## Problem

Los agentes fallan por **decisiones**:

- llamaron de más / de menos;
- marcaron `paged: true` sin aprobación;
- devolvieron structured output inválido;
- ignoraron el rol.

Hace falta un harness que fije el modelo (scripted), corra el agente y **scoreé comportamiento**.

## Architecture / code insight

`evals/` en AgentStride:

```text
cases.json  →  scripted model steps  →  agent.run
                    ↓
         scorers: mustCall / mustNotCall /
                  structured fields / postAssert
                    ↓
              baseline JSON (regresión)
```

Suites: enterprise-support (~22), human-approval (3), alarm-triage (7), change-gate (5), data-export (3).

Validación local reciente: batería T4 **GREEN** (`docs/engineering/VALIDATION_BATTERY_RESULTS.md`).

## Evidence

| Artifact | Rol |
| --- | --- |
| `evals/` + baselines | Harness |
| `docs/research/evaluation-harness.md` | Diseño |
| PR #8 | Aterrizaje |
| `npm run eval:*` | Comandos reproducibles |

## Diagram / snippet candidates

Tabla caso → expected action → pass/fail; ejemplo `mustNotCall: ["approvePage"]`.

## Limitation / trade-off

- Son evals **deterministas** (fake/scripted), no benchmark de LLM live.
- No reemplazan monitoreo en producción ni red-teaming.
- Un baseline verde no implica “production-ready” mágico.

## Takeaway

Tratá las decisiones del agente como producto testeable — no solo el wiring de tools.

## LinkedIn angle (corto)

> Tests de tools ≠ tests de agentes.  
> Armamos evals con modelo scripted: mustCall / mustNotCall / structured output / postAssert.  
> ~40 casos offline en verde en la validation battery.  
> Evals measure behavior, not just code.

## Article outline (largo)

1. El falso consuelo del unit test  
2. Qué scoreamos  
3. Un caso alarm-triage / approval en detalle  
4. Baselines como regresión  
5. Cómo encaja con CI local (`validate:battery`)  
6. Qué no medimos (live LLM)  

## Source links

- `evals/`  
- `docs/research/evaluation-harness.md`  
- `docs/engineering/VALIDATION_BATTERY.md`  
- `docs/engineering/VALIDATION_BATTERY_RESULTS.md`
