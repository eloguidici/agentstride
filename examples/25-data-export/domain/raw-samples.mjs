/**
 * Pure domain — Velum Grid subject-access / data-export requests.
 * Compliance vertical (distinct from alarms + change-gate).
 */

export function sampleIdvaultRequests() {
  return [
    {
      system: "idvault",
      requestId: "iv-501",
      subjectEmail: "alex@velum.example",
      type: "ack-only",
      notes: "confirm we hold an account",
    },
    {
      system: "idvault",
      requestId: "iv-502",
      subjectEmail: "blake@velum.example",
      type: "export",
      notes: "full subject access request",
    },
    {
      system: "idvault",
      requestId: "iv-503",
      subjectEmail: "casey@velum.example",
      type: "export",
      notes: "urgent regulator-driven export",
      tags: ["regulator", "urgent"],
    },
  ];
}

export function sampleMailroomRequests() {
  return [
    "From: alex@velum.example\nSubject: Do you store my data?\nRef: mr-10\nIntent: acknowledge",
    "From: blake@velum.example\nSubject: Please send my data copy\nRef: mr-11\nIntent: export",
    "From: regulator@authority.example\nSubject: URGENT SAR for casey@velum.example\nRef: mr-12\nIntent: export\nTags: regulator",
  ];
}

export function sampleLedgerflarePiiRequests() {
  return [
    {
      portal: "ledgerflare-pii",
      envelope: {
        id: "lp-20",
        kind: "lookup",
        customerRef: "cust-900",
        email: "alex@velum.example",
      },
    },
    {
      portal: "ledgerflare-pii",
      envelope: {
        id: "lp-21",
        kind: "export",
        customerRef: "cust-901",
        email: "blake@velum.example",
      },
    },
    {
      portal: "ledgerflare-pii",
      envelope: {
        id: "lp-22",
        kind: "export",
        customerRef: "cust-902",
        email: "casey@velum.example",
        flags: ["regulator"],
      },
    },
  ];
}
