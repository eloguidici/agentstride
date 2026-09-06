# Versioning recommendation

Date: 2026-09-06  
Status: **OWNER GATE 3 CLOSED — `0.1.0` + MIT**  
Current package versions in tree: still **`0.0.0`** (bump only at authorized launch)

## Owner decision

**2026-09-06 — confirmed.**

When launch is explicitly authorized:

- First public versions for selected packages (`@agentstride/core`, `@agentstride/openai`): **`0.1.0`**
- License: **MIT** (already at repo root `LICENSE`)

Do not bump versions or publish until the owner authorizes launch.

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
Jumping to `1.0.0`; bumping versions in tree before launch authorization.

### Risk
Users treat 0.1 as disposable junk — mitigate with clear README status + changelog quality.

### Next question
Launch gates: draft review / visibility / npm publish — only with explicit owner OK.
