# Release notes

## 0.1.3 (docs)

Clarify audience:

- README **Who it is for** — POCs/demos/spikes, path to production, and when not to use
- Package READMEs / npm `description` mention POC → production without a platform

No runtime API changes.

```bash
npm install @agentstride/core@0.1.3 @agentstride/openai@0.1.3
```

---

## 0.1.2 (docs)

Clarify package purpose on npm:

- Stronger `description` + README openers for `@agentstride/core` and `@agentstride/openai`
- Point npm readers at the GitHub README for problem / when-to-use

No runtime API changes.

```bash
npm install @agentstride/core@0.1.2 @agentstride/openai@0.1.2
```

---

## 0.1.1 (docs)

Documentation alignment for the published packages:

- Package READMEs use absolute GitHub links (usable from the npm package page)
- Install snippets assume `@agentstride/core` / `@agentstride/openai` are on the registry
- Owner/process docs moved out of the product repo

No runtime API changes.

```bash
npm install @agentstride/core@0.1.1 @agentstride/openai@0.1.1
```

---

## 0.1.0

First public cut of:

- `@agentstride/core`
- `@agentstride/openai`

License: MIT. Pre-1.0: breaking changes may occur before 1.0 with release notes.

### Highlights

- Small provider-agnostic agent runtime: `createAgent`, `defineTool`, Standard Schema tool/output validation, `AgentRun` + lifecycle events
- Cooperative cancellation (`AbortSignal`) including nested local agents
- Optional `parentRunId` causality without a global event bus
- OpenAI-compatible Chat Completions adapter via `fetch` (no `openai` SDK required)
- Evidence examples for human approval, idempotent side effects, OTel bridge, Nest/HTTP embed, decision evals

### Install

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

Private incubation snapshot prior to the first public cut.

Included core runtime, optional packages, examples, Nest HTTP demos, and publish readiness tooling — without public npm.
