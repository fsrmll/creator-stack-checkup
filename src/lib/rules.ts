import type {
  BillingCycle,
  BusinessValue,
  EvaluationReasonCode,
  RecommendationLabel,
  StackSummary,
  SubscriptionTool,
  ToolCategory,
  ToolEvaluation,
  UsageFrequency,
} from "./types";

export function toMonthlyCost(price: number, billingCycle: BillingCycle): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  switch (billingCycle) {
    case "weekly":
      return price * 52 / 12;
    case "monthly":
      return price;
    case "quarterly":
      return price / 3;
    case "yearly":
      return price / 12;
  }
}

export function toAnnualCost(price: number, billingCycle: BillingCycle): number {
  return toMonthlyCost(price, billingCycle) * 12;
}

export function daysUntil(dateValue: string, today = new Date()): number | null {
  if (!dateValue) return null;
  const target = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date(today);
  start.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - start.getTime()) / 86_400_000);
}

function valueScore(value: BusinessValue): number {
  return value === "essential" ? 3 : value === "useful" ? 2 : 1;
}

function usageScore(usage: UsageFrequency): number {
  return usage === "daily" ? 4 : usage === "weekly" ? 3 : usage === "monthly" ? 2 : 1;
}

function hasCategoryOverlap(tool: SubscriptionTool, tools: SubscriptionTool[]): boolean {
  return tools.filter((item) => item.status !== "canceled" && item.category === tool.category).length > 1;
}

export function evaluateTool(
  tool: SubscriptionTool,
  tools: SubscriptionTool[],
  today = new Date(),
): ToolEvaluation {
  const monthlyCost = toMonthlyCost(tool.price, tool.billingCycle);
  const annualCost = monthlyCost * 12;
  const renewalInDays = daysUntil(tool.renewalDate, today);
  const overlap = hasCategoryOverlap(tool, tools);
  const lowUsage = usageScore(tool.usageFrequency) <= 2;
  const highCost = monthlyCost >= 15;
  const lowValue = valueScore(tool.businessValue) === 1;
  const mediumValue = valueScore(tool.businessValue) === 2;
  const soonRenewal = renewalInDays !== null && renewalInDays >= 0 && renewalInDays <= 30;
  const reasons: string[] = [];
  const reasonCodes: EvaluationReasonCode[] = [];
  let recommendation: RecommendationLabel = "Review";

  function addReason(code: EvaluationReasonCode, message: string) {
    reasonCodes.push(code);
    reasons.push(message);
  }

  if (tool.status === "canceled") {
    return {
      tool,
      monthlyCost: 0,
      annualCost: 0,
      recommendation: "Review",
      reasonCodes: ["alreadyCanceled"],
      reasons: ["Already marked as canceled."],
      savingsIfCanceled: 0,
      renewalInDays,
    };
  }

  if (lowUsage && highCost && lowValue) {
    recommendation = "Cancel Candidate";
    addReason("lowUsageLowValueHighCost", "Low usage, low business value, and meaningful monthly cost.");
  } else if (tool.usageFrequency === "daily" && tool.businessValue === "essential") {
    recommendation = "Keep";
    addReason("dailyEssential", "Used daily and marked essential.");
  } else if (mediumValue && overlap && tool.cancellationRisk !== "high") {
    recommendation = "Downgrade";
    addReason("mediumValueOverlap", "Useful but overlaps with another tool in the same category.");
  } else if (overlap || soonRenewal || lowUsage) {
    recommendation = "Review";
  } else {
    recommendation = "Keep";
    addReason("noUrgentIssue", "No urgent cost, renewal, or overlap issue detected.");
  }

  if (overlap) addReason("overlap", `Multiple active tools in ${tool.category}.`);
  if (soonRenewal) addReason("soonRenewal", `Renews in ${renewalInDays} day${renewalInDays === 1 ? "" : "s"}.`);
  if (lowUsage) addReason("lowUsage", "Usage is monthly or rarely.");
  if (tool.cancellationRisk === "high") addReason("highCancellationRisk", "High cancellation risk: check workflow impact first.");

  return {
    tool,
    monthlyCost,
    annualCost,
    recommendation,
    reasonCodes: reasonCodes.length ? reasonCodes : ["defaultReview"],
    reasons: reasons.length ? reasons : ["Review this subscription during your next monthly checkup."],
    savingsIfCanceled: recommendation === "Cancel Candidate" || recommendation === "Downgrade" ? monthlyCost : 0,
    renewalInDays,
  };
}

export function evaluateStack(tools: SubscriptionTool[], today = new Date()): ToolEvaluation[] {
  return tools.map((tool) => evaluateTool(tool, tools, today));
}

export function getDuplicateCategories(tools: SubscriptionTool[]): Array<{ category: ToolCategory; count: number }> {
  const counts = new Map<ToolCategory, number>();
  for (const tool of tools) {
    if (tool.status === "canceled") continue;
    counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([category, count]) => ({ category, count }));
}

export function summarizeStack(evaluations: ToolEvaluation[]): StackSummary {
  const activeEvaluations = evaluations.filter(({ tool }) => tool.status !== "canceled");
  const monthlyBurn = activeEvaluations.reduce((sum, item) => sum + item.monthlyCost, 0);
  const upcomingRenewalCost30d = activeEvaluations.reduce((sum, item) => {
    if (item.renewalInDays !== null && item.renewalInDays >= 0 && item.renewalInDays <= 30) {
      return sum + item.monthlyCost;
    }
    return sum;
  }, 0);

  return {
    activeCount: activeEvaluations.length,
    monthlyBurn,
    annualBurn: monthlyBurn * 12,
    savingsPotential: activeEvaluations.reduce((sum, item) => sum + item.savingsIfCanceled, 0),
    upcomingRenewalCost30d,
    cancelCandidateCount: activeEvaluations.filter((item) => item.recommendation === "Cancel Candidate").length,
    reviewCount: activeEvaluations.filter((item) => item.recommendation === "Review").length,
    duplicateCategories: getDuplicateCategories(activeEvaluations.map((item) => item.tool)),
  };
}
