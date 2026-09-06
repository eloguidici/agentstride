import type {
  AgentMessage,
  Model,
  ModelRequest,
  ModelResponse,
  ToolCall,
  ToolDefinition,
} from "@agentstride/core";

export type OpenAIModelOptions = Readonly<{
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  headers?: Readonly<Record<string, string>>;
  /** When false, never send response_format even if outputSchema is present. */
  jsonObjectMode?: boolean;
  fetchImpl?: typeof fetch;
}>;

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: { name: string; arguments: string };
      }>;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
};

/**
 * OpenAI-compatible Chat Completions adapter using fetch.
 * Works with OpenAI, OpenRouter, and other compatible gateways.
 */
export function createOpenAIModel(options: OpenAIModelOptions = {}): Model {
  const apiKey =
    options.apiKey ??
    process.env.OPENAI_API_KEY ??
    process.env.OPENROUTER_API_KEY;
  const model =
    options.model ??
    process.env.OPENAI_MODEL ??
    process.env.OPENROUTER_MODEL ??
    "gpt-4o-mini";
  const baseUrl = (
    options.baseUrl ??
    process.env.OPENAI_BASE_URL ??
    (process.env.OPENROUTER_API_KEY
      ? "https://openrouter.ai/api/v1"
      : "https://api.openai.com/v1")
  ).replace(/\/$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;
  const extraHeaders = options.headers ?? {};
  const jsonObjectMode = options.jsonObjectMode ?? true;

  return {
    async generate(request: ModelRequest): Promise<ModelResponse> {
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY or OPENROUTER_API_KEY is required");
      }

      const body: Record<string, unknown> = {
        model,
        messages: withOutputSchemaHint(
          request.messages.map(toOpenAIMessage),
          request.outputSchema,
        ),
      };

      if (request.tools.length > 0) {
        body.tools = request.tools.map(toOpenAITool);
      }

      const wantsJsonObject =
        jsonObjectMode && request.outputSchema !== undefined;

      if (wantsJsonObject) {
        body.response_format = { type: "json_object" };
      }

      let response = await fetchImpl(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify(body),
      });

      let json = (await response.json()) as OpenAIChatResponse;

      // Some OpenRouter free models reject response_format; retry without it.
      if (
        !response.ok &&
        wantsJsonObject &&
        /response_format|json_object|supported/i.test(
          json.error?.message ?? "",
        )
      ) {
        delete body.response_format;
        response = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
            ...extraHeaders,
          },
          body: JSON.stringify(body),
        });
        json = (await response.json()) as OpenAIChatResponse;
      }

      if (!response.ok) {
        throw new Error(
          json.error?.message ?? `OpenAI request failed (${response.status})`,
        );
      }

      const choice = json.choices?.[0]?.message;
      if (!choice) {
        throw new Error("OpenAI returned no choices");
      }

      const toolCalls = (choice.tool_calls ?? [])
        .map(toToolCall)
        .filter((call): call is ToolCall => call !== undefined);

      const text =
        choice.content === undefined || choice.content === null
          ? undefined
          : choice.content;

      const usage = json.usage
        ? {
            ...(json.usage.prompt_tokens !== undefined
              ? { inputTokens: json.usage.prompt_tokens }
              : {}),
            ...(json.usage.completion_tokens !== undefined
              ? { outputTokens: json.usage.completion_tokens }
              : {}),
            ...(json.usage.total_tokens !== undefined
              ? { totalTokens: json.usage.total_tokens }
              : {}),
          }
        : undefined;

      if (toolCalls.length > 0) {
        return {
          ...(text !== undefined ? { text } : {}),
          toolCalls,
          ...(usage !== undefined ? { usage } : {}),
        };
      }

      let output: unknown;
      if (request.outputSchema && text) {
        try {
          output = JSON.parse(text);
        } catch {
          output = undefined;
        }
      }

      return {
        ...(text !== undefined ? { text } : {}),
        ...(output !== undefined ? { output } : {}),
        ...(usage !== undefined ? { usage } : {}),
      };
    },
  };
}

function toOpenAIMessage(message: AgentMessage): Record<string, unknown> {
  switch (message.role) {
    case "system":
    case "user":
      return { role: message.role, content: message.content };
    case "assistant":
      return {
        role: "assistant",
        content: message.content ?? null,
        ...(message.toolCalls
          ? {
              tool_calls: message.toolCalls.map((call) => ({
                id: call.id ?? call.name,
                type: "function",
                function: {
                  name: call.name,
                  arguments: JSON.stringify(call.input ?? {}),
                },
              })),
            }
          : {}),
      };
    case "tool":
      return {
        role: "tool",
        tool_call_id: message.toolCallId ?? message.name,
        content: JSON.stringify(message.output),
      };
  }
}

function toOpenAITool(tool: ToolDefinition): Record<string, unknown> {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters ?? {
        type: "object",
        properties: {},
      },
    },
  };
}

function toToolCall(call: {
  id: string;
  type: string;
  function: { name: string; arguments: string };
}): ToolCall | undefined {
  if (call.type !== "function") {
    return undefined;
  }

  let input: unknown = {};
  try {
    input = JSON.parse(call.function.arguments || "{}");
  } catch {
    input = { raw: call.function.arguments };
  }

  return {
    id: call.id,
    name: call.function.name,
    input,
  };
}

function withOutputSchemaHint(
  messages: Array<Record<string, unknown>>,
  outputSchema: Readonly<Record<string, unknown>> | undefined,
): Array<Record<string, unknown>> {
  if (!outputSchema) {
    return messages;
  }

  const hint = {
    role: "system",
    content:
      "Return a single JSON object that matches this JSON Schema exactly. Do not include markdown fences or extra keys.\n" +
      JSON.stringify(outputSchema),
  };

  return [hint, ...messages];
}
