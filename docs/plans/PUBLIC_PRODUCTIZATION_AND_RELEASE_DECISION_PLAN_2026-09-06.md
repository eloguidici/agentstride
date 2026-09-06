# AgentStride - Public Productization and Release Decision Plan

Date: 2026-09-06  
Status: Private preparation in progress / autonomous prep landing on `docs/public-productization-prep`  
Repository posture: **private until explicit owner approval**

This plan starts after the engineering release gate.

AgentStride has reached a point where adding more runtime features is no longer the highest-value work. The next phase is to turn the existing technical evidence into a clear public product story, prepare a conservative first release, and stop before any irreversible public action unless the owner explicitly approves it.

This plan is intentionally split into:

- work an AI coding tool may complete autonomously;
- owner decision gates where the tool must stop;
- evidence/narrative capture required before public launch.

The repository remains the shared memory between ChatGPT, Codex, Cursor and other development environments.

---

## 1. Starting state

At the beginning of this phase, the repository should already contain:

- production validation Tracks A–G;
- pre-1.0 API freeze decisions (ADR 0013);
- enterprise and Velum Grid vertical slices;
- deterministic eval baselines;
- nested cancellation;
- parent/child run causality;
- OpenTelemetry proof;
- human approval;
- domain-level idempotency examples;
- usage accounting proof;
- release engineering gate green;
- story index and evidence map.

Engineering has already demonstrated that realistic vertical slices can grow without forcing domain logic or production concerns into `@agentstride/core`.

The central product question is no longer:

> What feature should we add next?

It is:

> What is the smallest, clearest and most credible public version of AgentStride?

---

## 2. Guiding principles

### 2.1 No more feature expansion during productization

Do not add:

- another vertical slice;
- another provider;
- workflow/graph engine;
- scheduler;
- browser/voice;
- full A2A;
- new memory taxonomy;
- hosted tracing;
- policy engine;
- generic retry/idempotency framework;
- new public package merely to show completeness.

A new runtime feature requires a separate future product need.

### 2.2 Public claims must be evidence-backed

Every statement in README, release notes, articles or social posts should map to repository evidence.

Examples:

Claim:
> nested cancellation propagates to delegated local agents

Evidence:
- ADR 0010;
- core tests;
- research note.

Claim:
> AgentStride supports parent/child multi-agent causality without a global event bus

Evidence:
- ADR 0011;
- run-causality tests;
- Receptionist example.

Never publish unsupported performance, productivity or migration claims.

### 2.3 Prefer a narrow first release

Do not expose every incubated package as equally stable.

The first public story should center on the smallest useful product.

### 2.4 Public wording must be human and technical

Avoid:

- "revolutionary";
- "enterprise-grade" without context;
- "production-ready" as a blanket claim;
- "better than LangChain/Mastra";
- generic AI marketing language;
- fake benchmark language.

Prefer:

- what the runtime does;
- why it exists;
- what trade-offs it makes;
- what was deliberately left out;
- evidence from real examples.

### 2.5 Stop at owner gates

The AI must not infer approval to:

- make repository public;
- remove package `private: true`;
- publish npm packages;
- choose final semver;
- choose public stories on behalf of the owner;
- announce externally;
- publish LinkedIn articles/posts.

Prepare recommendations, then stop.

---

# Phase PP-1 - Public story selection

Priority: P0

## Objective

Reduce the large internal history into a coherent initial public narrative.

Do not publish anything yet.

## Recommended initial story set

Prepare a recommendation around 3–5 stories from `docs/narrative/story-index.md`.

Recommended default shortlist:

### Story A - Origins / ReceptionistAgent

Core idea:

An older enterprise multi-agent architecture already had specialized agents, a Receptionist, correlation and delegation. AgentStride keeps the useful ideas but removes the global event bus and runtime-heavy message model.

Evidence:

- `docs/origins.md`
- ADR 0003
- examples 04 / 17
- ADR 0011

### Story B - Cancellation is not Promise.race

Core idea:

Stopping the outer promise is not the same as stopping in-flight model/tool/nested-agent work.

Evidence:

- ADR 0009
- ADR 0010
- nested cancellation tests
- enterprise HTTP cancellation path

### Story C - The agent is not its own approver

Core idea:

Sensitive actions should be proposed by agents but approved externally.

Evidence:

- example 20
- human approval evals
- research note

### Story D - Idempotent side effects

Core idea:

The difficult production question is not "can the model call a tool?" but "what if the action succeeded and the response was lost?"

Evidence:

- example 21
- idempotency tests
- research note

### Story E - Evals measure behavior, not just code

Evidence:

- deterministic eval harness
- baselines
- evaluation research note

## Tasks

1. Review all story-index candidates.
2. Recommend a first 3–5 story sequence.
3. For each candidate create a short editorial brief:
   - problem;
   - technical insight;
   - evidence;
   - intended audience;
   - diagrams/code snippets available;
   - risks/claims to avoid.
4. Update `docs/narrative/story-index.md` with status:
   - raw;
   - recommended;
   - draftable;
   - owner-selected;
   - published.
5. Do not mark anything owner-selected unless explicitly approved.

## Narrative artifact

Create:

`docs/narrative/PUBLIC_STORY_SELECTION.md`

## Exit criteria

- recommended first story set exists;
- each story has evidence links;
- no publication occurred;
- owner gate is clearly identified.

---

# OWNER GATE 1 - Story selection

The owner must choose which stories will be prepared for first public use.

If no owner decision exists, the AI may prepare recommendations but must not decide that stories are approved for publication.

---

# Phase PP-2 - Public wording review

Priority: P0

## Objective

Review public-facing wording before repository visibility changes.

Files:

- `README.md`
- `docs/vision.md`
- `docs/origins.md`
- `docs/architecture.md`
- package READMEs
- release notes
- SECURITY/LICENSE/PUBLISH docs

## Review questions

### Origins

- Does the historical description avoid customer names/private details?
- Does it describe prior architecture as technical history, not as confidential employer material?
- Does it clearly distinguish old architecture from AgentStride?

### Vision

Can someone understand in 60 seconds:

- why AgentStride exists;
- what it does;
- what it intentionally does not do;
- why portability matters?

### Claims

Search for language such as:

- production-ready;
- enterprise-grade;
- secure;
- fully A2A;
- guaranteed structured output;
- zero lock-in;
- faster/cheaper/better.

Verify or soften every claim.

## Deliverable

Create:

`docs/narrative/PUBLIC_WORDING_REVIEW.md`

It should list:

- safe as-is;
- recommended rewrite;
- claim requiring evidence;
- content to omit publicly.

Do not rewrite historical facts beyond available evidence.

## Exit criteria

- public docs reviewed;
- NDA/private-data risk review documented;
- recommended changes ready.

---

# Phase PP-3 - README productization

Priority: P0

## Objective

Make the root README communicate the strength of the project without becoming long or promotional.

## Target README shape

### 1. What AgentStride is

One concise paragraph.

Suggested concept:

> AgentStride is a lightweight TypeScript runtime for building portable AI agents without committing too early to a large framework.

### 2. Positioning

Use the existing principle:

> Build simple. Grow deliberately.

Possible supporting line:

> Start lightweight. Stay if it is enough. Graduate if it is not.

### 3. Minimal quick start

A real small agent should remain easy to understand.

### 4. Why AgentStride

Prefer 4–6 evidence-backed bullets:

- small provider-agnostic core;
- typed portable tools;
- structured output;
- explicit delegation;
- run/cancellation/causality;
- optional integrations.

### 5. Production evidence

Short section linking to:

- evals;
- human approval;
- idempotency;
- OTel proof;
- Nest/enterprise examples.

Do not claim that examples make every deployment production-ready.

### 6. Architecture

Simple diagram.

### 7. When not to use AgentStride

Important differentiator.

Examples:

Use a larger framework when you already need:

- durable workflows;
- large graph orchestration;
- hosted control plane;
- extensive provider/integration catalog;
- platform-specific features.

### 8. Portability / graduate path

Explain migration intent carefully.

No inflated migration percentages in the hero section.

### 9. Status

Clearly state pre-1.0/private/public status depending on owner decision.

## Requirements

- readable in a few minutes;
- not a catalog of every example;
- no generic framework marketing;
- no unsupported claims;
- no mention of AI coding tools in product positioning;
- technical evidence links available.

## Exit criteria

- README draft ready;
- no publication action;
- owner can review a single coherent product page.

---

# Phase PP-4 - Package release scope recommendation

Priority: P0

## Objective

Recommend the smallest sensible npm surface for an initial public release.

## Candidates

### Tier 1 - strongest initial candidates

- `@agentstride/core`
- `@agentstride/openai`

### Tier 2 - possible but should be justified

- `@agentstride/rag`
- `@agentstride/memory`
- `@agentstride/nestjs`
- `@agentstride/mcp`

### Experimental / likely defer

- `@agentstride/a2a`
- `@agentstride/migrate` depending on positioning

## Analysis required

For every package:

- purpose;
- maturity;
- test coverage;
- public API stability;
- dependency surface;
- README quality;
- whether it is essential to first story;
- whether "experimental" labeling is sufficient;
- whether publishing it creates compatibility burden.

## Deliverable

Create:

`docs/narrative/INITIAL_PACKAGE_SCOPE_RECOMMENDATION.md`

Include at least three options:

### Conservative

core + openai only.

### Balanced

core + openai + selected optional package(s).

### Full incubation set

Explain why this is probably not recommended initially.

Provide a recommendation, but do not remove `private: true`.

---

# OWNER GATE 2 - Package scope

**CLOSED 2026-09-06 — Option A:** initial npm surface (when launch approved) = `@agentstride/core` + `@agentstride/openai` only.

No package may be made publishable solely because the recommendation exists. Still requires explicit launch authorization.

---

# Phase PP-5 - Semver and compatibility recommendation

Priority: P0

## Objective

Recommend an initial version without falsely implying API maturity.

## Evaluate

- `0.1.0`
- `0.2.0`
- `1.0.0`

Default recommendation should favor pre-1.0 unless there is a strong reason otherwise.

ADR 0013 means "freeze candidate", not necessarily "1.0 now".

## Deliverable

`docs/narrative/VERSIONING_RECOMMENDATION.md`

Include:

- chosen recommendation;
- why;
- compatibility expectations;
- experimental package policy;
- breaking-change policy before 1.0;
- relation to ADR 0013.

Do not edit package versions until owner approves.

---

# OWNER GATE 3 - Version and license confirmation

**CLOSED 2026-09-06:** first authorized public versions = **`0.1.0`**; license = **MIT**.

Tree remains `0.0.0` / `private: true` until explicit launch authorization. No automatic publish.

---

# Phase PP-6 - Public repository hygiene pass

Priority: P1

## Objective

Prepare the repository for strangers reading it.

This is not feature work.

## Review

- stale branches/docs references;
- superseded handoffs;
- duplicate/confusing examples;
- accidental internal language;
- TODOs;
- debug logs;
- generated artifacts;
- secrets;
- .env handling;
- package metadata;
- links;
- terminology consistency;
- spelling/grammar where material.

## Important rule

Do not delete history/evidence simply because it is verbose.

Differentiate:

- useful historical evidence;
- obsolete instructions that would confuse users;
- internal-only notes that should remain private;
- public-facing docs.

## Deliverable

`docs/narrative/PUBLIC_REPO_HYGIENE.md`

with findings and actions.

Run full quality gate after changes.

---

# Phase PP-7 - Release dry run

Priority: P1

## Objective

Prove that selected packages could be published without actually publishing.

Only after owner has selected package scope/version may version-specific preparation happen.

Before approval, dry run may inspect packaging only.

## Checks

- npm pack/dry-run equivalent where safe;
- package contents;
- dist declarations;
- package exports;
- dependencies;
- README inclusion;
- license inclusion;
- no private files/secrets;
- install into a temporary consumer project;
- minimal TypeScript compile;
- minimal runtime execution.

## Recommended smoke consumer

Create temporary/untracked or scripted validation that behaves like an external project:

```text
consumer/
  npm install packed @agentstride/core
  compile simple agent
  run simple fake-model example
```

Do not add unnecessary permanent scaffolding if a script can verify it.

## Deliverable

`docs/research/public-package-dry-run.md`

Record exact commands/results.

---

# Phase PP-8 - Public narrative pack

Priority: P1

## Objective

Prepare drafts for owner-selected stories, without publishing them.

## Structure

Possible:

```text
docs/narrative/drafts/
  01-origins.md
  02-cancellation.md
  03-human-approval.md
```

Only create drafts for owner-selected stories.

## Each draft should include

- title;
- hook;
- problem;
- architecture/code insight;
- evidence;
- diagram/snippet candidates;
- limitation/trade-off;
- takeaway;
- source artifact links.

Keep draft facts traceable.

## LinkedIn vs article

For each story, prepare:

- concise LinkedIn angle;
- longer technical article outline.

Do not publish.

---

# Phase PP-9 - Launch checklist

Priority: P1

## Objective

Prepare a reversible, explicit checklist for the day the owner decides to launch.

## Checklist should include

1. final main green;
2. secret scan;
3. public wording review complete;
4. owner-selected stories;
5. version selected;
6. package scope selected;
7. license confirmed;
8. repository visibility decision;
9. npm scope/package availability verified at that time;
10. package dry run green;
11. release notes;
12. tags/version commits;
13. public repo action;
14. npm publish action;
15. first narrative post;
16. post-release smoke test.

Because npm/package availability and tooling can change, re-check live state at launch time.

## Deliverable

Update:

`docs/narrative/RELEASE_READINESS.md`

Do not execute public actions.

---

# OWNER GATE 4 - Launch authorization

The project must stop here unless the owner explicitly says to make the repo public and/or publish npm.

Allowed without authorization:

- docs;
- recommendations;
- drafts;
- dry runs;
- local/package smoke validation.

Not allowed:

- change GitHub visibility;
- npm publish;
- public social post;
- release announcement.

When reaching this gate, the handoff must state:

> The engineering and productization work that can be done privately is complete. The project should pause here for an owner launch decision.

---

## 3. Narrative documentation requirements

This phase continues the existing narrative discipline.

For every meaningful productization decision, capture:

### Context
What public/product problem was being solved?

### Evidence
What repository artifact supports the decision?

### Decision
What wording/scope/version/package was recommended?

### Rejected alternatives
What broader or more aggressive option was avoided?

### Risk
What could be misinterpreted publicly?

### Owner gate
Does this require explicit approval?

Update:

- `docs/development-log.md`;
- `docs/narrative/story-index.md`;
- relevant research/narrative doc;
- current handoff.

The goal is to preserve the history of how a technical project became a public product, not only the history of code changes.

---

## 4. Recommended branch sequence

Use separate branches and merge only when green.

Suggested:

1. `docs/public-story-selection`
2. `docs/public-wording-review`
3. `docs/readme-productization`
4. `docs/release-scope-recommendation`
5. `chore/public-repo-hygiene`
6. `chore/package-dry-run`
7. narrative draft branches only after owner story selection

Do not bundle irreversible public actions into these branches.

---

## 5. Quality gate

For any branch touching code/package metadata:

```bash
npm run build
npm run typecheck
npm run test
npm run publish:check
```

Run evals relevant to modified examples.

Docs-only branches should still avoid stale/incorrect references.

---

## 6. Stop conditions

Stop autonomous work and ask the owner when:

- story selection is required;
- package publication scope is required;
- semver must be chosen;
- license needs confirmation;
- public wording involves a fact not supported by the repository;
- changing visibility is the next action;
- npm publication is the next action;
- a new technical feature would be needed only to improve marketing;
- productization is complete and remaining work is launch authorization.

Do not create another engineering track to avoid stopping.

---

## 7. Definition of success

This phase is successful when:

- AgentStride has a concise public story;
- README communicates more strongly than the current internal README;
- first stories are evidence-backed;
- package release scope is deliberately narrow;
- versioning recommendation is explicit;
- public repo hygiene is complete;
- selected packages pass external-consumer dry run;
- narrative drafts are grounded in source evidence;
- launch checklist is ready;
- no public action occurs without explicit owner approval.

At that point, if the owner has not authorized launch, the correct action is to stop.

---

## Internal promotion strategy reference

Distribution and early-adoption planning is documented privately in:

`docs/internal/INTERNAL_GROWTH_AND_PROMOTION_STRATEGY_2026-09-06.md`

This document may guide launch preparation, channel strategy, first-user goals and post-launch measurement.

It does not authorize public launch or publication.

Before making the repository public, review the internal strategy file and decide whether to remove, move or convert it.
