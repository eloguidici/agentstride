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
