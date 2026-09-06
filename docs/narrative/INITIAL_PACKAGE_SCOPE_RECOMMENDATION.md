# Initial package scope recommendation

Date: 2026-09-06  
Status: **Recommendation only — OWNER GATE 2**  
Do not remove `private: true`. Do not publish.

## Per-package notes

| Package | Purpose | Maturity | Tests | API stability | Deps | README | Essential to first story? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `core` | Runtime | High for scope | Strong | Freeze candidate (ADR 0013) | `@standard-schema/spec` | Good | **Yes** |
| `openai` | `Model` adapter | High | Present | Stable enough for 0.x | fetch-only | Good / honest limits | **Yes** for quick start |
| `rag` | In-memory retriever helpers | Medium | Light | Small surface | Low | OK | No |
| `memory` | Memory adapters | Medium | Light | Small surface | Low | OK | No |
| `mcp` | MCP tool bridge | Medium | Present | Evolving with MCP | Process/stdio | OK | No |
| `nestjs` | Nest DI helpers | Medium | Via examples | Nest version coupling | Nest peers | OK | No (examples show pattern) |
| `migrate` | Portability helpers | Medium | Present | Deprecations cleaned | Zod types | Good | Nice-to-have later |
| `a2a` | Remote AgentLike sketch | **Experimental** | Thin | Unstable | Low | Says experimental | **No — defer** |

Compatibility burden rises with every published package: semver, types, docs, issue triage.

---

## Option A — Conservative (recommended)

Publish later (when owner approves): **`@agentstride/core` + `@agentstride/openai` only**.

**Why**  
Matches the product story: small runtime + one practical model adapter. Lowest support surface. README quick start works.

**Trade-off**  
Users copy Nest/RAG/MCP patterns from examples instead of installing official packages immediately.

---

## Option B — Balanced

**core + openai + one of** `{nestjs | mcp | rag}`.

Only if the owner wants a specific “first optional” narrative (e.g. Nest embedding). Prefer **nestjs** if the public story is “embed in existing backends,” else skip.

**Trade-off**  
Peers (Nest) or protocol churn (MCP) enter the support matrix early.

---

## Option C — Full incubation set

Publish all packages including `a2a` and `migrate`.

**Not recommended initially.** Signals false uniformity of maturity; `a2a` especially should stay experimental/unpublished or clearly pre-release only.

---

## Recommendation

**Option A (conservative).** Label any later optional packages as `0.x` experimental until they earn a freeze note of their own.

### Context
Choose smallest credible npm surface.

### Evidence
ADR 0013; package READMEs; test layout; a2a experimental disclaimer.

### Decision
Recommend core + openai only for first public npm (pending owner).

### Rejected
Publishing a2a; publishing everything to look complete.

### Risk
Users ask for Nest/MCP packages day one — answer with examples + roadmap.

### Next question
OWNER GATE 2: which packages, if any?
