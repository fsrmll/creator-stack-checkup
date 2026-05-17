import { describe, expect, it } from "vitest";
import type { SubscriptionTool } from "./types";
import { evaluateStack, renewalWindowCost, summarizeStack, toMonthlyCost } from "./rules";

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

  it("uses actual renewal charges for the 30-day cash window", () => {
    expect(renewalWindowCost(120, "yearly", 10)).toBe(120);
    expect(renewalWindowCost(30, "quarterly", 10)).toBe(30);
    expect(renewalWindowCost(10, "weekly", 10)).toBe(30);
    expect(renewalWindowCost(120, "yearly", 45)).toBe(0);
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
    expect(summary.upcomingRenewalCost30d).toBe(30);
    expect(summary.duplicateCategories).toEqual([{ category: "AI Chat", count: 2 }]);
  });

  it("summarizes upcoming annual renewals as cash due instead of monthly average", () => {
    const summary = summarizeStack(
      evaluateStack(
        [
          {
            ...baseTool,
            price: 120,
            billingCycle: "yearly",
            renewalDate: "2026-05-25",
          },
        ],
        new Date("2026-05-15T12:00:00"),
      ),
    );

    expect(summary.monthlyBurn).toBe(10);
    expect(summary.upcomingRenewalCost30d).toBe(120);
  });
});
