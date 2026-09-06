import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Naive but honest reuse metric:
 * lines in shared domain files / (shared + framework-specific adapter lines).
 */
export function measureReuse({
  sharedFiles,
  frameworkFiles,
  label,
}) {
  const sharedLines = countLines(sharedFiles);
  const frameworkLines = countLines(frameworkFiles);
  const total = sharedLines + frameworkLines;
  const reusePct = total === 0 ? 0 : Math.round((sharedLines / total) * 1000) / 10;

  return {
    label,
    sharedLines,
    frameworkLines,
    totalLines: total,
    reusePct,
    note:
      "Reuse is measured as shared domain lines / (shared domain + framework adapter lines). Runtime framework packages are excluded.",
  };
}

function countLines(files) {
  let total = 0;
  for (const file of files) {
    const absolute = resolve(here, file);
    const text = readFileSync(absolute, "utf8");
    total += text.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  }
  return total;
}

export function printReuseReport(report) {
  console.log(`reuse[${report.label}]: ${report.reusePct}%`);
  console.log(
    `  shared=${report.sharedLines} framework-adapter=${report.frameworkLines} total=${report.totalLines}`,
  );
  console.log(`  ${report.note}`);
}
