import type { AgentLike, AgentRun } from "@agentstride/core";

export type RemoteAgentEndpoint = Readonly<{
  url: string;
  headers?: Readonly<Record<string, string>>;
  fetchImpl?: typeof fetch;
}>;

/**
 * Experimental HTTP AgentLike that posts `{ input, context }` to a remote agent.
 * This is a research sketch, not a full A2A protocol client.
 */
export function createRemoteAgent(
  endpoint: RemoteAgentEndpoint,
): AgentLike<string, AgentRun> {
  const fetchImpl = endpoint.fetchImpl ?? fetch;

  return {
    async run(input, options = {}) {
      const response = await fetchImpl(endpoint.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(endpoint.headers ?? {}),
        },
        body: JSON.stringify({
          input,
          context: options.context ?? {},
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Remote agent request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as AgentRun;
    },
  };
}
