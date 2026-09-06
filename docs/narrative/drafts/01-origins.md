# Draft 01 — Origins: Receptionist without the bus

Status: **draft** (not published)  
Pack: 1 · Story order: 1/5  
Language: ES (public voice) / evidence paths EN

## Title

Del Receptionist con bus global a un runtime chico: qué conservamos y qué tiramos

## Hook

Construir agentes especializados y un Receptionist que delega no es nuevo. Lo que suele envejecer mal es el **bus global de eventos** y los DTOs acoplados al runtime: infraestructura que aparece antes de que el producto la necesite.

## Problem

En arquitecturas multi-agente “enterprise” tempranas es fácil acumular:

- un bus (p. ej. RxJS) para que nadie se llame directo;
- mensajes/`ActionDto`/`MessageDto` que filtran a las tools;
- correlación y fan-out… más el costo de suscripciones y tipado débil.

El dolor no es “tener un Receptionist”. El dolor es **pagar orquestación pesada** cuando lo que querías era delegar con claridad.

## Architecture / code insight

AgentStride conserva la idea útil:

- un coordinador puede delegar;
- el especialista no necesita conocer el bus;
- la correlación puede vivir en el run, no en un fabric global.

Y rechaza el bus en core ([ADR 0003](../../decisions/0003-no-event-bus-in-core.md)):

```text
Antes:  Agent A ⇄ Bus ⇄ Agent B
Ahora:  Receptionist --asAgentTool--> Specialist.run(...)
```

`AgentEvent` sobrevive como **ciclo de vida del AgentRun**, no como bus de aplicación.

## Evidence

| Artifact | Rol |
| --- | --- |
| `docs/origins.md` | Historia técnica (sin nombres de empleador/cliente) |
| `docs/vision.md` | Complejidad opcional |
| ADR 0003 | Sin event bus en core |
| examples `04-receptionist`, `17-enterprise-support-agent` | Delegación local real |
| ADR 0011 | Causalidad padre/hijo sin bus |

## Diagram / snippet candidates

```text
ReceptionistAgent
    └─ asAgentTool(securityAgent)
         └─ AgentRun { parentRunId }
```

Snippet: `asAgentTool` + `agent.run` en example 04/17.

## Limitation / trade-off

- No es un rewrite público de un producto propietario: es un **diseño nuevo** inspirado en lecciones.
- Observabilidad distribuida tipo OTel **no** vive en core (ADR 0012) — el host la agrega.
- A2A remoto sigue experimental (`@agentstride/a2a`).

## Takeaway

Delegación y correlación no exigen un bus. Exigen un runtime chico y límites claros entre dominio y orquestación.

## LinkedIn angle (corto)

> Volví a un diseño viejo con Receptionist + agentes especializados + bus RxJS.  
> La lección no fue “matar al Receptionist”. Fue: el bus global y los DTOs de runtime envejecen peor que la delegación.  
> En AgentStride dejamos `asAgentTool` + `AgentRun`, y el bus fuera del core (ADR 0003).  
> Build simple. Grow deliberately.

## Article outline (largo)

1. Escena: Receptionist que enruta  
2. Qué valía la pena del diseño viejo  
3. Qué complejidad sobraba (bus, DTOs, fan-in)  
4. Mapa AgentStride: tools portables, sin bus  
5. Example 04/17 como prueba  
6. Qué no estamos prometiendo (plataforma hosted, A2A completo)  
7. Cierre + links a origins/ADR

## Source links

- `docs/origins.md`  
- `docs/decisions/0003-no-event-bus-in-core.md`  
- `examples/04-receptionist/`  
- `examples/17-enterprise-support-agent/`  
- `docs/decisions/0011-run-causality.md`
