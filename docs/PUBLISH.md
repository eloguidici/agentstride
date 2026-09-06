# Publish readiness

AgentStride packages remain **private** until an intentional public release.

## Checklist before first npm publish

1. Repository visibility decision (still private by default).
2. `npm ci && npm run typecheck && npm run test && npm run build`
3. `npm run publish:check`
4. Confirm no secrets in git history / `.env` ignored
5. Bump versions from `0.0.0` with a real semver policy
6. Remove `"private": true` from packages you intend to publish
7. Ensure each package `README.md` documents install + minimal usage
8. Tag release and publish under `@agentstride/*` (npm org access required)

## Local commands

```bash
node scripts/sync-workspace-lock.mjs
npm install --no-audit --no-fund
npm run build
npm run publish:check
```

Until the lockfile includes the full third-party tree, CI uses `npm install` (not `npm ci`). Switch back to `npm ci` after a clean lockfile regeneration on a machine with working registry access.

CI builds packages before typecheck because package `exports` resolve types from `dist/`.

Do **not** run `npm publish` from CI until the public release is explicitly approved.
