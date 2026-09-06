#!/usr/bin/env node
/**
 * Local package dry-run: npm pack Gate-2 packages and consume them from a temp project.
 * Covers: pack contents, npm install, TypeScript compile, runtime smoke.
 * Does NOT publish to npm. Does NOT call live OpenAI APIs.
 */
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coreDir = join(root, "packages", "core");
const openaiDir = join(root, "packages", "openai");
const report = {
  ok: false,
  packages: ["@agentstride/core", "@agentstride/openai"],
  steps: [],
  tarballs: [],
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

function packWorkspace(pkgDir, label) {
  const out = execSync("npm pack --json", {
    cwd: pkgDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const parsed = JSON.parse(out);
  const filename = parsed[0]?.filename;
  if (!filename) throw new Error(`${label}: npm pack returned no filename`);
  const tarballPath = join(pkgDir, filename);
  report.tarballs.push(tarballPath);

  const dry = execSync("npm pack --dry-run --json", {
    cwd: pkgDir,
    encoding: "utf8",
  });
  const files = JSON.parse(dry)[0]?.files?.map((f) => f.path) ?? [];
  const hasDts = files.some((p) => p.endsWith("dist/index.d.ts"));
  const hasJs = files.some((p) => p.endsWith("dist/index.js"));
  const hasReadme = files.some((p) => /readme/i.test(p));
  if (!hasDts || !hasJs) throw new Error(`${label}: missing dist js/dts in pack`);
  return {
    filename,
    tarballPath,
    listing: `files=${files.length}; dts=${hasDts}; js=${hasJs}; readme=${hasReadme}`,
  };
}

try {
  step("build core + openai", () => {
    execSync("npm run build -w @agentstride/core -w @agentstride/openai", {
      cwd: root,
      stdio: "pipe",
    });
  });

  let corePack;
  let openaiPack;
  step("npm pack core", () => {
    corePack = packWorkspace(coreDir, "core");
    return corePack.listing;
  });
  step("npm pack openai", () => {
    openaiPack = packWorkspace(openaiDir, "openai");
    return openaiPack.listing;
  });

  const consumerDir = mkdtempSync(join(tmpdir(), "agentstride-dry-run-"));
  report.consumerDir = consumerDir;

  const coreTarball = corePack.tarballPath.replace(/\\/g, "/");
  const openaiTarball = openaiPack.tarballPath.replace(/\\/g, "/");

  step("create consumer package.json", () => {
    writeFileSync(
      join(consumerDir, "package.json"),
      JSON.stringify(
        {
          name: "agentstride-dry-run-consumer",
          private: true,
          type: "module",
          dependencies: {
            "@agentstride/core": `file:${coreTarball}`,
            "@agentstride/openai": `file:${openaiTarball}`,
            zod: "^4.5.4",
          },
          devDependencies: {
            typescript: "^5.9.2",
            "@types/node": "^22.13.10",
          },
        },
        null,
        2,
      ),
    );
  });

  step("npm install tarballs", () => {
    execSync("npm install --no-audit --no-fund", {
      cwd: consumerDir,
      stdio: "pipe",
    });
  });

  step("write consumer TypeScript agent", () => {
    writeFileSync(
      join(consumerDir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            strict: true,
            skipLibCheck: true,
            noEmit: true,
            types: ["node"],
          },
          include: ["run.ts"],
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(consumerDir, "run.ts"),
      `import { createAgent, defineTool, type Model } from "@agentstride/core";
import { createOpenAIModel } from "@agentstride/openai";
import { z } from "zod";

// Prove openai package types + factory import without calling a live API.
const _adapter: Model = createOpenAIModel({
  apiKey: "dry-run-not-used",
  fetchImpl: async () => {
    throw new Error("live OpenAI must not be called in dry-run");
  },
});
void _adapter;

const echo = defineTool({
  name: "echo",
  description: "Echo",
  inputSchema: z.object({ text: z.string() }),
  execute: ({ text }: { text: string }) => ({ text }),
});

const model: Model = {
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

  const tscOut = step("TypeScript compile (tsc --noEmit)", () => {
    const require = createRequire(join(consumerDir, "package.json"));
    let tscBin;
    try {
      tscBin = require.resolve("typescript/bin/tsc");
    } catch {
      tscBin = join(consumerDir, "node_modules", "typescript", "bin", "tsc");
    }
    if (!existsSync(tscBin) && !existsSync(tscBin + ".js")) {
      // Windows may resolve without .cmd — use npx
      return execSync("npx --no-install tsc -p tsconfig.json --noEmit", {
        cwd: consumerDir,
        encoding: "utf8",
      }).trim() || "tsc-ok";
    }
    return (
      execSync(`node "${tscBin}" -p tsconfig.json --noEmit`, {
        cwd: consumerDir,
        encoding: "utf8",
      }).trim() || "tsc-ok"
    );
  });

  step("write runtime ESM smoke (run.mjs)", () => {
    writeFileSync(
      join(consumerDir, "run.mjs"),
      `import { createAgent, defineTool } from "@agentstride/core";
import { createOpenAIModel } from "@agentstride/openai";
import { z } from "zod";

const adapter = createOpenAIModel({
  apiKey: "dry-run-not-used",
  fetchImpl: async () => {
    throw new Error("live OpenAI must not be called in dry-run");
  },
});
void adapter;

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
  report.coreListing = corePack.listing;
  report.openaiListing = openaiPack.listing;
  report.tscOut = tscOut || "tsc-ok";
  report.runOut = runOut;
  console.log("\nDRY RUN PASSED");
  console.log(
    JSON.stringify(
      {
        packages: report.packages,
        core: corePack.listing,
        openai: openaiPack.listing,
        tsc: report.tscOut,
        runOut,
      },
      null,
      2,
    ),
  );
} catch (err) {
  report.error = err instanceof Error ? err.message : String(err);
  console.error("\nDRY RUN FAILED:", report.error);
  process.exitCode = 1;
} finally {
  for (const t of report.tarballs) {
    try {
      rmSync(t, { force: true });
    } catch {
      // ignore
    }
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
