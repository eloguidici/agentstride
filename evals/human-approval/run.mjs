#!/usr/bin/env node
/**
 * Deterministic evals for the human-approval example.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  createApprovalReceptionist,
  runApprovalReceptionist,
} from "../../examples/20-human-approval/agents/receptionist.mjs";
import { resetAuditLog } from "../../examples/20-human-approval/domain/audit-service.mjs";
import {
  findCustomerService,
  resetCustomerStore,
} from "../../examples/20-human-approval/domain/customer-service.mjs";
import {
  getProposedAction,
  resetProposalStore,
} from "../../examples/20-human-approval/domain/proposal-service.mjs";

import { aggregateScores, formatHumanSummary } from "../lib/aggregate.mjs";
import { toolNamesFromEvents, uniqueToolNames } from "../lib/extract-tools.mjs";
import { parseCases } from "../lib/load-cases.mjs";
import { scoreCase } from "../lib/score-case.mjs";
import { createScriptedModel } from "../enterprise-support/scripted-model.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const casesPath = join(here, "cases.json");
const baselinePath = join(here, "..", "results", "baseline-human-approval.json");

/**
 * Extend scoreCase with approval-specific output fields + postAssert.
 */
function scoreApprovalCase({ caseDef, run, error, toolsCalled }) {
  const base = scoreCase({
    caseDef: {
      ...caseDef,
      expected: {
        ...caseDef.expected,
        // reuse decision / requiresHumanApproval / mustCall from expected
      },
    },
    run,
    error,
    toolsCalled,
  });

  const checks = [...base.checks];
  const expected = caseDef.expected;
  const output = run?.output;

  if (output && expected.accessGranted !== undefined) {
    checks.push({
      name: "accessGranted",
      pass: output.accessGranted === expected.accessGranted,
      detail: `expected ${expected.accessGranted}, got ${output.accessGranted}`,
    });
  }

  if (caseDef.postAssert?.customerAccess) {
    const access = findCustomerService("ACME").productionAccess;
    checks.push({
      name: "post:customerAccess",
      pass: access === caseDef.postAssert.customerAccess,
      detail: `expected ${caseDef.postAssert.customerAccess}, got ${access}`,
    });
  }

  if (caseDef.postAssert?.proposalStatus && output?.proposalId) {
    const proposal = getProposedAction(output.proposalId);
    checks.push({
      name: "post:proposalStatus",
      pass: proposal.status === caseDef.postAssert.proposalStatus,
      detail: `expected ${caseDef.postAssert.proposalStatus}, got ${proposal.status}`,
    });
  }

  const failures = checks.filter((c) => !c.pass).map((c) => `${c.name}: ${c.detail ?? "failed"}`);
  return {
    caseId: caseDef.id,
    pass: failures.length === 0,
    checks,
    failures,
  };
}

export async function runHumanApprovalEvals(options = {}) {
  const writeBaseline = options.writeBaseline !== false;
  const cases = parseCases(JSON.parse(readFileSync(casesPath, "utf8")));
  const caseResults = [];

  for (const caseDef of cases) {
    resetCustomerStore();
    resetProposalStore();
    resetAuditLog();

    const receptionist = createApprovalReceptionist(
      createScriptedModel(caseDef.script),
    );

    let run = null;
    let error = null;
    try {
      run = await runApprovalReceptionist(receptionist, caseDef.input, {
        context: caseDef.context,
      });
    } catch (err) {
      error = err;
      run = err?.agentRun ?? null;
    }

    const toolsCalled = uniqueToolNames(toolNamesFromEvents(run?.events ?? []));
    const score = scoreApprovalCase({ caseDef, run, error, toolsCalled });
    caseResults.push({
      id: caseDef.id,
      pass: score.pass,
      failures: score.failures,
      checks: score.checks,
      toolsCalled,
      decision: run?.output?.decision ?? null,
      accessGranted: run?.output?.accessGranted ?? null,
    });
  }

  const scores = caseResults.map((r) => ({
    caseId: r.id,
    pass: r.pass,
    checks: r.checks,
    failures: r.failures,
  }));
  const summary = aggregateScores(scores);
  const human = formatHumanSummary(summary, scores);
  const payload = {
    domain: "human-approval",
    mode: "deterministic-scripted",
    generatedAt: new Date().toISOString(),
    caseCount: cases.length,
    summary,
    humanSummary: human,
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
  const result = await runHumanApprovalEvals({ writeBaseline: true });
  console.log(result.humanSummary);
  console.log(`\nBaseline written: ${baselinePath}`);
  if (result.summary.failed > 0) process.exitCode = 1;
}
