# Nest / HTTP embed

## Problem

You want the agent behind your existing backend (API key, request context, abort on disconnect) without turning AgentStride into Nest.

## Rule

Use Nest (or plain Node HTTP) as the **app shell**. AgentStride is a library call inside a handler. Optional helpers live in `@agentstride/nestjs` — patterns are proven in examples even if you copy rather than depend.

## What to do

1. Create the agent in a provider / module factory.  
2. Pass `AbortSignal` from the request when the client disconnects.  
3. Keep approve/reject as **separate** routes from `agent.run`.

## Evidence

| Example | Focus |
| --- | --- |
| [`12-nestjs-app`](../../examples/12-nestjs-app) | Minimal Nest embed |
| [`18-enterprise-support-http`](../../examples/18-enterprise-support-http) | Support slice over HTTP |
| [`26-velum-grid-nestjs`](../../examples/26-velum-grid-nestjs) | Alarm + change-gate Nest surface |
| [`23` / `24` `http.mjs`](../../examples/23-alarm-triage) | Plain Node HTTP approve/reject |

Package: [`packages/nestjs`](../../packages/nestjs) (optional; Gate 2 first publish is core + openai only).

## Limits

- Nest version coupling stays in the Nest package / your app.  
- Do not move domain policy into core to “fit” DI.
