# Public repository hygiene

Date: 2026-09-06  
Status: Findings + light actions on `docs/public-productization-prep`  
Plan: PP-6

## Findings

| Area | Finding | Action |
| --- | --- | --- |
| Secrets | `.env` gitignored; `.env.example` placeholders; tests use fake keys | Keep; already audited in release-gate |
| Handoffs | Older handoffs remain as history | Keep (evidence); current handoff points to productization plan |
| Examples | Many examples; some overlap (Nest 12 vs 18 vs 26) | Keep all — useful evidence; README no longer catalogs every one |
| Internal process language | Old README mentioned ChatGPT/Codex/Cursor in product voice | Removed from root README product sections |
| Generated artifacts | `packages/*/dist` present in workspace; publish uses `files` | Dry-run verifies tarball contents |
| Terminology | “production-ready” absent from product docs | Maintain claim discipline ([PUBLIC_WORDING_REVIEW](./PUBLIC_WORDING_REVIEW.md)) |
| Stale package README claims | Core README fixed in release-gate | OK |
| Duplicate plan docs | Production-validation plan + productization plan both exist | Keep both; handoff points to productization as **next** |
| LICENSE | MIT present at repo root | Confirm at OWNER GATE 3 |
| Private posture | Explicit in README / RELEASE_READINESS | Keep until owner flips |

## Do not delete

- Development log, ADRs, research notes, eval baselines — historical evidence.  
- Velum Grid fiction — intentional demo org, not customer data.

## Actions taken this pass

- Root README productization (PP-3).  
- Origins/vision clarifying lines (PP-2).  
- Story index status column (PP-1).  
- No mass deletion of examples or docs.

## Follow-ups (optional, non-blocking)

- Consider a short `examples/README.md` “start here” path for strangers (already has a table).  
- After owner selects stories, add `docs/narrative/drafts/` (PP-8) — **not** before.

## Quality gate

Run on this branch before merge:

```bash
npm run build
npm run typecheck
npm test
npm run publish:check
```

---

### Context
Make the private repo readable by future strangers without destroying evidence.

### Evidence
Release-gate audit; doc inventory; README rewrite.

### Decision
Hygiene via clarity + claim control, not deletion.

### Rejected
Deleting verticals “to look smaller”; opening the repo as hygiene.

### Risk
Internal handoff paths confuse public readers — mitigated by clearer README status.

### Next question
Owner launch checklist after gates 1–3.
