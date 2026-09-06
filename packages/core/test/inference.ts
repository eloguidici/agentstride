import { z } from "zod";

import { defineTool } from "../src/tool.js";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({
    id: z.string(),
  }),
  execute(input) {
    const id: string = input.id;
    return { id, name: "Ada" };
  },
});

const _parameters: Readonly<Record<string, unknown>> | undefined =
  findCustomer.parameters;

void _parameters;
void findCustomer;
