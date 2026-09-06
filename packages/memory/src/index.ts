import type { AgentMessage, Memory } from "@agentstride/core";

export type { Memory } from "@agentstride/core";

export function createInMemoryMemory(): Memory {
  const threads = new Map<string, AgentMessage[]>();

  return {
    async load(threadId) {
      return [...(threads.get(threadId) ?? [])];
    },
    async save(threadId, messages) {
      threads.set(
        threadId,
        messages.filter(
          (message) => message.role === "user" || message.role === "assistant",
        ),
      );
    },
  };
}
