# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/enterprise-nestjs-http`**  
Repository visibility: **private** (still)

Do not develop feature work directly on `main`.  
Do not make the repository public or publish npm unless explicitly requested.

---

## 0. Continuity

**The repository is the shared memory.**

---

## 1. Mode

Real-world validation continues: embed the enterprise slice in a Nest HTTP app.

Already on `main`:

- Runtime hardening (PR #3)
- `examples/17-enterprise-support-agent` (PR #4)

---

## 2. This branch

`examples/18-enterprise-support-http`:

- Nest `POST /support/run` wrapping example 17 Receptionist
- Headers: api-key, tenant, user, roles, request-id
- Fake models for CI; live when OpenRouter/OpenAI keys exist
- HTTP `close` → `AbortSignal` on `run`
- No core changes

---

## 3. Next useful work

1. Merge this branch when CI is green.
2. `asAgentTool` signal forwarding only if nested cancel is a product requirement.
3. Avoid new packages/features until another real use case forces them.
4. Publish/public only when explicitly requested.

---

## 4. Commands

```bash
npm test -w @agentstride/example-enterprise-support-agent
npm test -w @agentstride/example-enterprise-support-http
npm start -w @agentstride/example-enterprise-support-http
```
