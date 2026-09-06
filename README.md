# AgentStride

AgentStride is a small TypeScript runtime for building AI agents without committing too early to a large framework.

The idea is simple: start with the smallest set of primitives that lets you build something useful, and only add complexity when the problem actually needs it.

This project is still in incubation and the repository is private for now.

## What we are trying to solve

In early agent projects there is usually a bad choice between two extremes:

- write ad-hoc model calls that become hard to maintain;
- adopt a large framework before you fully understand the problem.

AgentStride is an attempt to sit in the middle.

The core should stay small enough to understand quickly. Tools, prompts, schemas and domain logic should remain portable. RAG, MCP, memory, NestJS and remote-agent support should be optional layers, not reasons to make the core bigger.

If AgentStride is enough, stay on it.

If the system grows into something that needs durable workflows, complex state graphs or a larger platform, moving to something like Mastra or LangGraph should not require rewriting the business logic.

## Current direction

The core is expected to revolve around a few concepts:

- Agent
- Tool
- Model
- Context
- AgentRun
- AgentEvent
- structured output
- hooks and guards

That list is intentionally short.

## Where this came from

AgentStride is influenced by an older multi-agent architecture I built for an enterprise use case.

That system had concepts such as `AutonomousAgent`, `AutonomousIAAgent`, `ReceptionistAgent`, `AgentEvent`, correlation IDs and fan-out/fan-in coordination.

Some of those ideas aged well. Some of the implementation did not.

This project is a chance to keep the useful parts and simplify the rest.

More details: [docs/origins.md](docs/origins.md)

## Docs

- [Vision](docs/vision.md)
- [Origins and lessons learned](docs/origins.md)
- [Use cases](docs/use-cases.md)
- [Roadmap](docs/roadmap.md)
- [Decision log](docs/decisions/README.md)
