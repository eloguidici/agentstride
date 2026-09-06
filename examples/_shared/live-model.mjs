import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createOpenAIModel } from "@agentstride/openai";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadEnvFile(filePath = resolve(root, ".env")) {
  if (!existsSync(filePath)) {
    return;
  }

  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function createLiveModel() {
  loadEnvFile();

  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Set OPENROUTER_API_KEY or OPENAI_API_KEY");
  }

  const usingOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

  return createOpenAIModel({
    apiKey,
    model:
      process.env.OPENROUTER_MODEL ??
      process.env.OPENAI_MODEL ??
      "gpt-4o-mini",
    baseUrl: usingOpenRouter
      ? "https://openrouter.ai/api/v1"
      : process.env.OPENAI_BASE_URL,
    headers: usingOpenRouter
      ? {
          "HTTP-Referer": "https://github.com/eloguidici/agentstride",
          "X-Title": "AgentStride",
        }
      : undefined,
  });
}
