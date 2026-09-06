# AgentStride - Current Handoff (2026-09-06)

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`chore/release-gate`**  
HEAD: see `git rev-parse HEAD` on the active branch  
Repository visibility: **private** (do not make public / npm publish without explicit owner approval)

Do not develop on `main`.

---

## Status

| Area | Status |
| --- | --- |
| Tracks A–G | `main` |
| Track H | ADR 0013 on `main` |
| Private verticals 23–26 | `main` |
| Engineering release gate | **this branch** — full test/typecheck/publish:check green |
| Track I / public | **blocked** — owner must pick stories + approve public/npm |

Source of truth: `docs/narrative/RELEASE_READINESS.md`  
Notes: `docs/research/release-gate.md`

---

## Next (owner)

1. Pick 3–5 stories from `docs/narrative/story-index.md` for a future public pack.
2. Review `docs/origins.md` / `docs/vision.md` for public wording.
3. Decide: stay private vs public vs npm scope.

---

## Useful commands

```bash
npm run build && npm test && npm run typecheck
npm run publish:check
```
