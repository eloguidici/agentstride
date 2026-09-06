# Public wording review

Date: 2026-09-06  
Status: Review complete — recommended edits applied where safe  
Plan: PP-2

## Method

Reviewed: root `README.md`, `docs/vision.md`, `docs/origins.md`, `docs/architecture.md`, package READMEs, `docs/PUBLISH.md`, `docs/RELEASE_NOTES.md` (if present), `LICENSE`, `docs/narrative/RELEASE_READINESS.md`.

Searched for risky claims (`production-ready`, `enterprise-grade`, `zero lock-in`, `fully A2A`, competitor superiority). No hits in product docs outside the productization plan’s own guidance text.

---

## Origins (`docs/origins.md`)

| Assessment | Notes |
| --- | --- |
| Safe as-is (mostly) | No customer/employer names; framed as personal prior architecture |
| Recommended rewrite | Clarify that the prior system is **technical history**, not a product claim about any employer; keep “enterprise project” generic |
| Omit publicly | Any future addition of employer/client identifiers |

**Risk:** Readers infer confidential employer architecture.  
**Mitigation:** Keep generic; emphasize AgentStride is a new, separate open design.

Applied: light clarifying sentences (see file diff).

---

## Vision (`docs/vision.md`)

| Assessment | Notes |
| --- | --- |
| Safe as-is | Clear “what we are not”; afternoon-understandable core |
| Recommended rewrite | Optional one-line product positioning aligned with README |
| Claims | None overreaching |

**60-second test:** Passes — why / what / not / portability are present.

Applied: minor alignment sentence only if needed.

---

## README (pre-PP-3)

| Assessment | Notes |
| --- | --- |
| Recommended rewrite | Entire productization pass (PP-3) — old README was accurate but thin vs evidence |
| Soften | List of all packages as if equally ready — move experimental to “when not / graduate” |
| Omit from hero | ChatGPT/Codex/Cursor continuity (internal process, not product positioning) |

---

## Architecture / package READMEs

| Doc | Assessment |
| --- | --- |
| `docs/architecture.md` | Safe; factual |
| `@agentstride/core` README | Already aligned with ADR 0013 after release-gate |
| `@agentstride/a2a` | Correctly experimental — keep that label loud |
| `@agentstride/openai` | Honest structured-output limits — good public tone |
| `@agentstride/migrate` | Schema trade-off section is appropriately cautious |

---

## Claim register

| Phrase / idea | Verdict |
| --- | --- |
| “production-ready” (blanket) | **Omit** |
| “enterprise-grade” | **Omit** unless tied to a named example (“enterprise support slice”) |
| “guaranteed structured output” | **Omit** — say “validated with Standard Schema when configured” |
| “zero lock-in” | **Soften** — “portable tools; graduation path via migrate helpers” |
| “fully A2A” | **Omit** — a2a is experimental sketch |
| Migration reuse % | **Omit from hero** — keep in research/examples only with measured context |

---

## NDA / private-data checklist

- [x] No live secrets in tree (release-gate audit)  
- [x] `.env` ignored; `.env.example` placeholders only  
- [x] Origins avoid named customers  
- [x] Fictional Velum Grid org only in examples  
- [ ] Owner still reviews origins/vision once before public visibility  

---

### Context
Prepare public-facing docs without overclaiming or leaking private history.

### Evidence
File review + claim grep; release-gate secrets audit.

### Decision
Document rewrites; apply safe origins/vision tweaks; full README rewrite in PP-3.

### Rejected
Marketing language; competitor superiority claims; publishing before owner gates.

### Risk
“Enterprise” examples misread as enterprise product certification.

### Next question
Owner confirms wording after README + story selection.
