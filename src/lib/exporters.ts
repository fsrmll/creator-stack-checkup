import { createId } from "./ids";
import { categories } from "./presets";
import type {
  BillingCycle,
  BusinessValue,
  CancellationRisk,
  SubscriptionTool,
  ToolStatus,
  UsageFrequency,
} from "./types";

const billingCycles: BillingCycle[] = ["monthly", "yearly", "quarterly", "weekly"];
const usageFrequencies: UsageFrequency[] = ["daily", "weekly", "monthly", "rarely"];
const businessValues: BusinessValue[] = ["essential", "useful", "optional"];
const cancellationRisks: CancellationRisk[] = ["low", "medium", "high"];
const statuses: ToolStatus[] = ["active", "review", "canceled"];

function quoteCsv(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function toolsToCsv(tools: SubscriptionTool[]): string {
  const headers = [
    "name",
    "category",
    "price",
    "billingCycle",
    "renewalDate",
    "usageFrequency",
    "businessValue",
    "cancellationRisk",
    "paymentMethod",
    "status",
    "notes",
  ];
  const rows = tools.map((tool) => headers.map((key) => quoteCsv(tool[key as keyof SubscriptionTool])).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function toolsToJson(tools: SubscriptionTool[]): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), tools }, null, 2);
}

export function parseToolsJson(input: string): SubscriptionTool[] {
  const parsed = JSON.parse(input);
  const rawTools = Array.isArray(parsed) ? parsed : parsed.tools;
  if (Array.isArray(rawTools)) return rawTools.map(normalizeImportedTool);
  throw new Error("No tools array found in JSON.");
}

function normalizeImportedTool(value: unknown): SubscriptionTool {
  if (!value || typeof value !== "object") {
    throw new Error("Every imported tool must be an object.");
  }

  const raw = value as Partial<Record<keyof SubscriptionTool, unknown>>;
  const name = stringValue(raw.name).trim();
  if (!name) throw new Error("Every imported tool needs a name.");

  return {
    id: stringValue(raw.id) || createId("imported"),
    name,
    category: pick(raw.category, categories, "Other"),
    price: Math.max(0, numberValue(raw.price)),
    billingCycle: normalizeBillingCycle(raw.billingCycle),
    renewalDate: validDateValue(raw.renewalDate) ? stringValue(raw.renewalDate) : "",
    usageFrequency: pick(raw.usageFrequency, usageFrequencies, "weekly"),
    businessValue: pick(raw.businessValue, businessValues, "useful"),
    cancellationRisk: pick(raw.cancellationRisk, cancellationRisks, "medium"),
    paymentMethod: stringValue(raw.paymentMethod),
    notes: stringValue(raw.notes),
    status: pick(raw.status, statuses, "active"),
  };
}

function normalizeBillingCycle(value: unknown): BillingCycle {
  if (typeof value !== "string") return "monthly";
  const normalized = value.trim().toLowerCase();
  if (normalized === "annual" || normalized === "annually" || normalized === "year" || normalized === "yearly") return "yearly";
  if (normalized === "quarter" || normalized === "quarterly") return "quarterly";
  if (normalized === "week" || normalized === "weekly") return "weekly";
  if (normalized === "month" || normalized === "monthly") return "monthly";
  return pick(value, billingCycles, "monthly");
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function validDateValue(value: unknown): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}
