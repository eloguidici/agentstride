#!/usr/bin/env node
/**
 * Local validation battery — no GitHub Actions.
 * See docs/engineering/VALIDATION_BATTERY.md
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const startedAt = new Date().toISOString();

const tiers = [
  {
    id: "T0",
    name: "engineering-gate",
    required: true,
    steps: [
      ["npm", ["run", "build"]],
      ["npm", ["run", "typecheck"]],
      ["npm", ["run", "publish:check"]],
    ],
  },
  {
    id: "T1",
    name: "core",
    required: true,
    steps: [["npm", ["test", "-w", "@agentstride/core"]]],
  },
  {
    id: "T2",
    name: "production-patterns",
    required: true,
    steps: [
      ["npm", ["test", "-w", "@agentstride/example-opentelemetry-tracing"]],
      ["npm", ["test", "-w", "@agentstride/example-human-approval"]],
      ["npm", ["test", "-w", "@agentstride/example-side-effect-idempotency"]],
      ["npm", ["test", "-w", "@agentstride/example-usage-accounting"]],
    ],
  },
  {
    id: "T3",
    name: "verticals",
    required: true,
    steps: [
      ["npm", ["test", "-w", "@agentstride/example-enterprise-support-agent"]],
      ["npm", ["test", "-w", "@agentstride/example-enterprise-support-http"]],
      ["npm", ["test", "-w", "@agentstride/example-alarm-triage"]],
      ["npm", ["test", "-w", "@agentstride/example-change-gate"]],
      ["npm", ["test", "-w", "@agentstride/example-data-export"]],
      ["npm", ["test", "-w", "@agentstride/example-velum-grid-nestjs"]],
    ],
  },
  {
    id: "T4",
    name: "evals",
    required: true,
    steps: [
      ["npm", ["run", "eval:enterprise-support"]],
      ["npm", ["run", "eval:human-approval"]],
      ["npm", ["run", "eval:alarm-triage"]],
      ["npm", ["run", "eval:change-gate"]],
      ["npm", ["run", "eval:data-export"]],
    ],
  },
  {
    id: "T5",
    name: "monorepo-test",
    required: true,
    steps: [["npm", ["test"]]],
  },
  {
    id: "T6",
    name: "offline-demos",
    required: true,
    steps: [
      ["npm", ["start", "-w", "@agentstride/example-alarm-triage"]],
      ["npm", ["start", "-w", "@agentstride/example-change-gate"]],
      ["npm", ["start", "-w", "@agentstride/example-data-export"]],
      ["npm", ["start", "-w", "@agentstride/example-human-approval"]],
      ["npm", ["run", "examples:smoke"]],
    ],
  },
  {
    id: "T7",
    name: "package-dry-run",
    required: true,
    steps: [["npm", ["run", "package:dry-run"]]],
  },
];

function runStep(cmd, args) {
  const label = [cmd, ...args].join(" ");
  const t0 = Date.now();
  const res = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, FORCE_COLOR: "0" },
  });
  const ms = Date.now() - t0;
  const ok = res.status === 0;
  const tail = `${res.stdout ?? ""}\n${res.stderr ?? ""}`
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-8)
    .join("\n");
  return { label, ok, status: res.status, ms, tail };
}

const report = {
  startedAt,
  finishedAt: null,
  verdict: "RED",
  tiers: [],
  live: {
    skipped: !(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY),
    reason: "no OPENROUTER_API_KEY/OPENAI_API_KEY",
  },
};

let hardFail = false;

for (const tier of tiers) {
  console.log(`\n=== ${tier.id} ${tier.name} ===`);
  const tierResult = {
    id: tier.id,
    name: tier.name,
    required: tier.required,
    ok: true,
    steps: [],
  };
  for (const [cmd, args] of tier.steps) {
    process.stdout.write(`> ${[cmd, ...args].join(" ")} ... `);
    const step = runStep(cmd, args);
    tierResult.steps.push(step);
    console.log(step.ok ? `ok (${step.ms}ms)` : `FAIL (${step.ms}ms)`);
    if (!step.ok) {
      tierResult.ok = false;
      if (tier.required) hardFail = true;
      console.log(step.tail);
    }
  }
  report.tiers.push(tierResult);
  if (hardFail && ["T0", "T1", "T2", "T3", "T4"].includes(tier.id)) {
    console.log(`\nStopping early after ${tier.id} failure.`);
    break;
  }
}

report.finishedAt = new Date().toISOString();
const required = report.tiers.filter((t) => t.required);
const allRequiredOk = required.length > 0 && required.every((t) => t.ok) && !hardFail;
// If we broke early, some required tiers missing → RED
const ranRequiredIds = new Set(report.tiers.map((t) => t.id));
const expectedRequired = tiers.filter((t) => t.required).map((t) => t.id);
const allRequiredRan = expectedRequired.every((id) => ranRequiredIds.has(id));

if (allRequiredOk && allRequiredRan) {
  report.verdict = report.live.skipped ? "GREEN" : "GREEN";
} else if (report.tiers.some((t) => t.ok) && !allRequiredRan) {
  report.verdict = "RED";
} else {
  report.verdict = "RED";
}

const outDir = join(root, "docs", "engineering");
mkdirSync(outDir, { recursive: true });
const jsonPath = join(outDir, "validation-battery.last.json");
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`\nVERDICT: ${report.verdict}`);
console.log(`Wrote ${jsonPath}`);
if (report.verdict !== "GREEN") process.exitCode = 1;
