# Release readiness (private until explicit approval)

Status: **ENGINEERING GATE GREEN — still NOT public / npm**  
Date: 2026-09-06  
Verified on branch `chore/release-gate` (commit of this update)

This checklist prepares a future release. Completing it does **not** authorize:

- making `eloguidici/agentstride` public;
- removing `"private": true` from packages;
- running `npm publish`.

Only the owner can flip those switches.

## Engineering gate (must be green)

- [x] Tracks A–G on `main`
- [x] Private verticals: alarm-triage (23), change-gate (24), data-export (25)
- [x] Nest surface for Velum ops (26)
- [x] Pre-1.0 API freeze decisions (ADR 0013)
- [x] Full monorepo `npm test` green (all workspaces `# fail 0`; also `npm run build` + `npm run typecheck`)
- [x] `npm run publish:check` green (private flags still expected)
- [x] No secrets in tree; `.env` / `.env.*` gitignored; only `.env.example` placeholders tracked; tests use local `test-secret` / `test-key`
- [x] Package READMEs present for all `packages/*` (core/rag/memory refreshed for external-reader clarity)

## Narrative gate

- [x] `docs/narrative/story-index.md` indexes evidence
- [x] `docs/narrative/evidence/` maps stories → artifacts
- [ ] Owner picks which stories ship first externally
- [ ] Origins / vision reviewed for public wording (no NDA / no customer data)

## Explicit owner decisions still required

1. Keep private vs make public
2. npm publish scope (`@agentstride/core` only vs more packages)
3. Semver starting version (leave `0.0.0` until then)
4. License confirmation

## Current posture

**Private. Engineering polish done. Public later — only when the owner says so.**
