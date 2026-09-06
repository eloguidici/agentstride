# Internal Growth and Promotion Strategy

Status: **Internal / private planning**  
Date: 2026-09-06

This file is intentionally internal while AgentStride remains private.

Before making the repository public, this document must be reviewed and then either:

- removed;
- moved outside the public repository;
- or reduced into public-facing launch/community material.

It should not be exposed publicly in its current strategic form without an explicit owner decision.

---

## 1. Objective

The first goal is not "get thousands of GitHub stars".

The first meaningful target is:

> Get the first 10 external developers to actually try AgentStride.

Secondary milestones can then be:

- first 25 stars;
- first 50 stars;
- first 100 stars;
- first external issue;
- first external fork;
- first external contribution;
- first real project using the package;
- first repeat user.

Stars and downloads matter because they create discovery and social proof, but they should be treated as outcomes of real interest.

---

## 2. Growth flywheel

The intended growth loop is:

```text
Engineering evidence
        ↓
Technical story
        ↓
LinkedIn / HN / Reddit / communities
        ↓
GitHub visitor
        ↓
Clear README + tiny example
        ↓
Clone / npm install
        ↓
Developer builds something
        ↓
Issue / feedback / star / fork
        ↓
New evidence
        ↓
Next technical story
        ↺
```

AgentStride should grow through developer trust, not generic marketing.

---

## 3. Positioning

Preferred positioning:

> AgentStride is a lightweight TypeScript runtime for building portable AI agents without committing too early to a large framework.

Core phrase:

> Build simple. Grow deliberately.

Supporting phrase:

> Start lightweight. Stay if it is enough. Graduate if it is not.

Do not position AgentStride as:

- "better than LangChain";
- "better than Mastra";
- "a framework for beginners";
- "enterprise-grade" without qualification;
- "production-ready" as a blanket claim;
- "zero lock-in";
- "the fastest";
- "the cheapest";
- "the most complete".

The differentiator is:

- small core;
- production-minded primitives;
- portable domain logic;
- explicit migration/exit path;
- evidence-driven design.

---

## 4. GitHub conversion strategy

GitHub is the main technical proof surface.

A new visitor should understand within roughly 30 seconds:

1. what AgentStride is;
2. why it exists;
3. why not immediately use a larger framework;
4. how to run a minimal example;
5. where the strongest production evidence lives.

The root README should prioritize:

- positioning;
- minimal quick start;
- architecture;
- 4–5 curated proofs;
- when NOT to use AgentStride;
- portability / graduate path;
- current maturity.

Do not put all 20+ examples in the hero section.

Recommended public proof set:

- minimal tool agent;
- Receptionist / local delegation;
- eval harness;
- human approval;
- idempotent side effects;
- optionally Nest/OTel as deeper links.

---

## 5. Narrative-led launch

Do not launch with only:

> "AgentStride is now available."

Launch through technical stories that naturally lead to the repository.

### Story 1 — Origins / ReceptionistAgent

Angle:

An older enterprise multi-agent system already had:

- ReceptionistAgent;
- specialized agents;
- request correlation;
- delegation;
- RxJS event bus.

AgentStride keeps the useful ideas and removes accidental complexity.

Useful visual:

```text
OLD
Receptionist
  ↓
Global Event Bus
  ↓
Message DTOs
  ↓
Agents
  ↓
requestId

NEW
Receptionist
  ↓
AgentLike / Tool
  ↓
Specialist
  ↓
AgentRun
  ↓
parentRunId
```

### Story 2 — Cancellation is not Promise.race

Angle:

Stopping the caller's wait does not necessarily stop the actual work.

Evolution:

```text
Promise.race
  ↓
caller stops waiting
  ↓
model/tool may continue
```

to:

```text
AbortSignal
  ↓
model
  ↓
tool
  ↓
nested agent
```

### Story 3 — The agent is not its own approver

Angle:

Sensitive actions should follow:

```text
propose ≠ approve ≠ execute
```

Use the human-approval example as evidence.

### Story 4 — Idempotent side effects

Angle:

The hard production problem is:

> What if the action succeeded but the response was lost?

Use duplicate/retry tests.

### Story 5 — Testing decisions, not only code

Angle:

- unit tests verify runtime behavior;
- evals verify expected agent behavior.

Use deterministic baselines.

---

## 6. Channel strategy

### LinkedIn — primary initial channel

Use LinkedIn as both:

- developer discovery;
- professional positioning.

Recommended post pattern:

```text
Problem
  ↓
Unexpected finding
  ↓
Small diagram/code
  ↓
Decision/trade-off
  ↓
Evidence
  ↓
GitHub link
```

Avoid repeatedly asking for stars.

Prefer useful technical content that makes readers curious enough to inspect the repository.

### Hacker News

Potential format:

> Show HN: AgentStride — a lightweight TypeScript runtime for portable AI agents

Only launch when:

- repo is public;
- README is polished;
- install path works;
- examples are easy;
- first release scope is clear.

### Reddit

Use technical communities only when the post itself provides value.

Avoid cross-post spam.

Potential topics:

- TypeScript;
- Node.js;
- AI agents;
- LLM tooling;
- software architecture;
- MCP-related communities when relevant.

### Dev.to / Hashnode / technical blog

Longer versions of the strongest LinkedIn stories.

Use repository evidence and diagrams.

### X / Bluesky / other technical social networks

Optional.

Do not create a new channel unless there is capacity to maintain it.

### Communities / Discord / Slack

Share when:

- there is a genuinely relevant discussion;
- AgentStride solves or illustrates the exact problem.

Do not drop links without context.

---

## 7. npm discovery

When packages become public, package metadata matters.

Review:

- package name;
- description;
- README;
- keywords;
- links;
- license.

Candidate keywords for core:

- ai
- agents
- agentic-ai
- typescript
- llm
- tool-calling
- multi-agent

Do not keyword-stuff.

Initial npm success metric is not raw install count.

Prefer:

- successful external install;
- external project using it;
- repeat installs;
- issues/feedback.

---

## 8. First 100 stars strategy

Do not attempt to manufacture stars.

Suggested sequence:

```text
Public repo
  ↓
Origins article/post
  ↓
LinkedIn
  ↓
Second technical story
  ↓
Show HN
  ↓
Relevant Reddit/community posts
  ↓
npm 0.x release
  ↓
Practical tutorial
  ↓
Migration/portability example
  ↓
External issues/contributors
```

Milestones:

### Milestone 1 — 10 external users

Most important early target.

### Milestone 2 — 25 stars

Signal that discovery has begun.

### Milestone 3 — 50 stars

Start examining which channels/content produced real usage.

### Milestone 4 — 100 stars

At this point measure whether stars correlate with:

- clones;
- installs;
- issues;
- projects;
- contributors.

Do not optimize only for star count.

---

## 9. Metrics to track

Once public, track at least:

### GitHub

- stars;
- forks;
- clones/traffic when available;
- unique visitors;
- issues;
- PRs;
- contributors.

### npm

- package downloads;
- package-specific adoption;
- version distribution where useful.

### Content

- LinkedIn impressions;
- saves;
- comments;
- click-throughs when measurable;
- technical conversations generated.

### Product-quality metric

Most important:

> How many external developers successfully built something with AgentStride?

Maintain a simple internal log if practical.

---

## 10. Launch sequence recommendation

Suggested initial public sequence:

### Week 0 — prepare

- finalize README;
- select package scope;
- choose 0.x version;
- public wording review;
- package dry run;
- prepare first 3 stories.

### Launch day

- make repo public only after owner approval;
- create release/tag if approved;
- publish selected npm package(s) if approved;
- publish first technical story;
- monitor install/docs problems.

### Days 2–4

- respond to issues/questions;
- fix onboarding problems;
- avoid adding feature requests automatically.

### Week 1

- second technical post;
- possible Show HN;
- relevant community sharing.

### Week 2

- third technical story;
- review traffic, installs, issues and feedback;
- decide whether product assumptions changed.

---

## 11. Community behavior

Early users should feel that:

- questions are welcome;
- issues get thoughtful responses;
- requests are evaluated against project principles;
- the maintainer is willing to say "no" to scope creep.

Do not immediately accept every requested feature.

AgentStride's value depends partly on staying small.

Potential labels later:

- bug;
- docs;
- good first issue;
- integration;
- proposal;
- out-of-scope.

Do not add process bureaucracy before community demand exists.

---

## 12. Content quality rule

Avoid:

> Today I added feature X.

Prefer:

> I expected X to work. A real scenario showed Y. Here is what changed and why.

Every story should be backed by:

- code;
- test;
- ADR;
- eval;
- example;
- measured result.

---

## 13. Promotion anti-patterns

Avoid:

- buying stars;
- star-exchange communities;
- artificial npm downloads;
- spam in unrelated communities;
- claiming users/adoption that do not exist;
- fake benchmarks;
- attacking competing frameworks;
- posting the same promotional text everywhere;
- adding features only to create launch content.

Growth must remain credible.

---

## 14. Relationship with the public productization plan

This internal strategy complements:

`docs/plans/PUBLIC_PRODUCTIZATION_AND_RELEASE_DECISION_PLAN_2026-09-06.md`

The productization plan answers:

> What must be prepared before launch?

This document answers:

> Once launch is authorized, how do we create real developer discovery and adoption?

Neither document authorizes:

- public GitHub visibility;
- npm publication;
- external posts.

Those remain owner decisions.

---

## 15. Pre-public removal/review gate

Before changing repository visibility, explicitly review this file.

Decision options:

### Option A — remove it

Preferred if the strategy feels too internal.

### Option B — move it

Move to a private project/notes repository.

### Option C — convert it

Extract safe sections into:

- COMMUNITY.md;
- launch checklist;
- public roadmap;
- contributor guidance.

Do not accidentally expose internal growth targets or launch tactics without reviewing them.

---

## 16. Definition of success

This strategy succeeds if AgentStride grows because:

- developers understand the problem;
- technical content is useful;
- installation is easy;
- examples build trust;
- real people try the project;
- feedback improves the project;
- community creates additional discovery.

The goal is not to make a number look large.

The goal is to create genuine developer adoption.

---

## Career objective

AgentStride is also intended to strengthen the owner's professional positioning and job search.

The detailed internal plan is:

`docs/internal/INTERNAL_CAREER_POSITIONING_AND_LINKEDIN_PLAN_2026-09-06.md`

Growth metrics should therefore include not only stars/downloads but relevant recruiter, CTO and engineering conversations.
