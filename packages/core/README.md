# @agentstride/core

Smallest set of primitives required to run an AgentStride agent.

The API is intentionally not frozen yet.

Currently available:

- `createAgent()`
- `defineTool()` with optional Standard Schema `inputSchema`
- `Model` contract
- execution context
- `ToolInputValidationError`

Still ahead in core:

- structured output
- AgentRun / lifecycle events
- hooks / guards

Integrations such as providers, RAG, MCP and NestJS belong in separate packages.

See `docs/decisions/0005-tool-input-schemas.md` for the schema decision.
