# Velum Grid — data-export / SAR

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/private-polish-pack`

## Context

Third private near-real vertical: compliance / subject-access requests (not alarms, not deploys).

## Hypothesis

Same propose → external approve pattern works for privacy-sensitive exports without core growth.

## Evidence

Example 25 + HTTP + evals; roles `admin` | `privacy-officer`.

## Decision

Org **Velum Grid**. Agent never exports. Repo stays private.

## Rejected

Auto-export; ACME; putting privacy policy in core.

## Next question

Owner release readiness only after polish gates in `docs/narrative/RELEASE_READINESS.md`.
