# Publish readiness

AgentStride packages remain **private** until an intentional public release.

## Checklist before first npm publish

1. Repository visibility decision (still private by default).
2. Owner-private strategy notes live in `eloguidici/agentstride-notes` (not in this tree).
3. `npm ci && npm run typecheck && npm run test && npm run build` (or `npm install` if lockfile incomplete)
4. `npm run publish:check`
5. `npm run package:dry-run`
6. Confirm no secrets in git / `.env` ignored
7. Bump versions to `0.1.0` (Gate 3)
8. Remove `"private": true` from `@agentstride/core` and `@agentstride/openai` only
9. Ensure package `README.md` + `LICENSE` present in each publishable package
10. Tag release and `npm publish` under `@agentstride/*` (`publishConfig.access` is already `public`)

See `docs/engineering/PUBLIC_NPM_READINESS_AUDIT.md`.

## Local commands

```bash
node scripts/sync-workspace-lock.mjs
npm install --no-audit --no-fund
npm run build
npm run publish:check
```

Until the lockfile includes the full third-party tree, CI uses `npm install` (not `npm ci`). Switch back to `npm ci` after a clean lockfile regeneration on a machine with working registry access.

During incubation packages were typed from `src/`. **Track H switched `exports.types` to `dist/*.d.ts`** (ADR 0013). Always `npm run build` before typecheck across workspaces.

Do **not** run `npm publish` from CI until the public release is explicitly approved. See `docs/narrative/RELEASE_READINESS.md` — repo stays private until the owner says otherwise.
