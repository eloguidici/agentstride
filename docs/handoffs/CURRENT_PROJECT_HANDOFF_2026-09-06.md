# AgentStride - Current Handoff (2026-09-06)

Repository: `eloguidici/agentstride`  
Default branch: **`main`**  
Active implementation branch: **`chore/github-actions-optimization`**  
Also open: `docs/public-productization-prep` (PR #24) — private productization prep  
Repository visibility: **private**

Do not develop directly on `main`.  
Do not make the repository public or publish npm packages without explicit owner approval.

---

## Status

Engineering incubation for the current scope is complete (Tracks A–G, ADR 0013, verticals 23–26, release-gate).

**GitHub Actions:** account minutes exhausted. This branch optimizes CI consumption (see `docs/engineering/GITHUB_ACTIONS_OPTIMIZATION.md`). Prefer local validation; do not rely on Actions until billing allows.

**Public productization:** plan on `main`; private prep artifacts are on PR #24 (may need re-merge after CI policy lands).

---

## CI policy (after this chore merges)

- **No** full CI on every feature-branch push  
- **Yes** full CI on PRs (unless docs-only) and on non-doc pushes to `main`  
- **concurrency** cancels obsolete runs  
- **`workflow_dispatch`** for manual full runs  
- Matrix Node 20+22 kept; job name `build-test` preserved  

---

## Owner gates (productization — unchanged)

Story selection, package scope, semver/license, visibility/npm remain owner decisions. Do not invent new runtime features while waiting.

---

## Useful commands (local)

```bash
npm run build
npm run typecheck
npm test
npm run publish:check
npm run examples:smoke
```
