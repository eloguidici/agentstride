# Public repository hygiene

Date: 2026-09-06  
Status: Updated on `docs/private-productization-completion`  
Plan: PP-6 (+ internal disposition)

## Findings

| Area | Finding | Action |
| --- | --- | --- |
| Secrets | `.env` gitignored; `.env.example` placeholders; tests use fake keys | Keep |
| Handoffs | Older handoffs remain as history | Keep (evidence) |
| Examples | Many examples; overlap is OK | Keep; README lists representative only |
| Internal process language | Removed from root README product voice | Keep disciplined |
| Generated artifacts | `*.last.json` gitignored where needed | Keep |
| Terminology | No blanket production-ready claims | Maintain |
| LICENSE | MIT | Gate 3 closed |
| **`docs/internal/`** | Growth + LinkedIn + career drafts | **Must remove/move before public** — see disposition |
| Pack 1 drafts | Under `docs/narrative/drafts/` | OK to stay (technical); not LinkedIn profile text |
| Dry-run | core + openai + tsc + runtime | Green |

## Do not delete

- Development log, ADRs, research notes, eval baselines.  
- Velum Grid fiction.  
- Narrative Pack 1 drafts (product evidence).

## Must not ship publicly as-is

- Entire `docs/internal/` tree (career metrics, LinkedIn About, growth funnel).

## Actions taken

- Productization README / wording / story selection (prior).  
- Pack 1 drafts (prior).  
- Internal strategy + LinkedIn prep + disposition (this pass).  
- Extended package dry-run (this pass).

## Follow-ups (owner / Gate 4)

- Execute internal docs disposition before visibility flip.  
- Optional: rebase/merge PR #26 validation battery.

## Quality gate

Docs/script change: `npm run package:dry-run` (green). Full monorepo gate optional for docs-only.

---

### Context
Strangers + accidental internal career docs must not mix.

### Evidence
Inventory of `docs/internal/`; dry-run results.

### Decision
Keep engineering evidence; quarantine internal strategy until owner deletes/moves it.

### Rejected
Publishing with `docs/internal/` still linked; deleting ADRs for “cleanliness.”

### Next question
OWNER GATE 4.
