#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  createChangeAgent,
  runChangeGate,
} from "../../examples/24-change-gate/agents/change-agent.mjs";
import {
  changeCount,
  getExecuteProposal,
  openChangeRecordService,
  rejectExecuteProposal,
  resetChangeStores,
} from "../../examples/24-change-gate/domain/change-service.mjs";
import { createScriptedModel } from "../enterprise-support/scripted-model.mjs";
import { aggregateScores, formatHumanSummary } from "../lib/aggregate.mjs";
import { toolNamesFromEvents, uniqueToolNames } from "../lib/extract-tools.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const casesPath = join(here, "cases.json");
const baselinePath = join(here, "..", "results", "baseline-change-gate.json");

function validateCase(item, index, ids) {
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

  if (post.reopenSameChange) {
    const again = await openChangeRecordService({
      ...post.reopenSameChange,
      requestId: "eval-reopen",
      openedBy: "eval",
    });
    checks.push({
      name: "post:reopenSameChange",
      pass: again.replayed === true,
      detail: `replayed=${again.replayed}`,
    });
  }

  if (post.rejectExecute && output?.executeProposalId) {
    rejectExecuteProposal({
      proposalId: output.executeProposalId,
      rejectedBy: post.rejectExecute.rejectedBy,
      roles: post.rejectExecute.roles,
    });
  }

  if (post.changeCount !== undefined) {
    const count = changeCount();
    checks.push({
      name: "post:changeCount",
      pass: count === post.changeCount,
      detail: `expected ${post.changeCount}, got ${count}`,
    });
  }

  if (post.proposalStatus && output?.executeProposalId) {
    const proposal = getExecuteProposal(output.executeProposalId);
    checks.push({
      name: "post:proposalStatus",
      pass: proposal.status === post.proposalStatus,
      detail: `expected ${post.proposalStatus}, got ${proposal.status}`,
    });
  }

  if (post.executedAfter !== undefined && output?.executeProposalId) {
    const proposal = getExecuteProposal(output.executeProposalId);
    checks.push({
      name: "post:executedAfter",
      pass: proposal.executed === post.executedAfter,
      detail: `expected ${post.executedAfter}, got ${proposal.executed}`,
    });
  }
}

async function scoreChangeCase({ caseDef, run, error, toolsCalled }) {
  const expected = caseDef.expected;
  const checks = [];
  const output = run?.output;

  checks.push({
    name: "run-completed",
    pass: error == null && run?.status === "completed",
    detail: error ? error.message : run?.status,
  });

  if (output) {
    for (const field of [
      "category",
      "action",
      "requiresHumanApproval",
      "executed",
    ]) {
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

export async function runChangeGateEvals(options = {}) {
  const writeBaseline = options.writeBaseline !== false;
  const raw = JSON.parse(readFileSync(casesPath, "utf8"));
  const ids = new Set();
  const cases = raw.map((c, i) => validateCase(c, i, ids));
  const caseResults = [];

  for (const caseDef of cases) {
    resetChangeStores();
    const agent = createChangeAgent(createScriptedModel(caseDef.script));
    let run = null;
    let error = null;
    try {
      run = await runChangeGate(agent, caseDef.input, {
        context: caseDef.context,
      });
    } catch (err) {
      error = err;
      run = err?.agentRun ?? null;
    }
    const toolsCalled = uniqueToolNames(toolNamesFromEvents(run?.events ?? []));
    const score = await scoreChangeCase({ caseDef, run, error, toolsCalled });
    caseResults.push({
      id: caseDef.id,
      pass: score.pass,
      failures: score.failures,
      checks: score.checks,
      category: run?.output?.category ?? null,
      action: run?.output?.action ?? null,
      executed: run?.output?.executed ?? null,
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
    domain: "change-gate",
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
  const result = await runChangeGateEvals({ writeBaseline: true });
  console.log(result.humanSummary);
  if (result.summary.failed > 0) process.exitCode = 1;
}
