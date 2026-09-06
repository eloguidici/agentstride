# Development log

This is a lightweight running log of meaningful project changes.

It is not meant to duplicate Git history. It exists to preserve context that may later be useful when writing release notes, technical posts or explaining why the project evolved in a certain direction.

## 2026-09-05 - Project foundation

- Chose the working name AgentStride after checking for obvious collisions in GitHub and the AI agent ecosystem.
- Created the repository privately while the architecture is still being shaped.
- Decided that the eventual consumption model should be npm packages rather than requiring users to clone the repository.
- Kept the source repository as the future public reference for code, examples, architecture and contribution.
- Documented the connection to an earlier enterprise multi-agent architecture.
- Decided to keep nostalgic references such as ReceptionistAgent and AgentEvent where they still make architectural sense.
- Explicitly rejected copying the old RxJS event bus into the new core.
- Defined portability as a design constraint: tools and domain logic should not depend on AgentStride-specific message envelopes.
- Started with npm workspaces and a deliberately empty core package. The public API will be shaped by examples before it is frozen.

## 2026-09-05 - First runtime slice

- Added the first `Model`, `Tool`, `Agent` and `run()` contracts.
- Kept the model contract provider-agnostic. OpenAI is deliberately not a core dependency.
- Implemented the smallest useful tool-calling loop: model -> tool -> model -> result.
- Added `maxSteps` as a basic protection against accidental infinite loops.
- Passed execution context to tools without introducing a runtime-specific message DTO.
- Added behavior tests for direct responses, tool execution, unknown tools and max-step exhaustion.
- Added a provider-free example so the core can be exercised before provider adapters exist.
- Runtime input validation for tool arguments is intentionally not solved yet. The next design step is to decide how schemas fit without coupling the core to one validation library.

## 2026-09-05 - Codex handoff

- Consolidated the current state into `docs/handoffs/CURRENT_PROJECT_HANDOFF_2026-09-05.md`.
- Added a phased implementation plan in `docs/IMPLEMENTATION_PLAN.md`.
- Kept the next technical decision focused on typed runtime schemas for tools before adding provider integrations.
- Recorded explicit scope boundaries to reduce the risk of AgentStride drifting into another large agent platform.
- Documented the expected working style for future sessions: small coherent commits, tests, ADRs for important decisions and a human technical writing tone.

## 2026-09-05 - Multi-tool development workflow

- Made cross-tool continuity an explicit project requirement.
- AgentStride may be developed interchangeably from ChatGPT, Codex and Cursor.
- The repository documentation is the shared memory between tools; conversational context must not be required to continue.
- Future sessions should leave meaningful progress in the development log, architectural decisions in ADRs, plan changes in the implementation plan and the latest starting point in the current handoff.
- The goal is to be able to switch development environments without losing decisions, redoing analysis or asking the owner to repeat context.

## 2026-09-05 - Typed tool schemas (Phase 1)

- Evaluated Zod-in-core, a custom schema contract, Standard Schema, and JSON Schema-only.
- Accepted ADR 0005: validate tool inputs through Standard Schema V1; derive JSON Schema through Standard JSON Schema V1 when the library supports it.
- Kept Zod out of `@agentstride/core` runtime dependencies. It remains the recommended way to author schemas.
- Extended `defineTool()` with optional `inputSchema`, TypeScript inference, and derived `parameters`.
- Agent execution now validates model tool arguments before calling `execute`.
- Added `ToolInputValidationError` with issue details.
- Deferred tool output validation until structured output / harder boundaries justify it.
- Updated the fake-model example to pass a Zod schema and show parameters reaching the model.
- Tests: 8 passing, including valid input, invalid input, untyped tools, and JSON Schema derivation.

## 2026-09-05 - Live OpenRouter vertical slices

- Confirmed OpenRouter works with `@agentstride/openai`.
- Added `examples/08-live-tool`: real tool calling (`findCustomer`) against OpenRouter.
- Added `examples/09-live-structured`: real structured output validation against OpenRouter.
- Adapter now injects JSON Schema hints for structured output and retries without `response_format` when a gateway rejects it.
- Core structured-output parsing tolerates fenced / surrounding JSON text.


- Phase 2: structured output via `run(input, { output })`, ADRs 0006, fallback JSON parsing.
- Phase 3: `AgentRun`, run ids, lifecycle events, `onEvent` callback (ADR 0007).
- Phase 4: hooks + guards (`timeoutMs`, allow/deny tools) (ADR 0008).
- Phase 5: `@agentstride/openai` adapter.
- Phase 6: expanded examples (simple, structured, receptionist, document analysis, backend, openai).
- Phase 7: `@agentstride/rag` with in-memory retriever.
- Phase 8: `@agentstride/mcp` tool bridge (does not reimplement MCP).
- Phase 9: `Memory` in core + `@agentstride/memory` in-memory adapter.
- Phase 10: `@agentstride/nestjs` `AgentStrideModule.forRoot`.
- Phase 11: `AgentLike`, `asAgentTool`, Receptionist example.
- Phase 12: A2A research notes + experimental `@agentstride/a2a` remote AgentLike.
- Phase 13: `@agentstride/migrate` portable tool helpers.
- Phase 14 prep: MIT license, CI, architecture docs, `.env.example`, security/release notes.
- Repository remains private; public publish is still an intentional later step.
