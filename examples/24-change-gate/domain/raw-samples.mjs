/**
 * Pure domain — three raw change-request shapes for Velum Grid.
 * Proactive ops (distinct from reactive alarm triage).
 */

/**
 * Shipyard (platform) — JSON change tickets.
 */
export function sampleShipyardChanges() {
  return [
    {
      system: "shipyard",
      changeId: "sy-401",
      env: "staging",
      title: "bump docs theme",
      risk: "low",
      window: "anytime",
    },
    {
      system: "shipyard",
      changeId: "sy-402",
      env: "production",
      title: "roll api-edge canary 10%",
      risk: "medium",
      window: "Thu 02:00-04:00 UTC",
    },
    {
      system: "shipyard",
      changeId: "sy-403",
      env: "production",
      title: "hotfix crash-loop restart storm",
      risk: "high",
      window: "immediate",
      tags: ["emergency", "hotfix"],
    },
  ];
}

/**
 * Wiredesk (netops) — email-like text.
 */
export function sampleWiredeskChanges() {
  return [
    "Subject: routine ACL comment sync\nChange: wd-77\nRisk: low\nEnv: lab",
    "Subject: core-sw maintenance window\nChange: wd-78\nRisk: medium\nEnv: production\nNotes: drain BGP before reboot",
    "Subject: EMERGENCY fiber cut reroute\nChange: wd-79\nRisk: high\nEnv: production\nNotes: execute now",
  ];
}

/**
 * Ledgerops (payments) — nested ops portal payload.
 */
export function sampleLedgeropsChanges() {
  return [
    {
      portal: "ledgerops",
      payload: {
        id: "lo-12",
        level: "routine",
        service: "settlement-worker",
        summary: "rotate non-prod credentials",
      },
    },
    {
      portal: "ledgerops",
      payload: {
        id: "lo-13",
        level: "elevated",
        service: "card-auth",
        summary: "schema migrate auth ledger",
      },
    },
    {
      portal: "ledgerops",
      payload: {
        id: "lo-14",
        level: "emergency",
        service: "settlement-worker",
        summary: "stop failed batch replay loop",
      },
    },
  ];
}
