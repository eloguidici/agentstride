# ADR 0001 - Keep the core small

Status: Accepted

## Context

The project exists partly because agent frameworks tend to accumulate abstractions quickly.

It is easy to justify every new feature individually and still end up with a runtime that is difficult to understand.

## Decision

The first version of AgentStride will keep the core limited to the primitives required to run an agent, execute tools, carry context, return structured results and observe execution.

Integrations such as RAG, MCP, NestJS, storage and provider-specific behavior belong in separate packages where possible.

## Consequences

The core may offer fewer conveniences than larger frameworks.

That is acceptable.

The benefit is that users can understand what is happening and application code is less likely to depend on AgentStride-specific infrastructure.
