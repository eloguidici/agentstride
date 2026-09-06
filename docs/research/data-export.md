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

Org **Velum Grid**. Agent never exports.

## Rejected

Auto-export; ACME; putting privacy policy in core.

## Related

Example 25 and evals under `evals/`.