import { describe, expect, it } from "vitest";
import type { SubscriptionTool } from "./types";
import { evaluateStack, summarizeStack, toMonthlyCost } from "./rules";

const baseTool: SubscriptionTool = {
  id: "tool-1",
  name: "Example",
  category: "AI Chat",
  price: 20,
  billingCycle: "monthly",
  renewalDate: "2026-06-01",
  usageFrequency: "rarely",
  businessValue: "optional",
  cancellationRisk: "low",
  paymentMethod: "Visa",
  notes: "",
  status: "active",
};

describe("cost conversion", () => {
  it("normalizes billing cycles to monthly cost", () => {
    expect(toMonthlyCost(120, "yearly")).toBe(10);
    expect(toMonthlyCost(30, "quarterly")).toBe(10);
    expect(toMonthlyCost(10, "weekly")).toBeCloseTo(43.33, 2);
  });
});

describe("recommendations", () => {
  it("marks low-usage high-cost optional tools as cancel candidates", () => {
    const [evaluation] = evaluateStack([baseTool], new Date("2026-05-15T12:00:00"));
    expect(evaluation.recommendation).toBe("Cancel Candidate");
    expect(evaluation.savingsIfCanceled).toBe(20);
  });

  it("detects duplicate categories and summarizes stack costs", () => {
    const tools: SubscriptionTool[] = [
      baseTool,
      {
        ...baseTool,
        id: "tool-2",
        name: "Another AI Chat",
        price: 10,
        usageFrequency: "daily",
        businessValue: "essential",
      },
    ];
    const summary = summarizeStack(evaluateStack(tools, new Date("2026-05-15T12:00:00")));
    expect(summary.monthlyBurn).toBe(30);
    expect(summary.annualBurn).toBe(360);
    expect(summary.duplicateCategories).toEqual([{ category: "AI Chat", count: 2 }]);
  });
});

