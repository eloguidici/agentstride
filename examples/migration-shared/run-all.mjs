/**
 * Runs baseline + Mastra + LangChain migration demos and prints reuse metrics.
 */
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const examples = [
  "examples/13-migration-baseline",
  "examples/14-migrate-mastra",
  "examples/15-migrate-langchain",
];

for (const example of examples) {
  console.log(`\n=== ${example} ===`);
  await run("npm", ["start", "-w", packageName(example)], root);
}

function packageName(examplePath) {
  const map = {
    "examples/13-migration-baseline": "@agentstride/example-migration-baseline",
    "examples/14-migrate-mastra": "@agentstride/example-migrate-mastra",
    "examples/15-migrate-langchain": "@agentstride/example-migrate-langchain",
  };
  return map[examplePath];
}

function run(command, args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with ${code}`));
      }
    });
  });
}
