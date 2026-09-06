# Release readiness (private until explicit approval)

Status: **NOT READY FOR PUBLIC / npm**  
Date: 2026-09-06

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
- [ ] Full monorepo `npm test` green on the release candidate commit
- [ ] `npm run publish:check` green
- [ ] No secrets in tree; `.env` ignored
- [ ] Package READMEs adequate for external consumers

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

**Private. Perfect first. Public later — only when the owner says so.**
