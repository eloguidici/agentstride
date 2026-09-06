/**
 * In-memory OpenTelemetry setup for demos and tests.
 */

import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";

export function createInMemoryTracing() {
  const exporter = new InMemorySpanExporter();
  const provider = new BasicTracerProvider();
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  // Do not register globally — keep proof isolated from other examples/tests.
  const tracer = provider.getTracer("agentstride-example-otel");
  return {
    provider,
    exporter,
    tracer,
    async shutdown() {
      await provider.shutdown();
    },
  };
}

/**
 * @param {import('@opentelemetry/sdk-trace-base').ReadableSpan[]} spans
 */
export function summarizeSpans(spans) {
  return spans.map((span) => ({
    name: span.name,
    traceId: span.spanContext().traceId,
    spanId: span.spanContext().spanId,
    parentSpanId: span.parentSpanId,
    attributes: { ...span.attributes },
    status: span.status,
  }));
}
