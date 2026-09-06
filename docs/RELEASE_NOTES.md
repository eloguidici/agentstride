# Release notes

## 0.1.0 (planned — not published yet)

First intended public cut of:

- `@agentstride/core`
- `@agentstride/openai`

License: MIT. Pre-1.0: breaking changes may occur before 1.0 with release notes.

### Highlights

- Small provider-agnostic agent runtime: `createAgent`, `defineTool`, Standard Schema tool/output validation, `AgentRun` + lifecycle events
- Cooperative cancellation (`AbortSignal`) including nested local agents
- Optional `parentRunId` causality without a global event bus
- OpenAI-compatible Chat Completions adapter via `fetch` (no `openai` SDK required)
- Evidence examples for human approval, idempotent side effects, OTel bridge, Nest/HTTP embed, decision evals

### Install (after publish)

```bash
npm install @agentstride/core @agentstride/openai
```

### Not in this release

- npm publish of `rag`, `memory`, `mcp`, `nestjs`, `migrate`, `a2a` (remain private/unpublished)
- Hosted control plane / workflow engine / policy engine

### Upgrade notes

Incubation used `0.0.0` private packages. There is no supported upgrade path from unpublished tarballs; treat `0.1.0` as the first public baseline.

---

## 0.0.0-incubation (historical)

Private incubation snapshot prior to Gate 2/3 decisions.

Included core runtime, optional packages, examples, Nest HTTP demos, and publish readiness tooling — without public npm.
