/**
 * Scripted fake model keyed by scenario name.
 */

export function createFakeChangeModel(scenario = "shipyard-hotfix") {
  let call = 0;
  const rawByScenario = {
    "shipyard-docs": {
      system: "shipyard",
      changeId: "sy-401",
      env: "staging",
      title: "bump docs theme",
      risk: "low",
      window: "anytime",
    },
    "shipyard-canary": {
      system: "shipyard",
      changeId: "sy-402",
      env: "production",
      title: "roll api-edge canary 10%",
      risk: "medium",
      window: "Thu 02:00-04:00 UTC",
    },
    "shipyard-hotfix": {
      system: "shipyard",
      changeId: "sy-403",
      env: "production",
      title: "hotfix crash-loop restart storm",
      risk: "high",
      window: "immediate",
      tags: ["emergency", "hotfix"],
    },
    "wiredesk-maintenance":
      "Subject: core-sw maintenance window\nChange: wd-78\nRisk: medium\nEnv: production\nNotes: drain BGP before reboot",
    "ledgerops-emergency": {
      portal: "ledgerops",
      payload: {
        id: "lo-14",
        level: "emergency",
        service: "settlement-worker",
        summary: "stop failed batch replay loop",
      },
    },
  };

  return {
    async generate(request) {
      call += 1;
      const raw = rawByScenario[scenario];

      if (scenario === "shipyard-docs") {
        if (call === 1) {
          return { toolCalls: [{ name: "normalizeAndAssess", input: { raw } }] };
        }
        if (call === 2) {
          const assessed = request.messages.filter((m) => m.role === "tool").at(-1)?.output;
          return {
            toolCalls: [
              {
                name: "openChangeRecord",
                input: {
                  fingerprint: assessed.normalized.fingerprint,
                  source: assessed.normalized.source,
                  team: assessed.normalized.team,
                  title: assessed.normalized.title,
                  category: "routine",
                },
              },
            ],
          };
        }
        const record = request.messages.filter((m) => m.role === "tool").at(-1)?.output;
        const assessed = request.messages.find(
          (m) => m.role === "tool" && m.name === "normalizeAndAssess",
        )?.output;
        return structured({
          category: "routine",
          severity: "low",
          action: "record",
          source: assessed.normalized.source,
          team: assessed.normalized.team,
          fingerprint: assessed.normalized.fingerprint,
          changeRecordId: record.changeRecordId,
          executeProposalId: null,
          summary: "Routine change recorded; no execute.",
          requiresHumanApproval: false,
          executed: false,
        });
      }

      // elevated / emergency paths
      if (call === 1) {
        return { toolCalls: [{ name: "normalizeAndAssess", input: { raw } }] };
      }
      if (call === 2) {
        const assessed = request.messages.filter((m) => m.role === "tool").at(-1)?.output;
        const category = assessed.suggestion.category;
        return {
          toolCalls: [
            {
              name: "openChangeRecord",
              input: {
                fingerprint: assessed.normalized.fingerprint,
                source: assessed.normalized.source,
                team: assessed.normalized.team,
                title: assessed.normalized.title,
                category,
              },
            },
          ],
        };
      }
      if (call === 3) {
        const assessed = request.messages.find(
          (m) => m.role === "tool" && m.name === "normalizeAndAssess",
        )?.output;
        return {
          toolCalls: [
            {
              name: "proposeExecute",
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
      const assessed = request.messages.find(
        (m) => m.role === "tool" && m.name === "normalizeAndAssess",
      )?.output;
      const record = request.messages.find(
        (m) => m.role === "tool" && m.name === "openChangeRecord",
      )?.output;
      const proposal = request.messages.find(
        (m) => m.role === "tool" && m.name === "proposeExecute",
      )?.output;
      return structured({
        category: assessed.suggestion.category,
        severity: assessed.suggestion.severity,
        action: "proposeExecute",
        source: assessed.normalized.source,
        team: assessed.normalized.team,
        fingerprint: assessed.normalized.fingerprint,
        changeRecordId: record.changeRecordId,
        executeProposalId: proposal.id,
        summary: "Change recorded + execute proposed; waiting for approval.",
        requiresHumanApproval: true,
        executed: false,
      });
    },
  };
}

function structured(output) {
  return { text: JSON.stringify(output), output };
}
