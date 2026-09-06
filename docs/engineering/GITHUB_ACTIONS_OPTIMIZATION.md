# GitHub Actions Optimization

Date: 2026-09-06  
Branch: `chore/github-actions-optimization`  
Repository: `eloguidici/agentstride` (private)

## Context

The GitHub org/account hit the included Actions minutes limit. Development was generating full CI on every feature push **and** every PR, often doubled, including documentation-heavy commits. Goal:

> frequent local development → few remote runs → strong CI at important points

Do **not** disable CI.

## Previous CI architecture

Single workflow: `.github/workflows/ci.yml` (`name: ci`).

### Workflows discovered

| Workflow | File |
| --- | --- |
| `ci` | `.github/workflows/ci.yml` |

### Triggers discovered (before)

```yaml
on:
  push:
    branches: [main, "feature/**"]
  pull_request:
```

No `workflow_dispatch`. No `schedule`. No `concurrency`. No `paths` / `paths-ignore`.

### Jobs

| Job | Runner | Matrix |
| --- | --- | --- |
| `build-test` | `ubuntu-latest` | Node `20`, `22` |

### Steps (each matrix cell)

1. checkout  
2. setup-node (`cache: npm`)  
3. `sync-workspace-lock`  
4. `npm install`  
5. `npm run build`  
6. `npm run typecheck`  
7. `npm run test`  
8. `npm run publish:check`  
9. `npm run examples:smoke`

### Checks appearing in GitHub

- `build-test (20)`
- `build-test (22)`

Often **twice** for the same change (push job set + pull_request job set).

## Problems identified

### Duplicate executions

Typical feature workflow:

```text
git push origin feature/x     → full CI × Node 20/22
open/sync PR → main           → full CI × Node 20/22 again
```

Same commit paid ~2× minutes. Observed on recent PRs (four `build-test` entries for one change).

### Documentation noise

Productization/docs commits under `docs/**` and `*.md` still triggered install/build/test when pushed on matching branches / PRs with only doc files (or mixed with small doc-only follow-ups).

### No cancel-in-progress

Rapid consecutive pushes left obsolete workflows running until completion.

### Matrix cost

Node 20+22 doubles every trigger. Still justified for compatibility (`engines.node: >=20`), so **not** removed in this pass; savings prioritized from triggers first.

## Expensive jobs

Only one job family, but it is heavy: full monorepo build + typecheck + all workspace tests + publish:check + example smoke. Appropriate for PR/main; wasteful when duplicated or docs-only.

## Decisions

| Decision | Why |
| --- | --- |
| Remove `push` on `feature/**` | PR already validates feature work |
| Keep `push` on `main` | Protect default branch after merge |
| Add `paths-ignore` for `docs/**` and `**/*.md` | Doc-only changes skip heavy CI |
| Add `concurrency` + `cancel-in-progress` | Only newest run per PR/ref matters |
| Add `workflow_dispatch` | Manual full CI when local work is ready |
| Keep Node 20+22 matrix | Real dual-version support; avoid dropping required-looking checks |
| Keep job name `build-test` | Required-check / UI continuity |
| Keep `ubuntu-latest` + npm cache | Already correct |

## Changes implemented

1. Rewrote triggers in `.github/workflows/ci.yml` as above.  
2. Added concurrency group.  
3. Added documentation under `docs/engineering/`.  
4. Updated current handoff + development-log.

## New CI architecture

```text
Developer changes
        │
   local: build / typecheck / test / publish:check
        │
   ┌────┴────┐
docs-only   code (+ optional docs)
   │              │
 no heavy CI    open/update PR ──► build-test (20)+(22)
                  │
                merge
                  │
           push main (if non-doc) ──► build-test (20)+(22)
                  │
           workflow_dispatch ──► same full job anytime
```

## Push behavior

| Event | CI |
| --- | --- |
| Push to `feature/**` or other non-main | **No** automatic CI |
| Push to `main` with only docs/md | **Skipped** (`paths-ignore`) |
| Push to `main` with code/lock/workflow/etc. | Full matrix |

## Pull Request behavior

| Event | CI |
| --- | --- |
| PR with only `docs/**` or `*.md` | **Skipped** |
| PR with any non-ignored path | Full matrix (`build-test` 20+22) |
| New pushes on same PR | Previous run **cancelled** |

## Main behavior

Post-merge pushes run full CI unless the push is documentation-only.

## Documentation-only changes

Ignored paths:

```yaml
paths-ignore:
  - "docs/**"
  - "**/*.md"
```

**Verified safe for this repo:** docs do not generate code, do not build a docs site in CI, and are not compile inputs. ADRs/research/handoffs are evidence, not build artifacts.

**Not ignored:** `.github/workflows/**`, `packages/**`, `examples/**`, `evals/**`, lockfiles, scripts — any of these still trigger CI.

**Caveat:** a PR that *only* touches markdown will show no `build-test` check. If branch protection later requires `build-test`, doc-only PRs may need a trivial non-doc file or `workflow_dispatch`. Documented as risk (private repo currently cannot use Pro branch protection API).

## Concurrency strategy

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

Cancels obsolete runs for the same PR number or branch ref.

## Caching

Unchanged: `actions/setup-node` with `cache: npm`.

## Matrix decisions

**Keep** Node 20 and 22 on remaining triggers. Future optional savings: PR-only Node 20, main/dispatch Node 20+22 — deferred to avoid changing which checks appear on PRs without owner confirmation of required checks.

## Required-check considerations

- Branch protection API returned 403 (private repo / plan limits).  
- Assumed `build-test (20)` / `build-test (22)` might matter.  
- **Preserved** job name `build-test` and both matrix versions.  
- Removing feature `push` removes duplicate check rows, not the check names on PRs.

## Local validation

Commands from root `package.json` (no invented scripts):

```bash
npm run build
npm run typecheck
npm run publish:check
# npm test  — full monorepo; run when touching application code
# npm run examples:smoke — optional; same as CI smoke
```

Results for this change (workflow/docs only): YAML/docs validated by inspection; `publish:check` run green; no application code changes.

## Expected reduction in Actions consumption

| Scenario | Before | After (approx.) |
| --- | --- | --- |
| Feature push + PR (same SHA) | 4 jobs (2 events × 2 nodes) | **2 jobs** (PR only) |
| Docs-only PR/push | 2–4 full jobs | **0** |
| Rapid pushes on one PR | All run to completion | Only **latest** continues |
| Manual full validation | N/A / push spam | `workflow_dispatch` |

Order-of-magnitude: **~50%+** fewer minutes on active PR development; near **100%** skip on pure documentation PRs.

## Risks

1. Doc-only PRs have no status check — merge policy must allow that or use dispatch.  
2. Forgetting to open a PR means no remote CI on a feature branch (by design — validate locally).  
3. Future docs that generate code would need the ignore list revisited.

## Future improvements

- Optional split: PR Node 20 only; main keeps 20+22.  
- Path filters split “docs CI” if a docs site appears.  
- `npm ci` when lockfile is fully deterministic in CI.

---

### Context
Actions minutes exhausted; CI duplicated and too eager.

### Evidence
`.github/workflows/ci.yml` before/after; recent PRs showing push+PR duplicate jobs.

### Decision
PR/main-focused CI, concurrency, docs paths-ignore, keep matrix and job names.

### Rejected
Disabling CI; dropping Node 22 without required-check confirmation; Windows/macOS runners.

### Risk
Missing checks on docs-only PRs if protection is added later.

### Next question
Owner confirms merge of this chore when Actions billing allows, or merge on trust after local validation.
