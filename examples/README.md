# Examples

Examples validate the API. Keep them small.

| Example | What it proves |
| --- | --- |
| `01-simple-agent` | Agent without tools |
| `01-tool-agent` | Typed tool + fake model (original vertical slice) |
| `03-structured-output` | Validated `result.output` |
| `04-receptionist` | Local delegation / nostalgic ReceptionistAgent |
| `05-document-analysis` | Retrieval + structured output |
| `06-backend-integration` | Embedded backend-style agent with guards/hooks |
| `07-openai` | Real provider text reply (OpenAI / OpenRouter) |
| `08-live-tool` | Live tool calling against OpenRouter |
| `09-live-structured` | Live structured output against OpenRouter |
| `10-live-receptionist` | Live ReceptionistAgent delegation against OpenRouter |
| `mcp-demo-server` | Tiny owned MCP server (`echo`, `add`) |
| `11-live-mcp` | Live OpenRouter agent using the demo MCP server |
| `12-nestjs-app` | Real NestJS HTTP app embedding AgentStride |
| `migration-shared` | Portable domain for migration demos |
| `13-migration-baseline` | AgentStride baseline + reuse metric |
| `14-migrate-mastra` | Same domain via Mastra tool config |
| `15-migrate-langchain` | Same domain via LangChain tool config |

Live examples load `.env` from the repo root via `examples/_shared/live-model.mjs`.

```bash
npm start -w @agentstride/example-live-tool
npm start -w @agentstride/example-live-structured
npm start -w @agentstride/example-live-receptionist
npm start -w @agentstride/example-live-mcp
npm start -w @agentstride/example-nestjs-app
```
