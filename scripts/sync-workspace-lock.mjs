#!/usr/bin/env node
/**
 * Sync workspace package entries into package-lock.json without hitting the registry.
 * Does not resolve third-party dependency trees (run a full npm install when network allows).
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = join(root, "package-lock.json");
const lock = JSON.parse(readFileSync(lockPath, "utf8"));

function syncDir(relGlobParent) {
  const abs = join(root, relGlobParent);
  if (!existsSync(abs)) return;
  for (const dir of readdirSync(abs, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name.startsWith("_")) continue;
    const pkgPath = join(abs, dir.name, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const key = `${relGlobParent}/${dir.name}`;
    lock.packages[key] = {
      name: pkg.name,
      version: pkg.version ?? "0.0.0",
      ...(pkg.dependencies ? { dependencies: pkg.dependencies } : {}),
      ...(pkg.devDependencies ? { devDependencies: pkg.devDependencies } : {}),
      ...(pkg.peerDependencies ? { peerDependencies: pkg.peerDependencies } : {}),
      ...(pkg.private ? { private: true } : {}),
    };
    if (pkg.name) {
      lock.packages[`node_modules/${pkg.name}`] = {
        resolved: key,
        link: true,
      };
    }
  }
}

syncDir("packages");
syncDir("examples");

writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
console.log("synced workspace entries into package-lock.json");
