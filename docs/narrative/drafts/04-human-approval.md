# Draft 04 — The agent is not its own approver

Status: **draft** (not published)  
Pack: 1 · Story order: 4/5

## Title

El agente no debería aprobarse a sí mismo

## Hook

Si el modelo tiene una tool `approveProductionAccess`, el “control humano” es teatro: el mismo loop que quiere el side effect puede invocarlo.

## Problem

Acciones sensibles (grant de acceso, page on-call, execute change, export PII) necesitan:

1. que el agente **proponga**;
2. que un humano/rol externo **decida**;
3. que el dominio **ejecute una vez**, con audit.

Meter approve dentro del toolset del agente rompe (2).

## Architecture / code insight

Patrón en example 20 (y repetido en Velum 23–25):

```text
agent: proposeX  →  proposal pending, sideEffect=false
app:  POST /.../approve  →  roles check → execute
app:  POST /.../reject   →  no execute
```

- Core: no hay motor de políticas.
- Roles (`admin`, `sre-approver`, `change-approver`, `privacy-officer`) viven en **dominio/aplicación**.
- Evals: `mustNotCall` approve; `paged`/`executed`/`exported` false hasta post-assert externo.

## Evidence

| Artifact | Rol |
| --- | --- |
| `examples/20-human-approval/` | Propose → HTTP approve |
| `evals/human-approval/` | Decisiones scripted |
| `docs/research/human-approval.md` | Trade-offs |
| examples 23–25 | Page / execute / export |

## Diagram / snippet candidates

Secuencia propose/approve; 403 si el rol del agente intenta approve; idempotent re-approve.

## Limitation / trade-off

- AgentStride **no** es un producto GRC.
- No afirma compliance legal; afirma un patrón de ejecución.
- Quien implementa roles mal, aprueba mal — la responsabilidad es de la app.

## Takeaway

Human-in-the-loop real = el aprobador está **fuera** del tool loop del modelo.

## LinkedIn angle (corto)

> Si tu agente tiene tool `approve`, no tenés aprobación humana: tenés autoengaño.  
> Patrón: propose en el agente; approve en un endpoint con roles.  
> Example 20 + evals. El agente no es su propio aprobador.

## Article outline (largo)

1. Historia del flag `requiresHumanApproval` que no ejecutaba nada  
2. Anti-patrón approve-as-tool  
3. Diseño propose/pending/execute  
4. Tests y evals que lo clavan  
5. Cómo se repite en alarmas/cambios/export  
6. Límites honestos  

## Source links

- `examples/20-human-approval/`  
- `evals/human-approval/`  
- `docs/research/human-approval.md`  
- `examples/23-alarm-triage/`, `24-change-gate/`, `25-data-export/`
