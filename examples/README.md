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
| `12-nestjs-app` | Real NestJS HTTP app embedding AgentStride (API key + request context) |
| `migration-shared` | Portable domain for migration demos |
| `13-migration-baseline` | AgentStride baseline + reuse metric |
| `14-migrate-mastra` | Same domain via Mastra tool config |
| `15-migrate-langchain` | Same domain via LangChain tool config |
| `16-orchestrator-n-agents` | Orchestrator → 5 specialists (ask* + parallel fanOut) |
| `17-enterprise-support-agent` | Real-world slice: Receptionist + security + RAG + structured case result |
| `18-enterprise-support-http` | Nest HTTP surface for the enterprise slice (`POST /support/run`) |
| `19-opentelemetry-tracing` | AgentEvent → OpenTelemetry spans (proof; OTel not in core) |
| `20-human-approval` | Propose → external approve → grant (agent is not its own approver) |
| `21-side-effect-idempotency` | Idempotent createSupportCase under retries / duplicate tool calls |
| `22-usage-accounting` | Aggregate tokens/steps/tools; cost via external pricing only |
| `23-alarm-triage` | Velum Grid: multi-source normalize → drop/ticket/proposePage (no auto-page) |

Live examples load `.env` from the repo root via `examples/_shared/live-model.mjs`.

```bash
npm start -w @agentstride/example-live-tool
npm start -w @agentstride/example-live-structured
npm start -w @agentstride/example-live-receptionist
npm start -w @agentstride/example-live-mcp
npm start -w @agentstride/example-nestjs-app
npm start -w @agentstride/example-orchestrator-n-agents
npm start -w @agentstride/example-enterprise-support-agent
npm test -w @agentstride/example-enterprise-support-agent
npm start -w @agentstride/example-enterprise-support-http
npm test -w @agentstride/example-enterprise-support-http
npm start -w @agentstride/example-opentelemetry-tracing
npm test -w @agentstride/example-opentelemetry-tracing
npm start -w @agentstride/example-human-approval
npm test -w @agentstride/example-human-approval
npm start -w @agentstride/example-side-effect-idempotency
npm test -w @agentstride/example-side-effect-idempotency
npm start -w @agentstride/example-usage-accounting
npm test -w @agentstride/example-usage-accounting
npm start -w @agentstride/example-alarm-triage
npm test -w @agentstride/example-alarm-triage
```
