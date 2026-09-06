# ADR 0005 - Tool input schemas via Standard Schema

Status: Accepted

## Context

The first runtime slice executes tools with `input: unknown` from the model.

That is enough to prove the loop, but it is not enough for real application code.

We need a tool to declare its input contract once and get:

- TypeScript inference in `execute`;
- runtime validation before domain code runs;
- schema information that future provider adapters can turn into LLM tool definitions.

Options considered:

### 1. Depend directly on Zod in core

Pros:

- excellent DX in current TypeScript projects;
- Zod 4 can validate and emit JSON Schema from one declaration;
- familiar to many backend teams.

Cons:

- makes a validation library part of the core contract;
- forces Valibot / ArkType / other users through an adapter or a second schema;
- Zod's own library guidance recommends Standard Schema for black-box validation APIs.

### 2. Invent a tiny AgentStride schema contract + Zod adapter

Pros:

- core stays independent of Zod.

Cons:

- creates an AgentStride-specific schema language;
- duplicates work the ecosystem already standardized;
- increases ceremony for the common case.

### 3. Accept Standard Schema, with Standard JSON Schema when available

Pros:

- library-neutral validation contract;
- TypeScript inference through `StandardSchemaV1.InferOutput`;
- Zod, Valibot, ArkType and others already implement it;
- Standard JSON Schema gives provider adapters a portable way to obtain JSON Schema without hard-coding Zod;
- core dependency can stay type-level (`@standard-schema/spec`);
- users still author schemas with Zod or another library they already use.

Cons:

- not every Standard Schema implementation can emit JSON Schema yet;
- providers still need an adapter layer to map JSON Schema into SDK-specific tool formats.

### 4. JSON Schema only

Pros:

- closest to what many model APIs already consume.

Cons:

- weak ergonomics for TypeScript inference unless we add codegen or a second library;
- worse DX than schema libraries teams already use.

## Decision

AgentStride core accepts **Standard Schema V1** for tool input validation and inference.

When a schema also implements **Standard JSON Schema V1**, the runtime may derive JSON Schema for `ToolDefinition.parameters`.

Zod is the **recommended authoring library**, not a core runtime dependency.

Phase 1 covers **input validation only**. Tool output validation can wait until structured output / harder boundary cases justify it.

`inputSchema` remains optional so simple examples and progressive adoption stay possible. Tools without a schema keep the previous `unknown` behavior.

## Consequences

- Core does not import Zod.
- Provider packages should read `ToolDefinition.parameters` rather than special-casing Zod.
- Projects already on Zod can pass Zod schemas directly.
- Projects on other Standard Schema libraries can do the same for validation; JSON Schema availability depends on that library.
- Invalid model tool arguments fail before `execute` with a dedicated validation error.
