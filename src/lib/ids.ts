export function createId(prefix = "tool"): string {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
}
