export function createFakeExportModel(scenario = "idvault-export") {
  let call = 0;
  const rawByScenario = {
    "idvault-ack": {
      system: "idvault",
      requestId: "iv-501",
      subjectEmail: "alex@velum.example",
      type: "ack-only",
      notes: "confirm we hold an account",
    },
    "idvault-export": {
      system: "idvault",
      requestId: "iv-502",
      subjectEmail: "blake@velum.example",
      type: "export",
      notes: "full subject access request",
    },
    "mailroom-regulator":
      "From: regulator@authority.example\nSubject: URGENT SAR for casey@velum.example\nRef: mr-12\nIntent: export\nTags: regulator",
  };

  return {
    async generate(request) {
      call += 1;
      const raw = rawByScenario[scenario];

      if (scenario === "idvault-ack") {
        if (call === 1) {
          return { toolCalls: [{ name: "normalizeAndAssess", input: { raw } }] };
        }
        if (call === 2) {
          const assessed = request.messages.filter((m) => m.role === "tool").at(-1)
            ?.output;
          return {
            toolCalls: [
              {
                name: "openExportCase",
                input: {
                  fingerprint: assessed.normalized.fingerprint,
                  source: assessed.normalized.source,
                  team: assessed.normalized.team,
                  subjectEmail: assessed.normalized.subjectEmail,
                  category: "acknowledge",
                },
              },
            ],
          };
        }
        const opened = request.messages.filter((m) => m.role === "tool").at(-1)
          ?.output;
        const assessed = request.messages.find(
          (m) => m.role === "tool" && m.name === "normalizeAndAssess",
        )?.output;
        return structured({
          category: "acknowledge",
          severity: "low",
          action: "acknowledge",
          source: assessed.normalized.source,
          team: assessed.normalized.team,
          fingerprint: assessed.normalized.fingerprint,
          caseId: opened.caseId,
          exportProposalId: null,
          subjectEmail: assessed.normalized.subjectEmail,
          summary: "Acknowledged; no export.",
          requiresHumanApproval: false,
          exported: false,
        });
      }

      if (call === 1) {
        return { toolCalls: [{ name: "normalizeAndAssess", input: { raw } }] };
      }
      if (call === 2) {
        const assessed = request.messages.filter((m) => m.role === "tool").at(-1)
          ?.output;
        return {
          toolCalls: [
            {
              name: "openExportCase",
              input: {
                fingerprint: assessed.normalized.fingerprint,
                source: assessed.normalized.source,
                team: assessed.normalized.team,
                subjectEmail: assessed.normalized.subjectEmail,
                category: assessed.suggestion.category,
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
              name: "proposeExport",
              input: {
                fingerprint: assessed.normalized.fingerprint,
                source: assessed.normalized.source,
                team: assessed.normalized.team,
                subjectEmail: assessed.normalized.subjectEmail,
                reason: assessed.suggestion.reason,
              },
            },
          ],
        };
      }
      const assessed = request.messages.find(
        (m) => m.role === "tool" && m.name === "normalizeAndAssess",
      )?.output;
      const opened = request.messages.find(
        (m) => m.role === "tool" && m.name === "openExportCase",
      )?.output;
      const proposal = request.messages.find(
        (m) => m.role === "tool" && m.name === "proposeExport",
      )?.output;
      return structured({
        category: assessed.suggestion.category,
        severity: assessed.suggestion.severity,
        action: "proposeExport",
        source: assessed.normalized.source,
        team: assessed.normalized.team,
        fingerprint: assessed.normalized.fingerprint,
        caseId: opened.caseId,
        exportProposalId: proposal.id,
        subjectEmail: assessed.normalized.subjectEmail,
        summary: "Export proposed; awaiting privacy approval.",
        requiresHumanApproval: true,
        exported: false,
      });
    },
  };
}

function structured(output) {
  return { text: JSON.stringify(output), output };
}
