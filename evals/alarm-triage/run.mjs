#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  createTriageAgent,
  runTriage,
} from "../../examples/23-alarm-triage/agents/triage-agent.mjs";
import {
  getPageProposal,
  openTicketService,
  rejectPageProposal,
  resetAlarmStores,
  ticketCount,
} from "../../examples/23-alarm-triage/domain/incident-service.mjs";
import { createScriptedModel } from "../enterprise-support/scripted-model.mjs";
import { aggregateScores, formatHumanSummary } from "../lib/aggregate.mjs";
import { toolNamesFromEvents, uniqueToolNames } from "../lib/extract-tools.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const casesPath = join(here, "cases.json");
const baselinePath = join(here, "..", "results", "baseline-alarm-triage.json");

function validateAlarmCase(item, index, ids) {
  if (!item?.id || ids.has(item.id)) {
    throw new Error(`invalid/duplicate case id at ${index}`);
  }
  ids.add(item.id);
  if (!item.input || !item.expected || !item.script?.steps?.length) {
    throw new Error(`case ${item.id}: missing input/expected/script`);
  }
  return item;
}

async function applyPostAssert(caseDef, output, checks) {
  const post = caseDef.postAssert;
  if (!post) return;

  if (post.reopenSameTicket) {
    const again = await openTicketService({
      ...post.reopenSameTicket,
      requestId: "eval-reopen",
      openedBy: "eval",
    });
    checks.push({
      name: "post:reopenSameTicket",
      pass: again.replayed === true,
      detail: `replayed=${again.replayed}`,
    });
  }

  if (post.rejectPage && output?.pageProposalId) {
    rejectPageProposal({
      proposalId: output.pageProposalId,
      rejectedBy: post.rejectPage.rejectedBy,
      roles: post.rejectPage.roles,
    });
  }

  if (post.ticketCount !== undefined) {
    const count = ticketCount();
    checks.push({
      name: "post:ticketCount",
      pass: count === post.ticketCount,
      detail: `expected ${post.ticketCount}, got ${count}`,
    });
  }

  if (post.proposalStatus && output?.pageProposalId) {
    const proposal = getPageProposal(output.pageProposalId);
    checks.push({
      name: "post:proposalStatus",
      pass: proposal.status === post.proposalStatus,
      detail: `expected ${post.proposalStatus}, got ${proposal.status}`,
    });
  }

  if (post.pagedAfter !== undefined && output?.pageProposalId) {
    const proposal = getPageProposal(output.pageProposalId);
    checks.push({
      name: "post:pagedAfter",
      pass: proposal.paged === post.pagedAfter,
      detail: `expected ${post.pagedAfter}, got ${proposal.paged}`,
    });
  }
}

async function scoreAlarmCase({ caseDef, run, error, toolsCalled }) {
  const expected = caseDef.expected;
  const checks = [];
  const output = run?.output;

  checks.push({
    name: "run-completed",
    pass: error == null && run?.status === "completed",
    detail: error ? error.message : run?.status,
  });

  if (output) {
    for (const field of ["category", "action", "requiresHumanApproval", "paged"]) {
      if (expected[field] !== undefined) {
        checks.push({
          name: field,
          pass: output[field] === expected[field],
          detail: `expected ${expected[field]}, got ${output[field]}`,
        });
      }
    }
  }

  const called = new Set(toolsCalled);
  for (const name of expected.mustCall ?? []) {
    checks.push({
      name: `mustCall:${name}`,
      pass: called.has(name),
      detail: called.has(name) ? "ok" : `missing; called=[${[...called]}]`,
    });
  }
  for (const name of expected.mustNotCall ?? []) {
    checks.push({
      name: `mustNotCall:${name}`,
      pass: !called.has(name),
      detail: called.has(name) ? "was called" : "ok",
    });
  }

  await applyPostAssert(caseDef, output, checks);

  const failures = checks.filter((c) => !c.pass).map((c) => `${c.name}: ${c.detail}`);
  return {
    caseId: caseDef.id,
    pass: failures.length === 0,
    checks,
    failures,
  };
}

export async function runAlarmTriageEvals(options = {}) {
  const writeBaseline = options.writeBaseline !== false;
  const raw = JSON.parse(readFileSync(casesPath, "utf8"));
  const ids = new Set();
  const cases = raw.map((c, i) => validateAlarmCase(c, i, ids));
  const caseResults = [];

  for (const caseDef of cases) {
    resetAlarmStores();
    const agent = createTriageAgent(createScriptedModel(caseDef.script));
    let run = null;
    let error = null;
    try {
      run = await runTriage(agent, caseDef.input, { context: caseDef.context });
    } catch (err) {
      error = err;
      run = err?.agentRun ?? null;
    }
    const toolsCalled = uniqueToolNames(toolNamesFromEvents(run?.events ?? []));
    const score = await scoreAlarmCase({ caseDef, run, error, toolsCalled });
    caseResults.push({
      id: caseDef.id,
      pass: score.pass,
      failures: score.failures,
      checks: score.checks,
      category: run?.output?.category ?? null,
      action: run?.output?.action ?? null,
      paged: run?.output?.paged ?? null,
    });
  }

  const scores = caseResults.map((r) => ({
    caseId: r.id,
    pass: r.pass,
    checks: r.checks,
    failures: r.failures,
  }));
  const summary = aggregateScores(scores);
  const payload = {
    domain: "alarm-triage",
    org: "Velum Grid",
    mode: "deterministic-scripted",
    generatedAt: new Date().toISOString(),
    caseCount: cases.length,
    summary,
    humanSummary: formatHumanSummary(summary, scores),
    cases: caseResults,
  };

  if (writeBaseline) {
    mkdirSync(dirname(baselinePath), { recursive: true });
    writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`);
  }
  return payload;
}

const isMain =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const result = await runAlarmTriageEvals({ writeBaseline: true });
  console.log(result.humanSummary);
  if (result.summary.failed > 0) process.exitCode = 1;
}
