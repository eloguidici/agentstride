# Ideas Agentic AI — 2026-09-18

## Objetivo

Convertir ideas recientes del ecosistema agentic en posibles capacidades diferenciales de AgentStride, manteniendo el foco del framework: simple, TypeScript/Node.js, portable y usable sin imponer infraestructura pesada.

## Prioridad alta

### 1. Tool Manifest enriquecido
Cada tool debería poder declarar metadata operativa y de seguridad.

Propuesta de contrato:

```ts
interface AgentToolManifest {
  name: string;
  description?: string;
  risk: 'read' | 'write' | 'external' | 'irreversible';
  requiredScopes?: string[];
  idempotency?: 'guaranteed' | 'requires-key' | 'none';
  compensatable?: boolean;
  timeoutMs?: number;
  requiresApproval?: boolean;
}
```

El runtime debe usar esta metadata para validar ejecución, retries y approvals.

### 2. Execution Budget
Agregar límites por `AgentRun`:
- máximo de pasos;
- máximo de tool calls;
- timeout;
- token budget;
- costo estimado;
- detector de llamadas repetidas.

El runtime debe cortar de forma controlada y devolver motivo estructurado.

### 3. Tool discovery progresivo
No enviar todas las tools al modelo siempre.

Agregar:
- `ToolRegistry`;
- búsqueda por nombre/metadata/keywords;
- filtros por permisos y riesgo;
- carga temporal de las tools relevantes.

Objetivo: menos tokens y mejor selección de herramientas.

### 4. Guards alrededor de cada tool
Pipeline sugerido:

```text
Agent proposal
  -> ToolInputGuard
  -> Policy
  -> Execute
  -> ToolOutputGuard
  -> Agent
```

Permitir guards customizables y composición de middleware.

### 5. Tracing/evals como primitivas
Emitir eventos estructurados de:
- agent start/end;
- model call;
- tool call;
- retry;
- guard decision;
- approval;
- cost/tokens;
- error.

Diseñar integración amigable con OpenTelemetry y evaluadores externos.

## Prioridad media

### 6. Runtime abstraction
Separar agente de proveedor/runtime:

```ts
interface AgentRuntime {
  run(input: AgentRunInput): Promise<AgentRunResult>;
  resume?(runId: string): Promise<AgentRunResult>;
  cancel?(runId: string): Promise<void>;
}
```

### 7. Skills bajo demanda
Explorar un `SkillRegistry` similar al `ToolRegistry`, para cargar instrucciones específicas sólo cuando corresponda.

### 8. Human approval
Primera implementación simple:
- run entra en estado `waiting_approval`;
- persiste payload;
- un approval externo reanuda;
- no repetir side effects ya completados.

### 9. MCP y A2A
Mantener fronteras claras:
- MCP para agent -> tool/service;
- A2A para agent -> agent externo/independiente.

AgentStride debería facilitar ambos sin mezclarlos.

## No hacer todavía

- autoaprendizaje de skills sin evals;
- memoria autónoma append-only;
- sandboxes complejos como dependencia obligatoria;
- control plane distribuido grande.

Primero mantener el framework pequeño.

## Orden sugerido

1. Tool Manifest.
2. Execution Budget.
3. Tool Guards.
4. Tracing.
5. Tool Discovery.
6. Approval/resume.
7. Skills.
8. Integraciones MCP/A2A.

## Resultado esperado

AgentStride puede diferenciarse por ser un framework pequeño pero con garantías de producción incorporadas desde el diseño, en vez de limitarse al loop `LLM -> tool -> LLM`.
