# Draft 02 — Cancellation is not Promise.race

Status: **draft** (not published)  
Pack: 1 · Story order: 2/5

## Title

Cancelar el Promise no cancela el agente

## Hook

En un HTTP handler es tentador hacer `Promise.race(agent.run(...), timeout)`. El request “termina”. El modelo, la tool o el especialista anidado **pueden seguir vivos**.

## Problem

`Promise.race` solo decide qué promesa gana ante el await. No propaga cancelación cooperativa al trabajo en vuelo. En agentes eso significa:

- tokens que siguen gastándose;
- tools con side effects que siguen ejecutándose;
- nested agents (`asAgentTool`) que no se enteran de que el cliente cerró la conexión.

## Architecture / code insight

AgentStride usa `AbortSignal` de punta a punta ([ADR 0009](../../decisions/0009-abort-signal-cancellation.md)):

- timeout / `run({ signal })` / cierre HTTP → mismo canal;
- nested local agents reciben el signal del padre ([ADR 0010](../../decisions/0010-nested-agent-cancellation.md)).

```text
HTTP close → AbortController.abort()
                → parent run signal
                    → asAgentTool → child run({ signal })
                        → fetch(model) / tool checks signal
```

`runWithDeadline` existe porque “ganar el race” no es suficiente.

## Evidence

| Artifact | Rol |
| --- | --- |
| ADR 0009 / 0010 | Contrato de cancelación |
| `packages/core/test/nested-cancellation.test.mjs` | Prueba anidada |
| `docs/research/nested-cancellation.md` | Investigación |
| Nest/HTTP examples | `req` close → abort |

## Diagram / snippet candidates

Wrong:

```ts
await Promise.race([agent.run(input), sleep(ms)]);
```

Right (conceptual):

```ts
await agent.run(input, { signal: req.signal });
// nested asAgentTool forwards signal into child run
```

## Limitation / trade-off

- Es **cooperativo**: el código de tools/providers debe respetar el signal.
- El adapter OpenAI reenvía signal a `fetch`; no todos los SDKs del mundo cancelan igual — no afirmar magia universal.
- No “matamos threads”; abortamos trabajo que escucha.

## Takeaway

Si tu cancelación no llega al nested agent, no tenés cancelación: tenés un timeout cosmética.

## LinkedIn angle (corto)

> Creí que `Promise.race` alcanzaba para cortar un agente cuando el HTTP se cerraba.  
> Mentira útil: el outer promise termina; el tool/modelo anidado puede seguir.  
> ADR 0009/0010: `AbortSignal` hasta nested `asAgentTool`.  
> Cancellation is not Promise.race.

## Article outline (largo)

1. Repro mental: request abortido, logs que siguen  
2. Por qué race engaña  
3. AbortSignal como contrato  
4. Nested cancel (ADR 0010)  
5. Test que lo clava  
6. Límites honestos del provider  
7. Checklist para backends Nest/Express  

## Source links

- `docs/decisions/0009-abort-signal-cancellation.md`  
- `docs/decisions/0010-nested-agent-cancellation.md`  
- `packages/core/test/nested-cancellation.test.mjs`  
- `docs/research/nested-cancellation.md`
