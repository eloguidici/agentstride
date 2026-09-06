# Enterprise support evaluation domain

Deterministic decision dataset for `examples/17-enterprise-support-agent`.

## What is measured

Each case declares explicit expectations:

- `decision` / `requiresHumanApproval` / optional `risk`
- `mustCall` / `mustNotCall` (receptionist tools)
- `mustCallNested` (SecurityAgent tools via `onSecurityEvent`)
- expected failures (`status: "failed"`, error name/message)

## Honesty about scripted models

Baseline mode uses **case scripts**, not a live LLM. That means we are scoring:

1. that the wired stack (domain tools + schema + nested delegation) produces observable tool/event artifacts; and
2. that scorers correctly grade `AgentRun` / errors against expectations.

This is the foundation for later live-model evals. It does **not** claim the scripted policy is an LLM judgment.

## Run

```bash
npm run eval:enterprise-support -w @agentstride/evals-internal
```

Writes `evals/results/baseline-enterprise-support.json`.
