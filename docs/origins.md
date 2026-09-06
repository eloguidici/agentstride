# Origins

Before starting AgentStride I went back to an older multi-agent system I had built for an enterprise project.

That code is useful **technical history**: many problems we discuss now (delegation, correlation, orchestration weight) already showed up there, even though AgentStride is a separate design. This section does not describe any employer’s current product, customer data, or confidential systems.

## What the old system had

The architecture included concepts such as:

- `AutonomousAgent`
- `AutonomousIAAgent`
- `ReceptionistAgent`
- `AgentEvent`
- `MessageDto`
- `ActionDto`
- `TaskMemoryService`
- request correlation
- agent delegation
- fan-out / fan-in coordination

The system used an RxJS event bus so agents could communicate without calling each other directly.

The `ReceptionistAgent` acted as a first routing layer and delegated work to specialized agents.

## What was good about it

A few ideas still make sense today:

- agents and tools were separate concepts;
- a coordinator could delegate work dynamically;
- delegated work was correlated with a request id;
- an agent did not need to know the internal implementation of another agent;
- agent communication was treated as an orchestration problem, not just a chat problem.

Those ideas are worth keeping.

## What we would not repeat

The implementation also accumulated complexity:

- a global RxJS bus;
- message objects coupled to the runtime;
- a lot of infrastructure for simple agent calls;
- weak typing in several boundaries;
- concurrency risks in fan-in handling;
- lifecycle concerns around subscriptions;
- application-specific concerns mixed with runtime concerns.

AgentStride should not reproduce that architecture with new names.

The point is to simplify it.

## The nostalgic parts

Some names will stay around as a small nod to the original project.

`ReceptionistAgent` is a good candidate for an official example.

`AgentEvent` may survive as a lifecycle / observability concept, although not as the old global event bus.

`AutonomousAgent` is part of the history of the project, but probably not the name of the main public abstraction.

The important inheritance is not the class names. It is the idea that an agent should be able to delegate work without being tightly coupled to how the delegated capability is implemented.
