#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  createExportAgent,
  runExportGate,
} from "../../examples/25-data-export/agents/export-agent.mjs";
import {
  getExportProposal,
  rejectExportProposal,
  resetExportStores,
} from "../../examples/25-data-export/domain/export-service.mjs";
import { createScriptedModel } from "../enterprise-support/scripted-model.mjs";
import { aggregateScores, formatHumanSummary } from "../lib/aggregate.mjs";
import { toolNamesFromEvents, uniqueToolNames } from "../lib/extract-tools.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const casesPath = join(here, "cases.json");
const baselinePath = join(here, "..", "results", "baseline-data-export.json");

async function scoreCase({ caseDef, run, error, toolsCalled }) {
  const expected = caseDef.expected;
  const checks = [];
  const output = run?.output;
  checks.push({
    name: "run-completed",
    pass: error == null && run?.status === "completed",
    detail: error ? error.message : run?.status,
  });
  if (output) {
    for (const field of ["action", "exported", "requiresHumanApproval"]) {
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
      detail: called.has(name) ? "ok" : "missing",
    });
  }
  for (const name of expected.mustNotCall ?? []) {
    checks.push({
      name: `mustNotCall:${name}`,
      pass: !called.has(name),
      detail: called.has(name) ? "was called" : "ok",
    });
  }
  const post = caseDef.postAssert;
  if (post?.rejectExport && output?.exportProposalId) {
    rejectExportProposal({
      proposalId: output.exportProposalId,
      rejectedBy: post.rejectExport.rejectedBy,
      roles: post.rejectExport.roles,
    });
  }
  if (post?.exportedAfter !== undefined && output?.exportProposalId) {
    const proposal = getExportProposal(output.exportProposalId);
    checks.push({
      name: "post:exportedAfter",
      pass: proposal.exported === post.exportedAfter,
      detail: `expected ${post.exportedAfter}, got ${proposal.exported}`,
    });
  }
  const failures = checks.filter((c) => !c.pass).map((c) => `${c.name}: ${c.detail}`);
  return { caseId: caseDef.id, pass: failures.length === 0, checks, failures };
}

export async function runDataExportEvals(options = {}) {
  const writeBaseline = options.writeBaseline !== false;
  const cases = JSON.parse(readFileSync(casesPath, "utf8"));
  const caseResults = [];
  for (const caseDef of cases) {
    resetExportStores();
    const agent = createExportAgent(createScriptedModel(caseDef.script));
    let run = null;
    let error = null;
    try {
      run = await runExportGate(agent, caseDef.input, {
        context: caseDef.context,
      });
    } catch (err) {
      error = err;
      run = err?.agentRun ?? null;
    }
    const toolsCalled = uniqueToolNames(toolNamesFromEvents(run?.events ?? []));
    const score = await scoreCase({ caseDef, run, error, toolsCalled });
    caseResults.push({
      id: caseDef.id,
      pass: score.pass,
      failures: score.failures,
      checks: score.checks,
      exported: run?.output?.exported ?? null,
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
    domain: "data-export",
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
  const result = await runDataExportEvals({ writeBaseline: true });
  console.log(result.humanSummary);
  if (result.summary.failed > 0) process.exitCode = 1;
}
