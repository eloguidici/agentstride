# Public + npm readiness audit

Date: 2026-09-06  
Status: **Pre-launch audit — repo still private; do not publish yet**  
Goal: conditions for (1) GitHub **public** and (2) npm publish `@agentstride/core` + `@agentstride/openai` @ **`0.1.0`** MIT

## Verdict

Packaging hygiene is hardened. Owner-private strategy docs were **migrated** to [`eloguidici/agentstride-notes`](https://github.com/eloguidici/agentstride-notes) and removed from this tree. **Irreversible public/npm steps remain owner-only.**

| Area | Status |
| --- | --- |
| Runtime / tests / dry-run | Strong |
| npm metadata (license, repo, publishConfig, LICENSE, peers, files) | Fixed for Gate-2 packages |
| Owner-private strategy docs | **Moved to agentstride-notes** |
| History scrub of former `docs/internal/` | See rewrite step (force-push) if required |
| Version still `0.0.0` / `private: true` | Expected until launch day |
| Release notes `0.1.0` | Drafted |
| npm org `@agentstride` access | Verify at launch |

---

## P0 — must clear before public + npm

| # | Item | Action |
| --- | --- | --- |
| 1 | Owner-private strategy in product repo | **Done** — vault = `agentstride-notes` |
| 2 | `private: true` on core + openai | Remove **only** on launch commit |
| 3 | Version bump `0.0.0` → `0.1.0` | Same launch commit |
| 4 | GitHub visibility → public | Owner only |
| 5 | `npm publish` | Owner only |
| 6 | Root/README “private” wording | Flip on launch day |

## Launch-day sequence (owner)

1. Confirm `agentstride-notes` stays **private**.  
2. Re-read README / GETTING_STARTED — remove “private incubation” lines.  
3. Set core + openai `version: "0.1.0"`, remove `private: true`.  
4. `npm run build && npm run typecheck && npm test && npm run publish:check && npm run package:dry-run`  
5. Make GitHub public.  
6. `npm publish` core then openai.  
7. Tag `v0.1.0`.  

**Do not invent new runtime features to “earn” launch.**
