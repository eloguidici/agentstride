#!/usr/bin/env node
/**
 * Local package dry-run: npm pack @agentstride/core and consume it from a temp project.
 * Does NOT publish to npm.
 */
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coreDir = join(root, "packages", "core");
const report = {
  ok: false,
  steps: [],
  tarball: null,
  consumerDir: null,
  error: null,
};

function step(name, fn) {
  process.stdout.write(`• ${name}... `);
  try {
    const detail = fn() ?? "ok";
    report.steps.push({ name, ok: true, detail: String(detail) });
    console.log("ok");
    return detail;
  } catch (err) {
    report.steps.push({
      name,
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
    console.log("FAIL");
    throw err;
  }
}

try {
  step("build core", () => {
    execSync("npm run build -w @agentstride/core", { cwd: root, stdio: "pipe" });
  });

  const tarballName = step("npm pack", () => {
    const out = execSync("npm pack --json", {
      cwd: coreDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const parsed = JSON.parse(out);
    const filename = parsed[0]?.filename;
    if (!filename) throw new Error("npm pack returned no filename");
    return filename;
  });

  const tarballPath = join(coreDir, tarballName);
  report.tarball = tarballPath;

  const listing = step("inspect tarball paths", () => {
    const out = execSync(`npm pack --dry-run --json`, {
      cwd: coreDir,
      encoding: "utf8",
    });
    const files = JSON.parse(out)[0]?.files?.map((f) => f.path) ?? [];
    const hasDts = files.some((p) => p.endsWith("dist/index.d.ts"));
    const hasJs = files.some((p) => p.endsWith("dist/index.js"));
    const hasReadme = files.some((p) => /readme/i.test(p));
    if (!hasDts || !hasJs) throw new Error("missing dist js/dts in pack");
    return `files=${files.length}; dts=${hasDts}; js=${hasJs}; readme=${hasReadme}`;
  });

  const consumerDir = mkdtempSync(join(tmpdir(), "agentstride-dry-run-"));
  report.consumerDir = consumerDir;

  step("create consumer package.json", () => {
    writeFileSync(
      join(consumerDir, "package.json"),
      JSON.stringify(
        {
          name: "agentstride-dry-run-consumer",
          private: true,
          type: "module",
          dependencies: {
            "@agentstride/core": `file:${tarballPath.replace(/\\/g, "/")}`,
            zod: "^4.5.4",
          },
        },
        null,
        2,
      ),
    );
  });

  step("npm install tarball", () => {
    execSync("npm install --no-audit --no-fund", {
      cwd: consumerDir,
      stdio: "pipe",
    });
  });

  const agentFile = join(consumerDir, "run.mjs");
  step("write consumer agent", () => {
    writeFileSync(
      agentFile,
      `import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

const echo = defineTool({
  name: "echo",
  description: "Echo",
  inputSchema: z.object({ text: z.string() }),
  execute: ({ text }) => ({ text }),
});

const model = {
  async generate(request) {
    const tool = request.tools?.[0];
    if (request.messages.filter((m) => m.role === "tool").length === 0 && tool) {
      return { toolCalls: [{ name: "echo", input: { text: "dry-run" } }] };
    }
    return {
      text: JSON.stringify({ ok: true }),
      output: { ok: true },
    };
  },
};

const agent = createAgent({
  model,
  instructions: "echo once",
  tools: { echo },
  maxSteps: 4,
});

const run = await agent.run("go", {
  output: z.object({ ok: z.boolean() }),
});

if (run.status !== "completed" || run.output?.ok !== true) {
  console.error(run);
  process.exit(1);
}
console.log("consumer-run:ok", run.id);
`,
    );
  });

  const runOut = step("execute consumer agent", () => {
    return execSync("node run.mjs", {
      cwd: consumerDir,
      encoding: "utf8",
    }).trim();
  });

  report.ok = true;
  report.listing = listing;
  report.runOut = runOut;
  console.log("\nDRY RUN PASSED");
  console.log(JSON.stringify({ tarball: tarballName, listing, runOut }, null, 2));
} catch (err) {
  report.error = err instanceof Error ? err.message : String(err);
  console.error("\nDRY RUN FAILED:", report.error);
  process.exitCode = 1;
} finally {
  try {
    if (report.tarball) rmSync(report.tarball, { force: true });
  } catch {
    // ignore
  }
  try {
    if (report.consumerDir) rmSync(report.consumerDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
  writeFileSync(
    join(root, "docs", "research", "public-package-dry-run.last.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
}
