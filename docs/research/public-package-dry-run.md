# Public package dry-run (`@agentstride/core`)

Date: 2026-09-06  
Status: **Passed locally** — no npm publish  
Script: `scripts/package-dry-run.mjs`

## Goal

Prove an external-style consumer can install a packed `@agentstride/core` tarball, import it, and run a minimal agent — without publishing.

## Commands

```bash
npm run build -w @agentstride/core
node scripts/package-dry-run.mjs
```

The script:

1. builds core;
2. `npm pack` in `packages/core`;
3. dry-run inspects pack file list (`dist/index.js`, `dist/index.d.ts`, README);
4. creates a temp consumer with `"@agentstride/core": "file:<tarball>"` + `zod`;
5. `npm install`;
6. runs a fake-model agent via `node run.mjs`;
7. deletes tarball + temp dir;
8. writes `docs/research/public-package-dry-run.last.json` (gitignored).

## Result (2026-09-06)

| Step | Result |
| --- | --- |
| build | ok |
| npm pack | `agentstride-core-0.0.0.tgz` |
| pack contents | `files=52; dts=true; js=true; readme=true` |
| npm install (temp) | ok |
| consumer run | `consumer-run:ok run_mtq6tmuj_9z9f888r` |

## Notes

- Package remains `"private": true` — pack works locally; publish still forbidden.
- Types entry is `dist/index.d.ts` (ADR 0013 packaging).
- This dry-run uses ESM JS for the consumer smoke test. Declaration files are present in the tarball for TS consumers; a dedicated `tsc` consumer can be added when the owner selects publish scope/version.
- Recommended first publish set remains **core (+ openai later)** — see `docs/narrative/INITIAL_PACKAGE_SCOPE_RECOMMENDATION.md`.

## Context

Need evidence that packaging is not theoretical.

## Evidence

Script output + `public-package-dry-run.last.json` after each run.

## Decision

Record dry-run as green for core packaging readiness prep.

## Rejected

`npm publish`; removing `private`.

## Risk

Consumers on older Node — engines say `>=20`.

## Next question

Owner gates 1–3 before any real publish.
