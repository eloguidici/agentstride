import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const example23Root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../23-alarm-triage",
);
const example24Root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../24-change-gate",
);

async function loadVelumModules() {
  const triageAgentUrl = pathToFileURL(
    resolve(example23Root, "agents/triage-agent.mjs"),
  ).href;
  const triageFakeUrl = pathToFileURL(
    resolve(example23Root, "fake-model.mjs"),
  ).href;
  const incidentUrl = pathToFileURL(
    resolve(example23Root, "domain/incident-service.mjs"),
  ).href;
  const changeAgentUrl = pathToFileURL(
    resolve(example24Root, "agents/change-agent.mjs"),
  ).href;
  const changeFakeUrl = pathToFileURL(
    resolve(example24Root, "fake-model.mjs"),
  ).href;
  const changeUrl = pathToFileURL(
    resolve(example24Root, "domain/change-service.mjs"),
  ).href;

  const [triageAgent, triageFake, incident, changeAgent, changeFake, change] =
    await Promise.all([
      import(triageAgentUrl),
      import(triageFakeUrl),
      import(incidentUrl),
      import(changeAgentUrl),
      import(changeFakeUrl),
      import(changeUrl),
    ]);

  return { triageAgent, triageFake, incident, changeAgent, changeFake, change };
}

export type VelumGridBundle = {
  createTriageAgent: (model: unknown, options?: Record<string, unknown>) => unknown;
  runTriage: (
    agent: unknown,
    input: string,
    runOptions?: Record<string, unknown>,
  ) => Promise<{
    id: string;
    status: string;
    text?: string;
    output?: unknown;
    steps?: number;
    durationMs?: number;
  }>;
  createFakeTriageModel: (scenario?: string) => unknown;
  approvePageProposal: (args: {
    proposalId: string;
    approvedBy: string;
    roles: string[];
  }) => unknown;
  rejectPageProposal: (args: {
    proposalId: string;
    rejectedBy: string;
    roles: string[];
  }) => unknown;
  resetAlarmStores: () => void;
  createChangeAgent: (model: unknown, options?: Record<string, unknown>) => unknown;
  runChangeGate: (
    agent: unknown,
    input: string,
    runOptions?: Record<string, unknown>,
  ) => Promise<{
    id: string;
    status: string;
    text?: string;
    output?: unknown;
    steps?: number;
    durationMs?: number;
  }>;
  createFakeChangeModel: (scenario?: string) => unknown;
  approveExecuteProposal: (args: {
    proposalId: string;
    approvedBy: string;
    roles: string[];
  }) => unknown;
  rejectExecuteProposal: (args: {
    proposalId: string;
    rejectedBy: string;
    roles: string[];
  }) => unknown;
  resetChangeStores: () => void;
};

export async function createVelumGridBundle(options: {
  fake?: boolean;
} = {}): Promise<VelumGridBundle> {
  const mods = await loadVelumModules();
  // Fake models only — set VELUM_FAKE=1 in tests; no live LLM path here.
  void options;
  void process.env.VELUM_FAKE;

  return {
    createTriageAgent: mods.triageAgent.createTriageAgent,
    runTriage: mods.triageAgent.runTriage,
    createFakeTriageModel: mods.triageFake.createFakeTriageModel,
    approvePageProposal: mods.incident.approvePageProposal,
    rejectPageProposal: mods.incident.rejectPageProposal,
    resetAlarmStores: mods.incident.resetAlarmStores,
    createChangeAgent: mods.changeAgent.createChangeAgent,
    runChangeGate: mods.changeAgent.runChangeGate,
    createFakeChangeModel: mods.changeFake.createFakeChangeModel,
    approveExecuteProposal: mods.change.approveExecuteProposal,
    rejectExecuteProposal: mods.change.rejectExecuteProposal,
    resetChangeStores: mods.change.resetChangeStores,
  };
}
