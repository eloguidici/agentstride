# Migration proof

Status: Phase 13 implemented with measured reuse

## Shared domain

`examples/migration-shared/domain.mjs` contains:

- Zod input schema
- tool name/description constants
- `findCustomerService()`
- instructions text

No AgentStride / Mastra / LangChain imports.

## Examples

| Example | Role |
| --- | --- |
| `13-migration-baseline` | AgentStride agent using the shared domain |
| `14-migrate-mastra` | Same domain via `toMastraToolConfig()` (+ optional `@mastra/core`) |
| `15-migrate-langchain` | Same domain via `toLangChainToolConfig()` (+ optional `@langchain/core`) |

## How reuse is measured

```text
reuse% = shared domain lines / (shared domain lines + framework adapter lines)
```

Runtime framework packages are excluded on purpose. We only count application code that you would rewrite or keep.

## Helpers

`@agentstride/migrate`:

- `toPortableTool()`
- `toMastraToolConfig()`
- `toLangChainToolConfig()`

## Run

```bash
npm start -w @agentstride/example-migration-baseline
npm start -w @agentstride/example-migrate-mastra
npm start -w @agentstride/example-migrate-langchain
node examples/migration-shared/run-all.mjs
```
