import { parseToolsJson } from "./exporters";
import type { SubscriptionTool } from "./types";

const STORAGE_KEY = "creator-stack-checkup.tools.v1";

export function loadTools(): SubscriptionTool[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? parseToolsJson(raw) : [];
  } catch {
    return [];
  }
}

export function saveTools(tools: SubscriptionTool[]): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(tools));
  } catch {
    // localStorage can be unavailable in private or hardened browser contexts.
  }
}

export function clearTools(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures; app state still works for the current session.
  }
}
