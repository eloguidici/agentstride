# Internal evaluation harness

Private workspace (`@agentstride/evals-internal`). Not a public `@agentstride/evals` package.

Measures **agent decisions** against explicit expectations — complementary to unit tests that prove the runtime works.

## Enterprise support (first domain)

```bash
npm run eval:enterprise-support -w @agentstride/evals-internal
npm test -w @agentstride/evals-internal
```

Deterministic fake/scripted models only for the baseline. Live-model scoring is deferred until the harness and dataset are stable.

See `enterprise-support/README.md` and `docs/research/evaluation-harness.md`.
