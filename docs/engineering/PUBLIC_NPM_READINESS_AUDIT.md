# Public + npm readiness audit

Date: 2026-09-06  
Status: **Post-bump — first-wave at `0.1.0`; repo still private; do not publish until owner GO**  
Goal: conditions for (1) GitHub **public** and (2) npm publish `@agentstride/core` + `@agentstride/openai` @ **`0.1.0`** MIT

## Verdict

Packaging hygiene is hardened. Tree bump for Gate-2 packages is done. Owner-private strategy docs live in [`eloguidici/agentstride-notes`](https://github.com/eloguidici/agentstride-notes). **Irreversible public/npm steps remain owner-only.**

| Area | Status |
| --- | --- |
| Runtime / tests / dry-run | Strong (battery GREEN) |
| npm metadata (license, repo, publishConfig, LICENSE, peers, files, keywords) | Fixed for Gate-2 packages |
| Owner-private strategy docs | **Moved to agentstride-notes** |
| History scrub of former `docs/internal/` | Done |
| Version / `private` on core + openai | **`0.1.0`**, not private |
| Release notes `0.1.0` | Ready |
| npm org `@agentstride` | Created (2FA on owner account) |

---

## P0 — remaining before public + npm

| # | Item | Action |
| --- | --- | --- |
| 1 | Owner-private strategy in product repo | **Done** — vault = `agentstride-notes` |
| 2 | `private: true` on core + openai | **Done** — removed |
| 3 | Version bump `0.0.0` → `0.1.0` | **Done** |
| 4 | Root/README public wording | **Done** |
| 5 | GitHub visibility → public | **Owner only** |
| 6 | `npm publish` (core then openai) | **Owner only** |
| 7 | Tag `v0.1.0` | After publish |

## Launch-day sequence (owner)

1. Confirm `agentstride-notes` stays **private**.  
2. Confirm suite green: `publish:check` + `package:dry-run` (and preferably full battery).  
3. Make GitHub public.  
4. `npm login` as org member with 2FA.  
5. `npm publish -w @agentstride/core` then `-w @agentstride/openai`.  
6. Tag `v0.1.0` and push the tag.  
7. Verify npm pages + fresh install from registry.

**Do not invent new runtime features to “earn” launch.**
