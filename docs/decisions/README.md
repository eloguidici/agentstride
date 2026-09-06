# Decision log

This folder records architectural decisions while the project evolves.

The goal is not to create paperwork.

A decision belongs here when future us could reasonably ask:

> Why did we do it this way?

Initial decisions to document:

- keep the core provider-agnostic;
- tools receive typed input and context, not runtime messages;
- no RxJS dependency in core;
- no workflow engine in v1;
- RAG, MCP and NestJS live outside core;
- local and remote agents should eventually share a common capability contract;
- portability is a design constraint, not a promise added later.
