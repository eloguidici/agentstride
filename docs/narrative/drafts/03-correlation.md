# Draft 03 — Correlation without a bus

Status: **draft** (not published)  
Pack: 1 · Story order: 3/5

## Title

Correlación multi-agente sin recuperar el event bus

## Hook

Cuando sacás el bus, alguien pregunta: “¿y cómo correlacionamos padre e hijo?”. La respuesta mala es volver a meter un fabric global. La respuesta de AgentStride es **causalidad en el run**.

## Problem

Sin bus:

- el Receptionist delega a un especialista;
- necesitás reconstruir “esto fue hijo de aquello” para debug, evals y audits;
- no querés reintroducir pub/sub de aplicación en el core.

## Architecture / code insight

[ADR 0011](../../decisions/0011-run-causality.md):

- `parentRunId` opcional en `AgentRun`;
- `context.agentRunId` disponible para tools/dominio;
- nested `asAgentTool` conecta la cadena sin un EventBus.

```text
run_parent
  └─ run_child (parentRunId = run_parent.id)
       └─ events[] filtrables por causalidad
```

OTel puede mapear esos runs a spans **fuera** de core (ADR 0012) — correlación ≠ vendor lock de tracing.

## Evidence

| Artifact | Rol |
| --- | --- |
| ADR 0011 | Modelo padre/hijo |
| `docs/research/run-causality.md` | Notas |
| PR #10 | Aterrizaje |
| examples 04 / 17 | Delegación real |

## Diagram / snippet candidates

Árbol de runs; tabla `id / parentRunId / status`; filtro de eventos por `agentRunId`.

## Limitation / trade-off

- Esto es **local nested** primero; A2A remoto no está “listo” (`@agentstride/a2a` experimental).
- No reemplaza un APM completo: es el gancho mínimo para no mentir sobre multi-agente.

## Takeaway

Podés tener correlation IDs sin un bus. El bus era una implementación, no el requisito.

## LinkedIn angle (corto)

> Sacamos el event bus del core (ADR 0003).  
> ¿Perdimos correlación? No: `parentRunId` / `agentRunId` (ADR 0011).  
> Multi-agente observable sin fabric global.  
> Correlation without a bus.

## Article outline (largo)

1. Miedo post-bus  
2. Qué datos mínimos necesitás  
3. ADR 0011 en la práctica  
4. Cómo se ve en un Receptionist  
5. Puente a OTel (sin meter OTel en core)  
6. Qué queda para remoto  

## Source links

- `docs/decisions/0011-run-causality.md`  
- `docs/research/run-causality.md`  
- `docs/decisions/0003-no-event-bus-in-core.md`  
- `docs/decisions/0012-opentelemetry-out-of-core.md`
