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
| `07-openai` | Real provider adapter via `OPENAI_API_KEY` |

Run:

```bash
npm start -w @agentstride/example-simple-agent
```
