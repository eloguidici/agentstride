# Usage accounting

Aggregates **quality-adjacent operational metrics** from `AgentRun` events:

- model calls / tool calls
- input / output / total tokens (when models emit `usage`)
- steps / duration

Cost estimation accepts **external pricing snapshots** only. Prices are never hard-coded in `@agentstride/core`.

```bash
npm start -w @agentstride/example-usage-accounting
npm test -w @agentstride/example-usage-accounting
```
