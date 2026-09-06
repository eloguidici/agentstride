# Release readiness

Status: **ENGINEERING GATE GREEN — tree at `0.1.0` for core+openai; still NOT public / npm**  
Date: 2026-09-06

This checklist prepares release. Completing it does **not** authorize:

- making `eloguidici/agentstride` public;
- running `npm publish`.

Only the owner can flip those switches. First-wave packages already have `"private"` removed and version **`0.1.0`**.

## Engineering gate (must be green)

- [x] Tracks A–G on `main`
- [x] Private verticals: alarm-triage (23), change-gate (24), data-export (25)
- [x] Nest surface for Velum ops (26)
- [x] Pre-1.0 API freeze decisions (ADR 0013)
- [x] Full monorepo `npm test` green (all workspaces `# fail 0`; also `npm run build` + `npm run typecheck`)
- [x] `npm run publish:check` green (first-wave public metadata)
- [x] No secrets in tree; `.env` / `.env.*` gitignored; only `.env.example` placeholders tracked; tests use local `test-secret` / `test-key`
- [x] Package READMEs present for all `packages/*` (core/rag/memory refreshed for external-reader clarity)

## Narrative gate

- [x] `docs/narrative/story-index.md` indexes evidence
- [x] `docs/narrative/evidence/` maps stories → artifacts
- [x] Story **recommendation** prepared (`PUBLIC_STORY_SELECTION.md`)
- [x] Pack 1 stories drafted (`docs/narrative/drafts/`) — **not published**
- [x] Public wording review prepared (`PUBLIC_WORDING_REVIEW.md`)
- [ ] Owner reviews/edits drafts before any external post
- [ ] Origins / vision accepted by owner for public visibility

## Explicit owner decisions

1. Keep private vs make public — **open** (irreversible when flipped)
2. npm publish scope — **closed: Option A (`@agentstride/core` + `@agentstride/openai`)** — still not published
3. Semver starting version — **closed: `0.1.0`** (tree bumped for core+openai)
4. License confirmation — **closed: MIT** (root `LICENSE` already MIT)

## Current posture

**Repo still private. First-wave packages at `0.1.0` and ready to publish. Gate 4 remaining: GitHub public → npm publish → tag `v0.1.0` — only when the owner says so.**

---

## Productization plan

The next private preparation phase is defined in:

`docs/plans/PUBLIC_PRODUCTIZATION_AND_RELEASE_DECISION_PLAN_2026-09-06.md`

Engineering readiness does not imply launch authorization. Public story selection, package scope, version/license, repository visibility and npm publication remain explicit owner gates.
