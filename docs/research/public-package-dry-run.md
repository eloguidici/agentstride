# Public package dry-run (`@agentstride/core` + `@agentstride/openai`)

Date: 2026-09-06  
Status: **Passed locally** — packages since published as `0.1.0`  
Script: `scripts/package-dry-run.mjs`  
Scope: `@agentstride/core` + `@agentstride/openai`  
Current tarball versions: **`0.1.0`**

## Goal

Prove an external-style consumer can:

1. install packed Gate-2 tarballs;
2. import AgentStride (`core` + `openai`);
3. typecheck a minimal TypeScript agent (`tsc --noEmit`);
4. execute a fake-model agent at runtime;

without publishing and without calling a live OpenAI API.

## Commands

```bash
npm run build -w @agentstride/core -w @agentstride/openai
npm run package:dry-run
```

The script:

1. builds `core` and `openai`;
2. `npm pack` for both;
3. inspects pack file lists (`dist/index.js`, `dist/index.d.ts`, README);
4. creates a temp consumer with `file:<tarball>` deps + `zod` + `typescript`;
5. `npm install`;
6. writes `run.ts` that imports `createAgent` / `createOpenAIModel` (openai factory uses a throwing `fetchImpl` so live HTTP cannot succeed);
7. `tsc --noEmit`;
8. runs equivalent `run.mjs` smoke;
9. deletes tarballs + temp dir;
10. writes `docs/research/public-package-dry-run.last.json` (gitignored).

## Result (2026-09-06, post-`0.1.0` bump)

| Step | Result |
| --- | --- |
| build core + openai | ok |
| npm pack core | `files=23` (no source maps); `dts=true; js=true; readme=true` |
| npm pack openai | `files=5`; `dts=true; js=true; readme=true` |
| npm install (temp) | ok |
| `tsc --noEmit` | `tsc-ok` |
| consumer run | `consumer-run:ok` |

Re-run after clean rebuild; see also `validate:battery` T7 (GREEN).

## Notes

- First-wave packages are published at **`0.1.0`**; this script remains useful as a regression check before later releases.
- Live OpenAI is **not** exercised; adapter import + types are.
- Deferred packages remain `0.0.0` / private and are out of this dry-run.

## Context

Need evidence that packaging for the selected first release is not theoretical.

## Evidence

Script output + `public-package-dry-run.last.json` after each run.

## Decision

Record dry-run as green for Gate-2 packaging readiness (install + tsc + runtime) at **`0.1.0`**.

## Rejected

`npm publish` without owner OK; requiring live API keys for the smoke test.

## Risk

Consumers on older Node — engines say `>=20`. Slow first `npm install` in temp dirs on constrained networks.

## Next question

Keep `npm run package:dry-run` green before each subsequent publish.