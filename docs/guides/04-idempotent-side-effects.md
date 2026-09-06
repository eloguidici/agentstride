# Idempotent side effects

## Problem

The model may call a write tool twice, or the response may be lost after the write succeeded. “Call the tool” is easy; **knowing whether it already ran** is the production question.

## Rule

Put idempotency in **domain** (keys, upsert, dedupe), not in a generic core retry framework.

## What to do

- Accept an idempotency key (or fingerprint) on the write path.  
- Store “already created” and return the same result on replay.  
- Assume tools can be invoked more than once for one user intent.

## Evidence

- [`examples/21-side-effect-idempotency`](../../examples/21-side-effect-idempotency)  
- [research](../research/side-effect-idempotency.md)  
- Alarm/change/export verticals reuse the same idea for tickets / records

## Limits

- Core does not ship a universal outbox.  
- Exactly-once across distributed systems is not promised — aim for **at-least-once + idempotent domain**.
