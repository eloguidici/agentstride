import { createAgent } from "@agentstride/core";
import { z } from "zod";

import { createLiveModel } from "../_shared/live-model.mjs";

const analysisSchema = z.object({
  risk: z.enum(["low", "medium", "high"]),
  summary: z.string(),
  actions: z.array(z.string()).min(1),
});

const model = createLiveModel();

const agent = createAgent({
  model,
  instructions: [
    "Analyze short operational notes.",
    "Respond with JSON only.",
    'Required keys: risk ("low"|"medium"|"high"), summary (string), actions (string[]).',
  ].join(" "),
  maxSteps: 2,
});

const result = await agent.run(
  "Vendor access request for production DB. Review is incomplete. Deadline is tomorrow.",
  { output: analysisSchema },
);

console.log("output:", result.output);
console.log("text:", result.text);
console.log("status:", result.status);
