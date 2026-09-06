import type { VelumGridBundle } from "./velum.factory.js";

export const VELUM_GRID = "VELUM_GRID";

export class VelumGridService {
  constructor(private readonly bundle: VelumGridBundle) {}

  resetStores() {
    this.bundle.resetAlarmStores();
    this.bundle.resetChangeStores();
  }

  triage(
    input: string,
    scenario: string,
    options: { context: Record<string, unknown>; signal?: AbortSignal },
  ) {
    const agent = this.bundle.createTriageAgent(
      this.bundle.createFakeTriageModel(scenario),
    );
    return this.bundle.runTriage(agent, input, {
      context: options.context,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }

  changeGate(
    input: string,
    scenario: string,
    options: { context: Record<string, unknown>; signal?: AbortSignal },
  ) {
    const agent = this.bundle.createChangeAgent(
      this.bundle.createFakeChangeModel(scenario),
    );
    return this.bundle.runChangeGate(agent, input, {
      context: options.context,
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }

  approvePage(proposalId: string, approvedBy: string, roles: string[]) {
    return this.bundle.approvePageProposal({ proposalId, approvedBy, roles });
  }

  rejectPage(proposalId: string, rejectedBy: string, roles: string[]) {
    return this.bundle.rejectPageProposal({ proposalId, rejectedBy, roles });
  }

  approveExecution(proposalId: string, approvedBy: string, roles: string[]) {
    return this.bundle.approveExecuteProposal({
      proposalId,
      approvedBy,
      roles,
    });
  }

  rejectExecution(proposalId: string, rejectedBy: string, roles: string[]) {
    return this.bundle.rejectExecuteProposal({
      proposalId,
      rejectedBy,
      roles,
    });
  }
}
