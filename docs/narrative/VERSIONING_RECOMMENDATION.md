# Versioning recommendation

Date: 2026-09-06  
Status: **Recommendation only — OWNER GATE 3**  
Current package versions: `0.0.0` (unchanged)

## Options

### `0.1.0` (recommended)

**Meaning:** first publicly consumable pre-1.0 cut after incubation.

**Why**  
- ADR 0013 is a **freeze candidate**, not a promise of forever stability.  
- Communicates “usable, still may break before 1.0” honestly.  
- Matches conservative package scope (core + openai).

**Compatibility expectations**  
- Prefer additive changes.  
- Breaking changes allowed in 0.x with changelog notes and migration one-liners.  
- No SemVer theater: do not call it 1.0 while still learning external usage.

### `0.2.0`

Reserve for a second public cut after real external feedback (or after adding a justified optional package). Not the first tag.

### `1.0.0` (not now)

**Why not**  
- No external consumers yet.  
- Freeze is internal evidence, not battle-tested public API.  
- 1.0 creates a heavy compatibility burden prematurely.

Revisit 1.0 after: public usage, issue history, and a deliberate “no break without major” policy.

---

## Experimental package policy

- Unpublished or clearly marked experimental (`a2a`).  
- Optional published packages (if any) stay `0.x` until they have their own freeze note.  
- Core 0.1 does not imply optional packages are equally stable.

## Breaking-change policy before 1.0

1. Document in `docs/RELEASE_NOTES.md` (or release tag notes).  
2. Prefer codemods/snippets over silent breaks.  
3. Do not break portable tool `execute(input, context)` casually — that is the graduate path.

## Relation to ADR 0013

ADR 0013 freezes **intent and cleanup** for a future public surface. It does **not** auto-select `1.0.0`.

---

### Context
Pick an honest first public version.

### Evidence
ADR 0013; packages still `0.0.0` / private; no public consumers.

### Decision
Recommend **`0.1.0`** for first approved publish of selected packages.

### Rejected
Jumping to `1.0.0` for marketing; staying on `0.0.0` forever after public.

### Risk
Users treat 0.1 as disposable junk — mitigate with clear README status + changelog quality.

### Next question
OWNER GATE 3: semver + license confirmation (MIT assumed unless owner changes).
