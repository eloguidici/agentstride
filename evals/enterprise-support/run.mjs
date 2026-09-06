#!/usr/bin/env node
/**
 * Deterministic enterprise-support evaluation runner.
 *
 * Uses scripted models (not live LLMs) so results are reproducible CI baselines.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  createReceptionistAgent,
  runReceptionist,
} from "../../examples/17-enterprise-support-agent/agents/receptionist.mjs";
import { resetSupportCaseService } from "../../examples/17-enterprise-support-agent/domain/support-case-service.mjs";

import { aggregateScores, formatHumanSummary } from "../lib/aggregate.mjs";
import { toolNamesFromEvents, uniqueToolNames } from "../lib/extract-tools.mjs";
import { parseCases } from "../lib/load-cases.mjs";
import { scoreCase } from "../lib/score-case.mjs";
import {
  createScriptedModel,
  defaultSecurityScript,
} from "./scripted-model.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const casesPath = join(here, "cases.json");
const resultsDir = join(here, "..", "results");
const baselinePath = join(resultsDir, "baseline-enterprise-support.json");

export async function runEnterpriseSupportEvals(options = {}) {
  const writeBaseline = options.writeBaseline !== false;
  const casesRaw = JSON.parse(readFileSync(casesPath, "utf8"));
  const cases = parseCases(casesRaw);

  const caseResults = [];

  for (const caseDef of cases) {
    resetSupportCaseService({
      failNextCreate: Boolean(caseDef.setup?.failNextCreate),
    });

    const nestedEvents = [];
    const receptionist = createReceptionistAgent(
      createScriptedModel(caseDef.script),
      {
        securityModel: createScriptedModel(
          caseDef.securityScript ?? defaultSecurityScript(),
        ),
        onSecurityEvent: (event) => nestedEvents.push(event),
      },
    );

    let run = null;
    let error = null;
    try {
      run = await runReceptionist(receptionist, caseDef.input, {
        context: caseDef.context,
      });
    } catch (err) {
      error = err;
      run = err?.agentRun ?? null;
    }

    const parentTools = uniqueToolNames(
      toolNamesFromEvents(run?.events ?? error?.agentRun?.events ?? []),
    );
    const nestedTools = uniqueToolNames(toolNamesFromEvents(nestedEvents));

    const score = scoreCase({
      caseDef,
      run,
      error,
      toolsCalled: parentTools,
      nestedToolsCalled: nestedTools,
    });

    caseResults.push({
      id: caseDef.id,
      category: caseDef.category ?? null,
      pass: score.pass,
      failures: score.failures,
      checks: score.checks,
      toolsCalled: parentTools,
      nestedToolsCalled: nestedTools,
      decision: run?.output?.decision ?? null,
      status: run?.status ?? (error ? "failed" : null),
      errorName: error?.name ?? null,
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
    domain: "enterprise-support",
    mode: "deterministic-scripted",
    generatedAt: new Date().toISOString(),
    caseCount: cases.length,
    summary,
    humanSummary: human,
    cases: caseResults,
  };

  if (writeBaseline) {
    mkdirSync(resultsDir, { recursive: true });
    writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  }

  return payload;
}

const isMain =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const result = await runEnterpriseSupportEvals({ writeBaseline: true });
  console.log(result.humanSummary);
  console.log(`\nBaseline written: ${baselinePath}`);
  if (result.summary.failed > 0) {
    process.exitCode = 1;
  }
}
