import type { StandardSchemaV1 } from "@standard-schema/spec";

import { AgentAbortError, ToolExecutionError } from "./errors.js";
import {
  assertToolAllowed,
  createRunId,
  finalizeRun,
  lastAssistantText,
  runWithDeadline,
  withAbortSignalContext,
  type AgentHooks,
  type HookContext,
} from "./runtime-helpers.js";
import { getSchemaJsonSchema, parseToolInput } from "./schema.js";
import { resolveStructuredOutput } from "./structured-output.js";
import type { Tool } from "./tool.js";
import type {
  AgentContext,
  AgentEvent,
  AgentLike,
  AgentMessage,
  AgentRun,
  InferSchemaOutput,
  Memory,
  Model,
  ModelRequest,
  ToolCall,
  ToolDefinition,
} from "./types.js";

export type AgentRunOptions = Readonly<{
  context?: AgentContext;
  output?: StandardSchemaV1;
  threadId?: string;
  memory?: Memory;
  /** Cancel this run; also combined with timeoutMs when set. */
  signal?: AbortSignal;
}>;

export type AgentConfig = Readonly<{
  model: Model;
  instructions?: string;
  tools?: Readonly<Record<string, Tool<unknown, unknown>>>;
  maxSteps?: number;
  timeoutMs?: number;
  allowedTools?: readonly string[];
  deniedTools?: readonly string[];
  hooks?: AgentHooks;
  onEvent?: (event: AgentEvent) => void;
  memory?: Memory;
}>;

export interface Agent extends AgentLike<string, AgentRun> {
  run<TSchema extends StandardSchemaV1>(
    input: string,
    options: AgentRunOptions & { output: TSchema },
  ): Promise<AgentRun<InferSchemaOutput<TSchema>>>;
  run(input: string, options?: AgentRunOptions): Promise<AgentRun>;
}

const DEFAULT_MAX_STEPS = 8;

export function createAgent(config: AgentConfig): Agent {
  const maxSteps = config.maxSteps ?? DEFAULT_MAX_STEPS;

  if (!Number.isInteger(maxSteps) || maxSteps < 1) {
    throw new Error("maxSteps must be a positive integer");
  }

  const tools = config.tools ?? {};
  const toolDefinitions: ToolDefinition[] = Object.values(tools).map((tool) => ({
    name: tool.name,
    description: tool.description,
    ...(tool.parameters !== undefined ? { parameters: tool.parameters } : {}),
  }));

  const agent: Agent = {
    async run(input: string, options: AgentRunOptions = {}): Promise<AgentRun> {
      const runId = createRunId();
      const startedAt = Date.now();
      const events: AgentEvent[] = [];
      const context = options.context ?? {};
      const memory = options.memory ?? config.memory;
      const messages: AgentMessage[] = [];
      let steps = 0;

      const emit = (event: AgentEvent) => {
        events.push(event);
        config.onEvent?.(event);
      };

      const hookBase = (): Omit<
        HookContext,
        "step" | "toolCall" | "toolOutput" | "modelRequest" | "modelResponse" | "error"
      > => ({
        runId,
        input,
        context,
        messages,
      });

      try {
        return await runWithDeadline(
          async (signal) =>
            executeAgentLoop({
              config,
              input,
              options,
              runId,
              startedAt,
              events,
              context,
              memory,
              messages,
              tools,
              toolDefinitions,
              maxSteps,
              signal,
              emit,
              hookBase,
              setSteps: (value) => {
                steps = value;
              },
            }),
          {
            label: "Agent run",
            ...(config.timeoutMs !== undefined
              ? { timeoutMs: config.timeoutMs }
              : {}),
            ...(options.signal !== undefined ? { signal: options.signal } : {}),
          },
        );
      } catch (error) {
        emit({ type: "run:error", runId, error });
        await config.hooks?.onError?.({
          ...hookBase(),
          error,
        });

        throw Object.assign(error instanceof Error ? error : new Error(String(error)), {
          agentRun: finalizeRun({
            id: runId,
            status: "failed" as const,
            text: lastAssistantText(messages),
            steps,
            messages,
            startedAt,
            events,
            error,
          }),
        });
      }
    },
  };

  return agent;
}

type LoopArgs = {
  config: AgentConfig;
  input: string;
  options: AgentRunOptions;
  runId: string;
  startedAt: number;
  events: AgentEvent[];
  context: AgentContext;
  memory: Memory | undefined;
  messages: AgentMessage[];
  tools: Readonly<Record<string, Tool<unknown, unknown>>>;
  toolDefinitions: ToolDefinition[];
  maxSteps: number;
  signal: AbortSignal;
  emit: (event: AgentEvent) => void;
  hookBase: () => Omit<
    HookContext,
    "step" | "toolCall" | "toolOutput" | "modelRequest" | "modelResponse" | "error"
  >;
  setSteps: (value: number) => void;
};

async function executeAgentLoop(args: LoopArgs): Promise<AgentRun> {
  const {
    config,
    input,
    options,
    runId,
    startedAt,
    events,
    context,
    memory,
    messages,
    tools,
    toolDefinitions,
    maxSteps,
    signal,
    emit,
    hookBase,
    setSteps,
  } = args;

  const toolContext = withAbortSignalContext(context, signal);

  emit({ type: "run:start", runId, input });
  await config.hooks?.beforeRun?.(hookBase());
  throwIfAborted(signal);

  if (config.instructions) {
    messages.push({ role: "system", content: config.instructions });
  }

  if (memory && options.threadId) {
    const prior = await memory.load(options.threadId);
    throwIfAborted(signal);
    messages.push(...prior);
  }

  messages.push({ role: "user", content: input });

  const outputSchemaJson =
    options.output !== undefined
      ? getSchemaJsonSchema(options.output)
      : undefined;

  for (let step = 1; step <= maxSteps; step += 1) {
    setSteps(step);
    throwIfAborted(signal);

    const modelRequest: ModelRequest = {
      messages,
      tools: toolDefinitions,
      ...(outputSchemaJson !== undefined
        ? { outputSchema: outputSchemaJson }
        : {}),
      signal,
    };

    const response = await runModelStep({
      config,
      runId,
      step,
      modelRequest,
      emit,
      hookBase,
    });

    const toolCalls = response.toolCalls ?? [];

    messages.push({
      role: "assistant",
      ...(response.text !== undefined ? { content: response.text } : {}),
      ...(toolCalls.length > 0 ? { toolCalls } : {}),
    });

    if (toolCalls.length === 0) {
      const text = response.text ?? "";
      let output: unknown;

      if (options.output !== undefined) {
        output = await resolveStructuredOutput(
          options.output,
          response.output,
          text,
        );
      }

      if (memory && options.threadId) {
        await memory.save(options.threadId, messages);
      }

      emit({ type: "run:end", runId, status: "completed" });

      return finalizeRun({
        id: runId,
        status: "completed",
        text,
        ...(output !== undefined ? { output } : {}),
        steps: step,
        messages,
        startedAt,
        events,
      });
    }

    for (const call of toolCalls) {
      throwIfAborted(signal);
      await runToolCall({
        config,
        runId,
        step,
        call,
        tools,
        toolContext,
        messages,
        emit,
        hookBase,
      });
    }
  }

  throw new Error(`Agent exceeded maxSteps (${maxSteps})`);
}

async function runModelStep(args: {
  config: AgentConfig;
  runId: string;
  step: number;
  modelRequest: ModelRequest;
  emit: (event: AgentEvent) => void;
  hookBase: LoopArgs["hookBase"];
}) {
  const { config, runId, step, modelRequest, emit, hookBase } = args;

  emit({ type: "model:start", runId, step });
  await config.hooks?.beforeModel?.({
    ...hookBase(),
    step,
    modelRequest,
  });

  const response = await config.model.generate(modelRequest);

  emit({
    type: "model:end",
    runId,
    step,
    ...(response.usage !== undefined ? { usage: response.usage } : {}),
  });
  await config.hooks?.afterModel?.({
    ...hookBase(),
    step,
    modelRequest,
    modelResponse: response,
  });

  return response;
}

async function runToolCall(args: {
  config: AgentConfig;
  runId: string;
  step: number;
  call: ToolCall;
  tools: Readonly<Record<string, Tool<unknown, unknown>>>;
  toolContext: AgentContext;
  messages: AgentMessage[];
  emit: (event: AgentEvent) => void;
  hookBase: LoopArgs["hookBase"];
}) {
  const {
    config,
    runId,
    step,
    call,
    tools,
    toolContext,
    messages,
    emit,
    hookBase,
  } = args;

  assertToolAllowed(call.name, config.allowedTools, config.deniedTools);

  emit({
    type: "tool:start",
    runId,
    toolName: call.name,
    ...(call.id !== undefined ? { toolCallId: call.id } : {}),
  });
  await config.hooks?.beforeTool?.({
    ...hookBase(),
    step,
    toolCall: call,
  });

  const toolOutput = await executeTool(call, tools, toolContext);

  emit({
    type: "tool:end",
    runId,
    toolName: call.name,
    ...(call.id !== undefined ? { toolCallId: call.id } : {}),
  });
  await config.hooks?.afterTool?.({
    ...hookBase(),
    step,
    toolCall: call,
    toolOutput,
  });

  messages.push({
    role: "tool",
    name: call.name,
    ...(call.id !== undefined ? { toolCallId: call.id } : {}),
    output: toolOutput,
  });
}

async function executeTool(
  call: ToolCall,
  tools: Readonly<Record<string, Tool<unknown, unknown>>>,
  context: AgentContext,
): Promise<unknown> {
  const tool = tools[call.name];

  if (!tool) {
    throw new Error(`Model requested unknown tool: ${call.name}`);
  }

  const input =
    tool.inputSchema === undefined
      ? call.input
      : await parseToolInput(tool.inputSchema, call.input, tool.name);

  try {
    return await tool.execute(input, context);
  } catch (error) {
    if (error instanceof ToolExecutionError) {
      throw error;
    }
    throw new ToolExecutionError(tool.name, error);
  }
}

function throwIfAborted(signal: AbortSignal): void {
  if (!signal.aborted) {
    return;
  }
  const reason = signal.reason;
  if (reason instanceof Error) {
    throw reason;
  }
  throw new AgentAbortError(
    typeof reason === "string" ? reason : undefined,
  );
}
