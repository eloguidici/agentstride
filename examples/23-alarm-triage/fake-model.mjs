/**
 * Scripted fake model keyed by scenario name.
 */

export function createFakeTriageModel(scenario = "pulsebeat-crash") {
  let call = 0;
  const rawByScenario = {
    "pulsebeat-ping": {
      source: "pulsebeat",
      host: "api-edge-3",
      severity: "info",
      message: "heartbeat ping ok",
      eventId: "pb-1001",
    },
    "pulsebeat-warn": {
      source: "pulsebeat",
      host: "api-edge-3",
      severity: "warning",
      message: "cpu above 85% for 5m",
      eventId: "pb-1002",
    },
    "pulsebeat-crash": {
      source: "pulsebeat",
      host: "api-edge-1",
      severity: "critical",
      message: "process crash loop detected",
      eventId: "pb-1003",
    },
    "wirewatch-bgp": "<crit> core-sw-1 BGP neighbor down id=ww-202",
    "ledgerflare-ping": {
      origin: "ledgerflare",
      envelope: {
        id: "lf-900",
        level: "DEBUG",
        component: "settlement-worker",
        text: "periodic health ping",
      },
    },
  };

  return {
    async generate(request) {
      call += 1;
      const raw = rawByScenario[scenario];

      if (scenario === "pulsebeat-ping" || scenario === "ledgerflare-ping") {
        if (call === 1) {
          return { toolCalls: [{ name: "normalizeAndAssess", input: { raw } }] };
        }
        const assessed = request.messages.filter((m) => m.role === "tool").at(-1)?.output;
        return structured({
          category: "noise",
          severity: "low",
          action: "drop",
          source: assessed?.normalized?.source ?? "unknown",
          team: assessed?.normalized?.team ?? "unknown",
          fingerprint: assessed?.normalized?.fingerprint ?? "unknown",
          ticketId: null,
          pageProposalId: null,
          summary: "Noise/ping — dropped.",
          requiresHumanApproval: false,
          paged: false,
        });
      }

      if (scenario === "pulsebeat-warn") {
        if (call === 1) {
          return { toolCalls: [{ name: "normalizeAndAssess", input: { raw } }] };
        }
        if (call === 2) {
          const assessed = request.messages.filter((m) => m.role === "tool").at(-1)?.output;
          return {
            toolCalls: [
              {
                name: "openTicket",
                input: {
                  fingerprint: assessed.normalized.fingerprint,
                  source: assessed.normalized.source,
                  team: assessed.normalized.team,
                  summary: assessed.normalized.message,
                },
              },
            ],
          };
        }
        const ticket = request.messages.filter((m) => m.role === "tool").at(-1)?.output;
        const assessed = request.messages.find((m) => m.role === "tool" && m.name === "normalizeAndAssess")?.output;
        return structured({
          category: "warning",
          severity: "medium",
          action: "ticket",
          source: assessed.normalized.source,
          team: assessed.normalized.team,
          fingerprint: assessed.normalized.fingerprint,
          ticketId: ticket.ticketId,
          pageProposalId: null,
          summary: "Warning ticket opened; no page.",
          requiresHumanApproval: false,
          paged: false,
        });
      }

      // incident paths
      if (call === 1) {
        return { toolCalls: [{ name: "normalizeAndAssess", input: { raw } }] };
      }
      if (call === 2) {
        const assessed = request.messages.filter((m) => m.role === "tool").at(-1)?.output;
        return {
          toolCalls: [
            {
              name: "openTicket",
              input: {
                fingerprint: assessed.normalized.fingerprint,
                source: assessed.normalized.source,
                team: assessed.normalized.team,
                summary: assessed.normalized.message,
              },
            },
          ],
        };
      }
      if (call === 3) {
        const assessed = request.messages.find((m) => m.role === "tool" && m.name === "normalizeAndAssess")?.output;
        return {
          toolCalls: [
            {
              name: "proposePage",
              input: {
                fingerprint: assessed.normalized.fingerprint,
                source: assessed.normalized.source,
                team: assessed.normalized.team,
                reason: assessed.suggestion.reason,
              },
            },
          ],
        };
      }
      const assessed = request.messages.find((m) => m.role === "tool" && m.name === "normalizeAndAssess")?.output;
      const ticket = request.messages.find((m) => m.role === "tool" && m.name === "openTicket")?.output;
      const page = request.messages.find((m) => m.role === "tool" && m.name === "proposePage")?.output;
      return structured({
        category: "incident",
        severity: "high",
        action: "page",
        source: assessed.normalized.source,
        team: assessed.normalized.team,
        fingerprint: assessed.normalized.fingerprint,
        ticketId: ticket.ticketId,
        pageProposalId: page.id,
        summary: "Incident ticket + page proposal; waiting for SRE approval. Not paged.",
        requiresHumanApproval: true,
        paged: false,
      });
    },
  };
}

function structured(output) {
  return { text: JSON.stringify(output), output };
}
