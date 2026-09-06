# Launch checklist (private prep)

Date: 2026-09-06  
Status: Updated after public/npm readiness audit — **do not execute public steps without owner**  
Audit: `docs/engineering/PUBLIC_NPM_READINESS_AUDIT.md`

## Before any public action

- [ ] `main` green (build / typecheck / test / CI)
- [ ] Secret scan / `.env` posture re-checked (rotate local keys if exposed)
- [ ] [PUBLIC_WORDING_REVIEW](./PUBLIC_WORDING_REVIEW.md) accepted by owner
- [x] OWNER GATE 1: stories selected / Pack 1 drafted
- [x] OWNER GATE 2: package scope selected — Option A (`core` + `openai`)
- [x] OWNER GATE 3: semver + license confirmed — `0.1.0` + MIT (bump only at launch)
- [x] [public-package-dry-run](../research/public-package-dry-run.md) green for selected packages (install + tsc + runtime)
- [x] npm metadata hardened (license, repository, publishConfig, package LICENSE, peers, `files:["dist"]`) — see audit
- [x] `0.1.0` release notes drafted (`docs/RELEASE_NOTES.md`)
- [x] `SECURITY.md` + `CODE_OF_CONDUCT.md` present
- [x] Owner-private strategy notes moved to `eloguidici/agentstride-notes` (removed from this tree)
- [x] README / GETTING_STARTED “private” banners updated for public day
- [ ] Repository visibility decision recorded
- [ ] npm org/`@agentstride` access verified **at launch time**

## Irreversible (owner only)

- [ ] Make GitHub repository public
- [ ] Bump `0.1.0` + remove `private: true` from `core` + `openai`
- [ ] `npm publish`
- [ ] Publish LinkedIn / articles

## Stop rule

If any checkbox above is undecided, **do not invent more runtime features**. Pause for owner decision.
