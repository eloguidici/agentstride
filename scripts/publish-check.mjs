#!/usr/bin/env node
/**
 * Publish readiness check (does not publish).
 * Verifies workspace packages look like releasable npm packages.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = join(root, "packages");
const requiredFields = [
  "name",
  "version",
  "description",
  "type",
  "exports",
  "files",
  "license",
  "repository",
];
/** First-wave public packages. */
const firstWave = new Set(["@agentstride/core", "@agentstride/openai"]);

const errors = [];
const warnings = [];

for (const dir of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const pkgPath = join(packagesDir, dir.name, "package.json");
  if (!existsSync(pkgPath)) continue;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const label = pkg.name ?? dir.name;

  for (const field of requiredFields) {
    if (pkg[field] === undefined) {
      errors.push(`${label}: missing package.json field "${field}"`);
    }
  }

  if (!String(pkg.name ?? "").startsWith("@agentstride/")) {
    errors.push(`${label}: name should be under @agentstride/*`);
  }

  if (pkg.license !== "MIT") {
    warnings.push(`${label}: license is "${pkg.license}" (expected MIT)`);
  }

  if (pkg.private === true) {
    warnings.push(`${label}: still private (expected until public release)`);
  }

  if (firstWave.has(label)) {
    if (pkg.publishConfig?.access !== "public") {
      errors.push(`${label}: publishConfig.access must be "public" for scoped npm`);
    }
    if (!Array.isArray(pkg.files) || !pkg.files.includes("dist") || pkg.files.includes("src")) {
      warnings.push(`${label}: prefer files=["dist"] only for first-wave publish`);
    }
    if (!existsSync(join(packagesDir, dir.name, "LICENSE"))) {
      errors.push(`${label}: missing package LICENSE (npm pack does not use root LICENSE)`);
    }
    if (label === "@agentstride/openai") {
      const peer = pkg.peerDependencies?.["@agentstride/core"];
      if (!peer || peer === "*") {
        errors.push(
          `${label}: peerDependencies.@agentstride/core must be a semver range (not "*"); use "^0.0.0 || ^0.1.0" until launch, then prefer "^0.1.0"`,
        );
      }
    }
  }

  if (!existsSync(join(packagesDir, dir.name, "LICENSE")) && !existsSync(join(root, "LICENSE"))) {
    warnings.push(`${label}: no package LICENSE (root LICENSE present is OK for non-first-wave)`);
  }

  if (!existsSync(join(packagesDir, dir.name, "README.md"))) {
    warnings.push(`${label}: missing README.md`);
  }

  const distIndex = join(packagesDir, dir.name, "dist", "index.js");
  if (!existsSync(distIndex)) {
    warnings.push(`${label}: dist/index.js missing (run build before publish)`);
  }
}

console.log("publish-check: packages inspected");
for (const w of warnings) {
  console.log(`  warn: ${w}`);
}
if (errors.length > 0) {
  for (const e of errors) {
    console.error(`  error: ${e}`);
  }
  process.exit(1);
}

console.log("publish-check: OK (not published; private flags still expected)");
