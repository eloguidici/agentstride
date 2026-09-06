/**
 * Pure domain — three raw alarm shapes from Velum Grid teams.
 * No AgentStride imports.
 */

/** @typedef {'pulsebeat' | 'wirewatch' | 'ledgerflare'} AlarmSource */

/**
 * Pulsebeat (platform) — JSON events.
 * @example { source: 'pulsebeat', host, severity, message, eventId }
 */
export function samplePulsebeatAlarms() {
  return [
    {
      source: "pulsebeat",
      host: "api-edge-3",
      severity: "info",
      message: "heartbeat ping ok",
      eventId: "pb-1001",
    },
    {
      source: "pulsebeat",
      host: "api-edge-3",
      severity: "warning",
      message: "cpu above 85% for 5m",
      eventId: "pb-1002",
    },
    {
      source: "pulsebeat",
      host: "api-edge-1",
      severity: "critical",
      message: "process crash loop detected",
      eventId: "pb-1003",
    },
  ];
}

/**
 * Wirewatch (netops) — syslog-like lines.
 * @example "<warn> router-7 link flapping on eth2 id=ww-55"
 */
export function sampleWirewatchAlarms() {
  return [
    "<info> probe-2 icmp ping timeout once id=ww-200",
    "<warn> router-7 link flapping on eth2 id=ww-201",
    "<crit> core-sw-1 BGP neighbor down id=ww-202",
  ];
}

/**
 * Ledgerflare (payments) — nested payload.
 */
export function sampleLedgerflareAlarms() {
  return [
    {
      origin: "ledgerflare",
      envelope: {
        id: "lf-900",
        level: "DEBUG",
        component: "settlement-worker",
        text: "periodic health ping",
      },
    },
    {
      origin: "ledgerflare",
      envelope: {
        id: "lf-901",
        level: "WARN",
        component: "card-auth",
        text: "elevated latency p99",
      },
    },
    {
      origin: "ledgerflare",
      envelope: {
        id: "lf-902",
        level: "ERROR",
        component: "settlement-worker",
        text: "settlement batch failed checksum mismatch",
      },
    },
  ];
}
