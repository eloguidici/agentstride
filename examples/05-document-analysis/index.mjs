import { createAgent, defineTool } from "@agentstride/core";
import {
  createInMemoryRetriever,
  formatRetrievedContext,
} from "@agentstride/rag";
import { z } from "zod";

const retriever = createInMemoryRetriever([
  {
    id: "policy-1",
    text: "All vendors must complete security review before production access.",
  },
  {
    id: "policy-2",
    text: "Customer data retention is limited to 24 months.",
  },
]);

const searchDocs = defineTool({
  name: "searchDocs",
  description: "Search internal documents",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const docs = await retriever.retrieve(query, { limit: 2 });
    return formatRetrievedContext(docs);
  },
});

const outputSchema = z.object({
  obligations: z.array(z.string()),
});

let call = 0;
const model = {
  async generate(request) {
    call += 1;
    if (call === 1) {
      return {
        toolCalls: [{ name: "searchDocs", input: { query: "vendor security" } }],
      };
    }

    const toolOutput = request.messages.at(-1)?.output;
    return {
      text: JSON.stringify({
        obligations: [String(toolOutput).slice(0, 120)],
      }),
      output: {
        obligations: [
          "Vendors must complete security review before production access.",
        ],
      },
    };
  },
};

const agent = createAgent({
  model,
  tools: { searchDocs },
});

const result = await agent.run("Extract obligations about vendors", {
  output: outputSchema,
});

console.log(result.output);
