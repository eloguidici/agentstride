import { createOpenAIModel } from "@agentstride/openai";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type EnterpriseReceptionist = {
  agent: { run: Function };
  outputSchema: unknown;
};

const example17Root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../17-enterprise-support-agent",
);

async function loadEnterpriseModules() {
  const receptionistUrl = pathToFileURL(
    resolve(example17Root, "agents/receptionist.mjs"),
  ).href;
  const fakeUrl = pathToFileURL(resolve(example17Root, "fake-model.mjs")).href;
  const caseUrl = pathToFileURL(
    resolve(example17Root, "domain/support-case-service.mjs"),
  ).href;

  const [receptionistMod, fakeMod, caseMod] = await Promise.all([
    import(receptionistUrl),
    import(fakeUrl),
    import(caseUrl),
  ]);

  return { receptionistMod, fakeMod, caseMod };
}

export async function createEnterpriseReceptionist(options: {
  fake?: boolean;
  onEvent?: (event: unknown) => void;
} = {}): Promise<{
  receptionist: EnterpriseReceptionist;
  runReceptionist: (
    receptionist: EnterpriseReceptionist,
    input: string,
    runOptions?: Record<string, unknown>,
  ) => Promise<{
    id: string;
    status: string;
    text: string;
    output?: unknown;
    steps: number;
    durationMs: number;
    error?: unknown;
  }>;
  resetSupportCaseService: (opts?: { failNextCreate?: boolean }) => void;
}> {
  const { receptionistMod, fakeMod, caseMod } = await loadEnterpriseModules();
  const useFake =
    options.fake === true ||
    process.env.ENTERPRISE_FAKE === "1" ||
    (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY);

  caseMod.resetSupportCaseService();

  const model = useFake
    ? fakeMod.createFakeEnterpriseModel("happy")
    : createOpenAIModel({
        apiKey: process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY,
        model:
          process.env.OPENROUTER_MODEL ??
          process.env.OPENAI_MODEL ??
          "gpt-4o-mini",
        ...(process.env.OPENROUTER_API_KEY
          ? {
              baseUrl: "https://openrouter.ai/api/v1",
              headers: {
                "HTTP-Referer": "https://github.com/eloguidici/agentstride",
                "X-Title": "AgentStride enterprise Nest",
              },
            }
          : process.env.OPENAI_BASE_URL
            ? { baseUrl: process.env.OPENAI_BASE_URL }
            : {}),
      });

  const securityModel = useFake
    ? fakeMod.createFakeSecurityModel()
    : model;

  const receptionist = receptionistMod.createReceptionistAgent(model, {
    securityModel,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
    maxSteps: 8,
  });

  return {
    receptionist,
    runReceptionist: receptionistMod.runReceptionist,
    resetSupportCaseService: caseMod.resetSupportCaseService,
  };
}
