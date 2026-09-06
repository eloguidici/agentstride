# @agentstride/core

This package will contain the smallest set of primitives required to run an AgentStride agent.

The API is intentionally not frozen yet.

Before adding abstractions here, we will test them against the initial use cases documented in `docs/use-cases.md`.

Current candidates:

- Agent
- Tool
- Model
- Context
- AgentRun
- AgentEvent
- structured output
- hooks / guards

If a concept can live in an integration package instead of the core, that is the preferred direction.
