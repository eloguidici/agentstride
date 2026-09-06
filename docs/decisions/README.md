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
- [0005](0005-tool-input-schemas.md) - validate tool inputs with Standard Schema, not a Zod hard dependency.

Still guiding the roadmap:

- no workflow engine in v1;
- RAG, MCP and NestJS live outside core;
- local and remote agents should eventually share a common capability contract;
- portability is a design constraint, not a promise added later.
