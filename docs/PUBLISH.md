# Publishing maintainers notes

First public cut: `@agentstride/core@0.1.0` and `@agentstride/openai@0.1.0` (MIT, `publishConfig.access=public`).

Other workspace packages stay `private` until explicitly authorized.

## Before a release

1. `npm run build && npm run typecheck && npm test`
2. `npm run publish:check`
3. `npm run package:dry-run` (consumer install + tsc + runtime smoke)
4. Confirm no secrets in git; `.env` ignored
5. Bump versions; update `docs/RELEASE_NOTES.md`
6. `npm publish -w @agentstride/core` then `-w @agentstride/openai`
7. Tag `vX.Y.Z` and push the tag

## Local helpers

```bash
npm run build
npm run publish:check
npm run package:dry-run
```

Package `exports.types` point at `dist/*.d.ts` (ADR 0013). Always build before cross-workspace typecheck.

Do **not** publish from CI unless that pipeline is intentionally enabled for a release.
