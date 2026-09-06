import { createAgent } from "@agentstride/core";
import { z } from "zod";

const analysisSchema = z.object({
  risk: z.enum(["low", "medium", "high"]),
  summary: z.string(),
});

const model = {
  async generate() {
    return {
      text: JSON.stringify({
        risk: "medium",
        summary: "Contract renews in 30 days.",
      }),
      output: {
        risk: "medium",
        summary: "Contract renews in 30 days.",
      },
    };
  },
};

const agent = createAgent({ model });
const result = await agent.run("Analyze the document", {
  output: analysisSchema,
});

console.log(result.output);
