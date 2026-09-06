# AgentStride â€” Implementer-facing documentation plan

Date: 2026-09-06  
Status: **Ready to execute**  
Branch: `docs/implementer-facing-docs`  
Related: productization pause at Gate 4; this track is **docs only** (no features, no publish)

## 1. Problem

We have strong **design evidence** (ADRs, examples, research, narrative drafts) but a weak **implementer path**.

Someone landing on the repo today gets:

- a good product README;
- many examples (too many to choose);
- ADRs that explain *why*, not a single *how do I build*.

Inspiration (clarity bar, not content to copy): layered explanations for practitioners â€” e.g. distinguishing contract vs tooling vs UI in API docs culture ([example LinkedIn post on OpenAPI / Swagger / Scalar](https://www.linkedin.com/posts/juan-jos%C3%A9-m-5014525b_para-entender-el-panorama-moderno-del-desarrollo-share-7501780917645000704-tVYf/)).

AgentStride needs the same for its own layers:

```text
App domain  â†’  Agent  â†’  Model  â†’  Tools  â†’  AgentRun (+ events)
                 â†‘
         optional packages (openai, nestjs, â€¦)
```

Plus patterns that live **outside** core: human approval, idempotency, OTel, evals.

## 2. Goal

Make AgentStride **easy to understand, easy to try, easy to embed** for an external TypeScript developer â€” without turning docs into an encyclopedia or inventing runtime features.

Success looks like:

1. A stranger can answer in ~10 minutes: what are the layers, what do I install, what do I run first.
2. Common production concerns have a short guide that points at one example + one ADR.
3. Root README and package READMEs link that path (not handoffs/plans/internal).

## 3. Non-goals

- New runtime features, providers, verticals.
- Generated OpenAPI/Scalar-style API site (optional later).
- Publishing GitHub/npm/LinkedIn.
- Rewriting all 26 example READMEs in one pass.
- Owner-private notes live in agentstride-notes.

## 4. Audience

| Audience | Need |
| --- | --- |
| Backend TS engineer embedding agents | Layers + quick start + Nest/HTTP pattern |
| Platform / SRE-minded reader | Cancel, approval, idempotency, OTel, evals |
| Curious skimmer | README + â€œwhen not to useâ€ (already mostly done) |

## 5. Information architecture

```text
README.md                          # product entry (link to guides)
docs/GETTING_STARTED.md            # 10-minute path
docs/guides/
  README.md                        # index
  00-layers.md                     # mental model (the â€œOpenAPI vs Swaggerâ€ equivalent)
  01-first-agent.md                # createAgent + defineTool + fake/real model
  02-cancellation.md               # AbortSignal / nested
  03-human-approval.md             # agent â‰  approver
  04-idempotent-side-effects.md
  05-observability-otel.md
  06-evals.md
  07-nestjs-embed.md               # optional; points at examples 12/18/26
examples/README.md                 # add â€œStart hereâ€ section (keep full table)
packages/core/README.md            # link Getting started + layers
packages/openai/README.md          # link Getting started
```

Keep ADRs and research as **depth**. Guides are **thin** and always cite evidence.

## 6. Phases (attack order)

### P0 â€” Map + getting started (do first)

**Deliverables**

- `docs/guides/00-layers.md` â€” layers table + what lives in app vs core vs packages  
- `docs/GETTING_STARTED.md` â€” install (workspace today / npm later), minimal agent, next links  
- `docs/guides/README.md` â€” index  

**Exit check:** A reader knows Agent vs Model vs Tool vs AgentRun vs app approval without reading ADRs.

### P1 â€” Cookbook (5â€“6 short guides)

One guide per concern; each â‰¤ ~80â€“120 lines; structure:

- Problem  
- Rule  
- Minimal snippet or pointer  
- Evidence (example + ADR + research)  
- Limits / when not  

Order: cancellation â†’ human approval â†’ idempotency â†’ OTel â†’ evals â†’ Nest embed.

**Exit check:** Each Pack-1-style production concern has a discoverable implementer page.

### P2 â€” Examples â€œStart hereâ€

Update `examples/README.md`:

| Path | Examples |
| --- | --- |
| Hello | `01-tool-agent` or `01-simple-agent` |
| Live model | `07-openai` / `08-live-tool` |
| Production patterns | `20`, `21`, `19` |
| HTTP / Nest | `18` or `26` |

Do not delete the full table.

### P3 â€” Wire entry points

- Root `README.md`: Docs section â†’ Getting started + Guides  
- `packages/core` + `openai` READMEs: same  
- `docs/architecture.md`: one line pointing to `guides/00-layers.md`  
- Avoid linking owner-private notes, handoffs, or plans from public entry docs  

### P4 â€” Optional polish (only if P0â€“P3 green and owner wants more)

- `docs/guides/api-surface.md` â€” curated export list (not full typedoc)  
- Spanish vs English: **guides in the same language as root README (EN)** unless owner asks ES; narrative drafts stay as-is  
- Short â€œFAQ / pitfallsâ€ page  

## 7. Writing rules

- Evidence-backed; no â€œproduction-readyâ€ blanket claims.  
- Prefer â€œdo this in your appâ€ over â€œAgentStride includes a workflow engine.â€  
- One job per guide.  
- Link examples by path; do not paste huge files.  
- Context / Evidence / Decision blocks only for *meta* decisions about the docs set (development-log), not every guide.

## 8. Quality gate

Docs-only:

- Links resolve (spot-check).  
- No secrets.  
- No owner-private notes links from Getting started / guides.  
- Optional: run `npm run package:dry-run` unchanged (no script dependency).

## 9. Stop conditions

Stop and ask the owner if:

- we would need a new feature to make a guide honest;  
- wording needs a factual claim not in the repo;  
- scope creeps into rewriting the whole narrative pack;  
- Gate 4 launch work is requested instead.

After P0â€“P3: update handoff / development-log; do **not** invent P5 feature work.

## 10. Definition of done (this track)

- [x] P0 landed  
- [x] P1 landed  
- [x] P2 landed  
- [x] P3 landed  
- [x] development-log entry  
- [x] handoff notes â€œimplementer docs trackâ€ status  
- [ ] PR opened (merge when green)

## 11. Decision record (plan)

### Context
Implementers lack a layered onboarding path comparable to clear practitioner explainers.

### Evidence
README + many examples + ADRs; no `docs/guides/` or Getting started; productization pause.

### Decision
Execute docs-only track P0â†’P3 as above; keep ADRs as depth.

### Rejected
Full typedoc site now; rewriting all examples; new verticals for â€œmore docs content.â€

### Next question
Execute P0 on this branch, then P1â€“P3 in the same PR if small enough.

