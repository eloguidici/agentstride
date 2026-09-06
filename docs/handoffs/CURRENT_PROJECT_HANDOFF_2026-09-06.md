# AgentStride - Current Handoff (2026-09-06)

This document is the current source of truth for continuing AgentStride in another session or tool.

Repository: `eloguidici/agentstride`  
Default branch: **`main`** @ `3e31993` (PR #5 merged)  
Active feature branch: **none** — start a new branch for the next task  
Repository visibility: **private** (still)

Do not develop feature work directly on `main`.  
Do not make the repository public or publish npm unless explicitly requested.

---

## 0. Continuity

**The repository is the shared memory.**

---

## 1. Where we are

Real-world validation of the enterprise support path is **done for the current slice**:

| Track | Status |
| --- | --- |
| Runtime hardening (abort/timeout/failed runs) | `main` — PR #3 |
| Enterprise domain + Receptionist slice | `main` — PR #4 (`examples/17`) |
| Nest HTTP surface | `main` — PR #5 (`examples/18`) |

Core remains frozen: no drive-by API changes. Nest stays out of `@agentstride/core`. Domain in example 17 has no AgentStride imports.

Proven end-to-end (offline/fake):

1. Pure domain services (customer / security / support case / RAG / permissions)
2. Receptionist → SecurityAgent via `asAgentTool` + tools + structured Zod result
3. Same slice behind Nest `POST /support/run` with api-key, tenant/user/roles/request-id, and HTTP close → `AbortSignal`

Known gap (documented, not urgent): `asAgentTool` forwards `context` but not `run({ signal })` to the nested agent.

---

## 2. Next useful work (pick one when needed)

1. Forward `AbortSignal` in `asAgentTool` **only if** nested cancel is a product requirement (ADR + tests).
2. Another real use case that forces a core/package change — otherwise do not invent features.
3. Publish / make public **only** when explicitly requested.
4. Avoid mini-LangChain, workflow engines, RxJS buses, and A2A expansion without a concrete need.

---

## 3. Commands

```bash
npm test -w @agentstride/example-enterprise-support-agent
npm start -w @agentstride/example-enterprise-support-agent
npm test -w @agentstride/example-enterprise-support-http
npm start -w @agentstride/example-enterprise-support-http
```

Live HTTP: set `OPENROUTER_API_KEY` or `OPENAI_API_KEY`, unset `ENTERPRISE_FAKE`. Default port `3200`.
