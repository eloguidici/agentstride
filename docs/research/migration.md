# Migration research notes

Status: Phase 13 starter

AgentStride tools are intentionally portable:

- typed/plain `execute(input, context)`
- optional Standard Schema / JSON Schema parameters
- no AgentStride message envelopes in domain tools

`@agentstride/migrate` exposes `toPortableTool()`, `toMastraTool()` and `toLangChainTool()` as thin extractions of that contract.

Real wrapping into Mastra/LangChain constructors should happen in application code or later dedicated adapters once those APIs are pinned for examples.
