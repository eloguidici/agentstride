# Versioning recommendation

Date: 2026-09-06  
Status: **OWNER GATE 3 CLOSED — `0.1.0` + MIT**  
Current package versions in tree: **`0.1.0`** for `@agentstride/core` and `@agentstride/openai`; deferred packages remain **`0.0.0`** / private

## Owner decision

**2026-09-06 — confirmed.**

- First public versions for selected packages (`@agentstride/core`, `@agentstride/openai`): **`0.1.0`**
- License: **MIT** (already at repo root `LICENSE`)

Tree bump for the first wave is done. **GitHub visibility → public** and **`npm publish`** still require explicit owner authorization.

## Options considered

### `0.1.0` (**selected**)

**Meaning:** first publicly consumable pre-1.0 cut after incubation.

**Why**  
- ADR 0013 is a **freeze candidate**, not a promise of forever stability.  
- Communicates “usable, still may break before 1.0” honestly.  
- Matches Gate 2 scope (core + openai).

**Compatibility expectations**  
- Prefer additive changes.  
- Breaking changes allowed in 0.x with changelog notes and migration one-liners.  
- No SemVer theater: do not call it 1.0 while still learning external usage.

### `0.2.0` (rejected for first tag)

Reserve for a second public cut after real external feedback.

### `1.0.0` (rejected for now)

No external consumers yet; freeze is internal evidence, not battle-tested public API.

---

## Experimental package policy

- Unpublished or clearly marked experimental (`a2a`).  
- Optional packages stay unpublished until they graduate (Gate 2).  
- Core/openai `0.1.0` does not imply deferred packages are equally stable.

## Breaking-change policy before 1.0

1. Document in `docs/RELEASE_NOTES.md` (or release tag notes).  
2. Prefer codemods/snippets over silent breaks.  
3. Do not break portable tool `execute(input, context)` casually — that is the graduate path.

## Relation to ADR 0013

ADR 0013 freezes **intent and cleanup** for a future public surface. It does **not** auto-select `1.0.0`.

---

### Context
Pick an honest first public version + license.

### Evidence
ADR 0013; root MIT `LICENSE`; Gate 2 Option A; owner confirmation 2026-09-06.

### Decision
**`0.1.0` + MIT** for first authorized publish of `core` and `openai`.

### Rejected
Jumping to `1.0.0`; publishing deferred packages at the same cut.

### Risk
Users treat 0.1 as disposable junk — mitigate with clear README status + changelog quality.

### Next question
Owner Gate 4: GitHub public → `npm publish` core then openai → tag `v0.1.0`.
