import { createLiveModel } from "../_shared/live-model.mjs";
import { createReceptionistAgent, runReceptionist } from "./agents/receptionist.mjs";
import { resetSupportCaseService } from "./domain/support-case-service.mjs";
import { createEventTrace, DEMO_CONTEXT } from "./trace.mjs";

resetSupportCaseService();

const model = createLiveModel();
const trace = createEventTrace();
const receptionist = createReceptionistAgent(model, {
  onEvent: trace.onEvent,
  maxSteps: 8,
});

const input =
  process.argv.slice(2).join(" ").trim() ||
  "Customer ACME cannot access production. Check their account, verify security restrictions and create a support case if needed.";

const result = await runReceptionist(receptionist, input, {
  context: DEMO_CONTEXT,
});

console.log("status:", result.status);
console.log("steps:", result.steps);
console.log("text:", result.text);
console.log("output:", result.output);
