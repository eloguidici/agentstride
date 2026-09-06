# Evals

## Problem

Unit-testing tool functions does not prove the **agent decided** correctly (ticket vs page vs drop, propose vs execute, etc.).

## Rule

Run a deterministic harness: fixed cases → agent (often with a scripted model) → scorers on structured outcomes. Keep evals **outside** core as a repo workflow.

## What to do

1. Define cases (JSON) with expected decision fields.  
2. Run the example agent under a fake/scripted model when possible.  
3. Diff against baselines under `evals/results/`.

```bash
npm run eval:enterprise-support -w @agentstride/evals-internal
npm test -w @agentstride/evals-internal
```

See [`evals/README.md`](../../evals/README.md) for domain-specific scripts (alarm-triage, change-gate, etc.).

## Evidence

- [`evals/`](../../evals/)  
- [research](../research/evaluation-harness.md)  
- Baselines for enterprise-support, human-approval, alarm-triage, change-gate, data-export

## Limits

- These evals measure **behavior under scripted conditions**, not live-LLM leaderboards.  
- Flaky live-model scores are not the default gate.
