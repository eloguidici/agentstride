# Vision

AgentStride should make it easy to build a useful agent without forcing the project into a large framework from day one.

The main goal is not to have fewer features than other frameworks.

The goal is to make complexity optional.

A small project should be able to start with:

```text
Agent -> Tools -> Result
```

and later add things like RAG, memory, MCP or other agents if they are actually needed.

## Design rules

A few rules we want to keep ourselves honest with:

1. The core should be understandable in an afternoon.
2. Domain tools should not depend on AgentStride-specific message objects.
3. TypeScript types should do real work for the user.
4. Optional features should stay optional.
5. We should be able to explain why every core abstraction exists.
6. If a project outgrows AgentStride, leaving should be a reasonable option.

## What AgentStride is not trying to be

At least for now, it is not trying to become:

- a hosted agent platform;
- a visual workflow builder;
- a scheduler;
- a chat-channel product;
- an agent marketplace;
- a vector database;
- a durable distributed workflow engine.

Those may be valid products. They are just not the problem this project is trying to solve.
