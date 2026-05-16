import type { SubscriptionTool } from "./types";

const STORAGE_KEY = "creator-stack-checkup.tools.v1";

export function loadTools(): SubscriptionTool[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTools(tools: SubscriptionTool[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
}

export function clearTools(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

