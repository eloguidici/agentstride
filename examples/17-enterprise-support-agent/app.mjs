import { createReceptionistAgent, runReceptionist } from "./agents/receptionist.mjs";
import {
  createFakeEnterpriseModel,
  createFakeSecurityModel,
} from "./fake-model.mjs";
import { resetSupportCaseService } from "./domain/support-case-service.mjs";
import { createEventTrace, DEMO_CONTEXT } from "./trace.mjs";

resetSupportCaseService();

const trace = createEventTrace();
const receptionist = createReceptionistAgent(createFakeEnterpriseModel("happy"), {
  securityModel: createFakeSecurityModel(),
  onEvent: trace.onEvent,
});

const input =
  "Customer ACME cannot access production. Check their account, verify security restrictions and create a support case if needed.";

const result = await runReceptionist(receptionist, input, {
  context: DEMO_CONTEXT,
});

console.log("status:", result.status);
console.log("steps:", result.steps);
console.log("output:", result.output);
console.log("events:", trace.events.map((e) => e.type).join(", "));
