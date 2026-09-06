# Roadmap

This roadmap is intentionally conservative.

## v0 - foundation

- project structure;
- core interfaces;
- first agent loop;
- typed tools;
- structured output;
- execution context;
- basic run tracing;
- tests;
- simple examples.

## v0.x - useful integrations

Likely candidates:

- OpenAI provider;
- memory interface;
- RAG package;
- MCP package;
- NestJS integration.

These should not force changes into the core unless there is a strong reason.

## Later

Possible areas (only after stabilize / real use cases):

- stronger remote agents;
- fuller A2A protocol client (today: experimental HTTP AgentLike sketch);
- OpenTelemetry export;
- approval / policy helpers.

Local delegation, migration helpers, and Nest/MCP/RAG packages already exist in incubation form on `main`.

## Explicitly not planned for the first version

- durable distributed workflows;
- workflow designer;
- scheduler;
- chat channels;
- hosting platform;
- marketplace;
- built-in vector database;
- large provider catalog.

If these start showing up too early, we are probably drifting.
