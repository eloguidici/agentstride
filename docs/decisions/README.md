# Decision log

This folder records architectural decisions while the project evolves.

The goal is not to create paperwork.

A decision belongs here when future us could reasonably ask:

> Why did we do it this way?

Documented decisions:

- [0001](0001-small-core.md) - keep the core small;
- [0002](0002-tools-are-portable.md) - tools receive typed input and context, not runtime messages;
- [0003](0003-no-event-bus-in-core.md) - no RxJS / global event bus in core;
- [0004](0004-provider-agnostic-core.md) - keep the core model-provider agnostic;
- [0005](0005-tool-input-schemas.md) - validate tool inputs with Standard Schema, not a Zod hard dependency;
- [0006](0006-structured-output.md) - validate structured output in core via Standard Schema;
- [0007](0007-agent-run-events.md) - AgentRun lifecycle events without a bus;
- [0008](0008-hooks-and-guards.md) - thin hooks and guards, not a policy engine.

Still guiding the roadmap:

- no workflow engine in v1;
- RAG, MCP and NestJS live outside core;
- local and remote agents should eventually share a common capability contract;
- portability is a design constraint, not a promise added later;
- repository stays private until Phase 14 is intentionally triggered for public release.
