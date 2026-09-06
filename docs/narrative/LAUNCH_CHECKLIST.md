# Launch checklist (private prep)

Date: 2026-09-06  
Status: Template — **do not execute public steps without owner**

## Before any public action

- [ ] `main` green (build / typecheck / test / CI)
- [ ] Secret scan / `.env` posture re-checked
- [ ] [PUBLIC_WORDING_REVIEW](./PUBLIC_WORDING_REVIEW.md) accepted by owner
- [ ] OWNER GATE 1: stories selected
- [ ] OWNER GATE 2: package scope selected
- [ ] OWNER GATE 3: semver + license confirmed
- [ ] [public-package-dry-run](../research/public-package-dry-run.md) green for selected packages
- [ ] Release notes drafted for chosen version
- [ ] Repository visibility decision recorded
- [ ] npm org/`@agentstride` access verified **at launch time**

## Irreversible (owner only)

- [ ] Make GitHub repository public
- [ ] Remove `private: true` from selected packages
- [ ] `npm publish`
- [ ] Publish LinkedIn / articles

## Stop rule

If any checkbox above is undecided, **do not invent more runtime features**. Pause for owner decision.
