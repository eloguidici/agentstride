# ADR 0004 - Keep the core model-provider agnostic

Status: Accepted

## Context

The first usable AgentStride slice needs a model, but choosing OpenAI, Anthropic or another SDK as a core dependency would make provider details part of the runtime before we know that they belong there.

The older system also taught us that integration details spread quickly once they enter shared abstractions.

## Decision

Core depends on a small `Model` contract:

```ts
interface Model {
  generate(request: ModelRequest): Promise<ModelResponse>;
}
```

Provider packages will translate that contract to real SDKs.

The first example uses a fake model on purpose. It lets us test the agent loop without pretending that provider integration is already solved.

## Consequences

A provider adapter will need to translate messages, tools and tool calls.

That translation is acceptable. It gives us a place to contain provider-specific behavior instead of leaking it into agents and domain tools.
