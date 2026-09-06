/**
 * Map AgentStride AgentEvents to OpenTelemetry spans (example/proof only).
 *
 * Attribute names follow OpenTelemetry GenAI semantic conventions (Development
 * stability): gen_ai.operation.name, gen_ai.agent.name, gen_ai.tool.name,
 * gen_ai.usage.* — see https://opentelemetry.io/docs/specs/semconv/gen-ai/
 *
 * Privacy default: do not export full prompts or tool payloads.
 */

import {
  SpanStatusCode,
  context as otelContext,
  trace,
} from "@opentelemetry/api";

/**
 * @typedef {object} AgentEventTracerOptions
 * @property {import('@opentelemetry/api').Tracer} [tracer]
 * @property {string} [modelName]
 * @property {string} [providerName]
 * @property {boolean} [includeInput] - default false
 */

/**
 * @param {AgentEventTracerOptions} [options]
 */
export function createAgentEventTracer(options = {}) {
  const otelTracer =
    options.tracer ?? trace.getTracer("agentstride-example-otel", "0.0.0");
  const modelName = options.modelName;
  const providerName = options.providerName;
  const includeInput = options.includeInput === true;

  /** @type {Map<string, import('@opentelemetry/api').Span>} */
  const runSpans = new Map();
  /** @type {Map<string, import('@opentelemetry/api').Span>} */
  const modelSpans = new Map();
  /** @type {Map<string, import('@opentelemetry/api').Span>} */
  const toolSpans = new Map();

  /**
   * @param {string} agentName
   */
  function forAgent(agentName) {
    return function onEvent(event) {
      handleEvent(event, agentName);
    };
  }

  /**
   * @param {import('@agentstride/core').AgentEvent} event
   * @param {string} agentName
   */
  function handleEvent(event, agentName) {
    switch (event.type) {
      case "run:start": {
        const parentSpan = event.parentRunId
          ? runSpans.get(event.parentRunId)
          : undefined;
        const parentContext = parentSpan
          ? trace.setSpan(otelContext.active(), parentSpan)
          : otelContext.active();

        const span = otelTracer.startSpan(
          `invoke_agent ${agentName}`,
          {
            attributes: {
              "gen_ai.operation.name": "invoke_agent",
              "gen_ai.agent.name": agentName,
              "agentstride.run.id": event.runId,
              ...(event.parentRunId
                ? { "agentstride.run.parent_id": event.parentRunId }
                : {}),
              ...(includeInput
                ? { "agentstride.run.input": String(event.input ?? "") }
                : {
                    "agentstride.run.input_chars": String(event.input ?? "")
                      .length,
                  }),
              ...(modelName
                ? { "gen_ai.request.model": modelName }
                : {}),
              ...(providerName
                ? { "gen_ai.provider.name": providerName }
                : {}),
            },
          },
          parentContext,
        );
        runSpans.set(event.runId, span);
        break;
      }

      case "model:start": {
        const parent = runSpans.get(event.runId);
        if (!parent) return;
        const span = otelTracer.startSpan(
          modelName ? `chat ${modelName}` : `chat step-${event.step}`,
          {
            attributes: {
              "gen_ai.operation.name": "chat",
              "agentstride.run.id": event.runId,
              "agentstride.model.step": event.step,
              ...(modelName ? { "gen_ai.request.model": modelName } : {}),
              ...(providerName
                ? { "gen_ai.provider.name": providerName }
                : {}),
            },
          },
          trace.setSpan(otelContext.active(), parent),
        );
        modelSpans.set(modelKey(event.runId, event.step), span);
        break;
      }

      case "model:end": {
        const span = modelSpans.get(modelKey(event.runId, event.step));
        if (!span) return;
        if (event.usage) {
          if (typeof event.usage.inputTokens === "number") {
            span.setAttribute(
              "gen_ai.usage.input_tokens",
              event.usage.inputTokens,
            );
          }
          if (typeof event.usage.outputTokens === "number") {
            span.setAttribute(
              "gen_ai.usage.output_tokens",
              event.usage.outputTokens,
            );
          }
          if (typeof event.usage.totalTokens === "number") {
            span.setAttribute(
              "gen_ai.usage.total_tokens",
              event.usage.totalTokens,
            );
          }
        }
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        modelSpans.delete(modelKey(event.runId, event.step));
        break;
      }

      case "tool:start": {
        const parent = runSpans.get(event.runId);
        if (!parent) return;
        const span = otelTracer.startSpan(`execute_tool ${event.toolName}`, {
          attributes: {
            "gen_ai.operation.name": "execute_tool",
            "gen_ai.tool.name": event.toolName,
            "agentstride.run.id": event.runId,
            ...(event.toolCallId
              ? { "gen_ai.tool.call.id": event.toolCallId }
              : {}),
            // Tool arguments intentionally omitted (privacy default).
          },
        }, trace.setSpan(otelContext.active(), parent));
        toolSpans.set(toolKey(event), span);
        break;
      }

      case "tool:end": {
        const span = toolSpans.get(toolKey(event));
        if (!span) return;
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        toolSpans.delete(toolKey(event));
        break;
      }

      case "run:end": {
        const span = runSpans.get(event.runId);
        if (!span) return;
        span.setAttribute("agentstride.run.status", event.status);
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        runSpans.delete(event.runId);
        break;
      }

      case "run:error": {
        const span = runSpans.get(event.runId);
        if (!span) return;
        const message =
          event.error instanceof Error
            ? event.error.message
            : String(event.error ?? "error");
        span.setAttribute("agentstride.run.status", "failed");
        span.setAttribute("error.type", errorType(event.error));
        // Message only — no stack / prompt dump by default.
        span.setStatus({ code: SpanStatusCode.ERROR, message });
        span.end();
        runSpans.delete(event.runId);
        // Best-effort end of open children for this run.
        endOpenChildren(event.runId);
        break;
      }

      default:
        break;
    }
  }

  function endOpenChildren(runId) {
    for (const [key, span] of modelSpans) {
      if (key.startsWith(`${runId}:`)) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: "run aborted" });
        span.end();
        modelSpans.delete(key);
      }
    }
    for (const [key, span] of toolSpans) {
      if (key.startsWith(`${runId}:`)) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: "run aborted" });
        span.end();
        toolSpans.delete(key);
      }
    }
  }

  return {
    forAgent,
    /** @deprecated prefer forAgent(name) */
    onEvent: forAgent(options.agentName ?? "agent"),
  };
}

function modelKey(runId, step) {
  return `${runId}:${step}`;
}

function toolKey(event) {
  return `${event.runId}:${event.toolName}:${event.toolCallId ?? ""}`;
}

function errorType(error) {
  if (error instanceof Error && error.name) return error.name;
  return "Error";
}
