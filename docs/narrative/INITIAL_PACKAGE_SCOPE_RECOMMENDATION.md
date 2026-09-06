# Initial package scope recommendation

Date: 2026-09-06  
Status: **OWNER GATE 2 CLOSED — Option A selected**  
Selected packages (for a future npm publish only): **`@agentstride/core` + `@agentstride/openai`**

Do not remove `private: true`. Do not publish until the owner explicitly authorizes launch.

## Owner decision

**2026-09-06 — Option A (conservative).**

Initial public npm surface (when authorized): only `core` and `openai`.  
All other packages (`rag`, `memory`, `mcp`, `nestjs`, `migrate`, `a2a`) stay private/unpublished for now; users follow examples until those packages graduate.

## Per-package notes

| Package | Purpose | Maturity | Tests | API stability | Deps | README | Essential to first story? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `core` | Runtime | High for scope | Strong | Freeze candidate (ADR 0013) | `@standard-schema/spec` | Good | **Yes — selected** |
| `openai` | `Model` adapter | High | Present | Stable enough for 0.x | fetch-only | Good / honest limits | **Yes — selected** |
| `rag` | In-memory retriever helpers | Medium | Light | Small surface | Low | OK | No — deferred |
| `memory` | Memory adapters | Medium | Light | Small surface | Low | OK | No — deferred |
| `mcp` | MCP tool bridge | Medium | Present | Evolving with MCP | Process/stdio | OK | No — deferred |
| `nestjs` | Nest DI helpers | Medium | Via examples | Nest version coupling | Nest peers | OK | No — deferred |
| `migrate` | Portability helpers | Medium | Present | Deprecations cleaned | Zod types | Good | Deferred |
| `a2a` | Remote AgentLike sketch | **Experimental** | Thin | Unstable | Low | Says experimental | **Deferred** |

## Options considered

### Option A — Conservative (**selected**)

Publish later (when owner approves): **`@agentstride/core` + `@agentstride/openai` only**.

**Why**  
Matches the product story: small runtime + one practical model adapter. Lowest support surface. README quick start works.

**Trade-off**  
Users copy Nest/RAG/MCP patterns from examples instead of installing official packages immediately.

### Option B — Balanced (rejected for first launch)

**core + openai + one of** `{nestjs | mcp | rag}`.

### Option C — Full incubation set (rejected)

Publish all packages including `a2a` and `migrate`.

## Decision record

### Context
Choose smallest credible npm surface.

### Evidence
ADR 0013; package READMEs; test layout; a2a experimental disclaimer; owner confirmation 2026-09-06.

### Decision
**Option A:** `@agentstride/core` + `@agentstride/openai` for first authorized public npm.

### Rejected
Option B and C for initial launch; publishing `a2a`.

### Risk
Users ask for Nest/MCP packages day one — answer with examples + roadmap.

### Next question
Launch gates: visibility / npm / draft publish — Gate 3 closed (`0.1.0` + MIT).
