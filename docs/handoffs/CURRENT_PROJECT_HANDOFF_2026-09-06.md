# AgentStride - Current Handoff (2026-09-06)

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active feature branch: **`feature/private-polish-pack`**  
HEAD: see `git rev-parse HEAD` on the active branch  
Repository visibility: **private** (do not make public / npm publish without explicit owner approval)

Do not develop on `main`.

---

## Production validation progress

| Track | Status |
| --- | --- |
| A–G | `main` |
| H Pre-1.0 API | **in this PR** — ADR 0013 + types→dist + alias cleanup |
| I Narrative/release | **prep only** — `docs/narrative/RELEASE_READINESS.md` (still private) |

**Private slices:** examples 23–26 (alarm, change-gate, data-export, Nest Velum).

Release gate: `docs/narrative/RELEASE_READINESS.md`

---

## Useful commands

```bash
npm test -w @agentstride/core
npm test -w @agentstride/evals-internal
npm run eval:data-export
npm test -w @agentstride/example-data-export
npm test -w @agentstride/example-velum-grid-nestjs
npm run publish:check
```
