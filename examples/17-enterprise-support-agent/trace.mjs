export function createEventTrace() {
  const events = [];
  return {
    events,
    onEvent(event) {
      events.push(event);
      const bits = [event.type];
      if (event.step !== undefined) bits.push(`step=${event.step}`);
      if (event.toolName) bits.push(`tool=${event.toolName}`);
      if (event.status) bits.push(`status=${event.status}`);
      console.log(`[trace] ${bits.join(" ")}`);
    },
  };
}

export const DEMO_CONTEXT = {
  tenantId: "acme",
  userId: "user-123",
  requestId: "req-456",
  roles: ["support"],
};
