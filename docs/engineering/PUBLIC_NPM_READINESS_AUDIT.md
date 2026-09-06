# Public + npm readiness audit

Date: 2026-09-06  
Status: **Pre-launch audit — repo still private; do not publish yet**  
Goal: conditions for (1) GitHub **public** and (2) npm publish `@agentstride/core` + `@agentstride/openai` @ **`0.1.0`** MIT

## Verdict

**Not launch-ready yet.** Engineering is strong; packaging metadata and public-tree hygiene had real gaps. This branch fixes packaging P0/P1 items that can ship while still private. **Irreversible steps remain owner-only.**

| Area | Status |
| --- | --- |
| Runtime / tests / dry-run | Strong (prior GREEN) |
| npm metadata (license, repo, publishConfig, LICENSE file, peers, files) | **Fixed on this branch** for Gate-2 packages |
| `docs/internal/` still in tree | **P0 blocker** for public GitHub |
| Version still `0.0.0` / `private: true` | **Expected until launch day** |
| Release notes `0.1.0` | Drafted (see `docs/RELEASE_NOTES.md`) |
| npm org `@agentstride` access | **Verify at launch** (cannot prove from repo) |

---

## P0 — must clear before public + npm

| # | Item | Action |
| --- | --- | --- |
| 1 | `docs/internal/` (career, growth, LinkedIn drafts) | **Remove or move outside git** before visibility flip ([disposition](../internal/INTERNAL_DOCS_DISPOSITION.md)). Note: files already in git history — deleting from tree is minimum; history scrub is optional owner choice. |
| 2 | `private: true` on core + openai | Remove **only** on launch commit |
| 3 | Version bump `0.0.0` → `0.1.0` | Same launch commit (both packages) |
| 4 | GitHub visibility → public | Owner only |
| 5 | `npm publish` (scoped, public) | Owner only; needs npm org access |
| 6 | Root/README “private” wording | Flip on launch (or same PR as visibility) |

## P1 — should be done (addressed or remaining)

| # | Item | Status |
| --- | --- | --- |
| 1 | `license`, `repository`, `homepage`, `bugs`, `engines` on packages | **Done** (all packages) |
| 2 | `publishConfig.access=public` on core + openai | **Done** |
| 3 | Package-local `LICENSE` for core + openai | **Done** (npm pack does not pick root LICENSE) |
| 4 | `files: ["dist"]` only for first wave | **Done** (no shipping `src` / fewer maps) |
| 5 | openai `peerDependencies` | **`^0.0.0 \|\| ^0.1.0`** now (works with incubation tarball); tighten to `^0.1.0` on launch bump |
| 6 | `publish-check` enforces first-wave rules | **Done** |
| 7 | `SECURITY.md` public-ready | **Updated** |
| 8 | `CODE_OF_CONDUCT.md` | **Added** |
| 9 | Release notes for `0.1.0` | **Drafted** |
| 10 | Local `.env` with real keys | Keep gitignored; **rotate** if ever shared/copied |
| 11 | CONTRIBUTING must not spotlight internal strategy | **Softened** |

## P2 — nice-to-have

- Soften/archive long productization plans before public (optional; not secret).
- GitHub Security Advisories enablement after public.
- Typedoc / API reference site (not required for 0.1.0).

---

## Launch-day sequence (owner)

1. Backup/move `docs/internal/` out of the repo; commit removal.  
2. Re-read README / GETTING_STARTED / package READMEs — remove “private incubation” lines.  
3. Set core + openai `version: "0.1.0"`, remove `private: true`.  
4. `npm run build && npm run typecheck && npm test && npm run publish:check && npm run package:dry-run`  
5. Make GitHub public.  
6. `npm publish -w @agentstride/core` then `npm publish -w @agentstride/openai` (or from package dirs).  
7. Tag `v0.1.0`.  
8. Optional: first LinkedIn post from Pack 1 drafts.

**Do not invent new runtime features to “earn” launch.**

---

### Context
Owner asked for an exacting review against public GitHub + npm conditions.

### Evidence
Package.json audit; publish-check; dry-run history; internal disposition; explore scan.

### Decision
Fix packaging hygiene now; keep visibility/npm/version flips for explicit launch.

### Rejected
Publishing from this audit; deleting `docs/internal/` without owner backup confirmation; feature work.

### Next question
Owner: execute disposition + authorize Gate 4 sequence when ready.
