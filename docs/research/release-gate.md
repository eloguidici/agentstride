# Release gate engineering pass

Date: 2026-09-06  
Branch: `chore/release-gate`  
Status: Engineering checks green; public/npm still blocked

## Commands run

```bash
npm run build
npm test          # all workspaces fail 0
npm run typecheck
npm run publish:check
```

## Secrets

- `.gitignore` covers `.env` and `.env.*` (keeps `.env.example`)
- No live API keys in git; `.env.example` is empty placeholders
- HTTP tests set `AGENT_API_KEY=test-secret` in-process only

## Docs touched

- `packages/core/README.md` — aligned with ADR 0013 (no longer claims “API not frozen / features ahead”)
- `packages/rag/README.md`, `packages/memory/README.md` — minimal install/usage clarity
- `docs/narrative/RELEASE_READINESS.md` — engineering boxes checked

## Still owner-only

Story selection for public narrative; origins/vision wording; public repo; npm publish.
