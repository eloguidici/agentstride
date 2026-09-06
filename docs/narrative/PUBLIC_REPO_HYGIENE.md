# Public repository hygiene

Date: 2026-09-06  
Status: Updated after migration of owner-private notes  
Plan: PP-6

## Findings

| Area | Finding | Action |
| --- | --- | --- |
| Secrets | `.env` gitignored; `.env.example` placeholders | Keep |
| Owner strategy / career / LinkedIn drafts | Lived under `docs/internal/` | **Moved** to private `eloguidici/agentstride-notes` |
| Examples | Many examples; overlap is OK | Keep |
| Generated artifacts | `*.last.json` gitignored | Keep |
| LICENSE | MIT | Gate 3 closed |
| Dry-run | core + openai + tsc + runtime | Green |

## Do not delete

- Development log, ADRs, research notes, eval baselines.  
- Velum Grid fiction.  
- Narrative Pack 1 drafts (product evidence).

## Must not ship in this product repo

- Owner career metrics, LinkedIn About drafts, private growth funnels — keep in **agentstride-notes** only.

## Quality gate

`npm run publish:check` / `npm run package:dry-run` for packaging changes.
