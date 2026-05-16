export type BillingCycle = "monthly" | "yearly" | "quarterly" | "weekly";

export type ToolCategory =
  | "AI Chat"
  | "AI Coding"
  | "Design"
  | "Video"
  | "Audio"
  | "Writing"
  | "Storage"
  | "Email"
  | "Hosting"
  | "Marketplace"
  | "Analytics"
  | "Productivity"
  | "Other";

export type UsageFrequency = "daily" | "weekly" | "monthly" | "rarely";
export type BusinessValue = "essential" | "useful" | "optional";
export type CancellationRisk = "low" | "medium" | "high";
export type ToolStatus = "active" | "review" | "canceled";
export type RecommendationLabel = "Keep" | "Review" | "Downgrade" | "Cancel Candidate";
export type EvaluationReasonCode =
  | "alreadyCanceled"
  | "lowUsageLowValueHighCost"
  | "dailyEssential"
  | "mediumValueOverlap"
  | "noUrgentIssue"
  | "overlap"
  | "soonRenewal"
  | "lowUsage"
  | "highCancellationRisk"
  | "defaultReview";

export type SubscriptionTool = {
  id: string;
  name: string;
  category: ToolCategory;
  price: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  usageFrequency: UsageFrequency;
  businessValue: BusinessValue;
  cancellationRisk: CancellationRisk;
  paymentMethod: string;
  notes: string;
  status: ToolStatus;
};

export type ToolPreset = {
  name: string;
  category: ToolCategory;
  price: number;
  billingCycle: BillingCycle;
};

export type ToolEvaluation = {
  tool: SubscriptionTool;
  monthlyCost: number;
  annualCost: number;
  recommendation: RecommendationLabel;
  reasonCodes: EvaluationReasonCode[];
  reasons: string[];
  savingsIfCanceled: number;
  renewalInDays: number | null;
};

export type StackSummary = {
  activeCount: number;
  monthlyBurn: number;
  annualBurn: number;
  savingsPotential: number;
  upcomingRenewalCost30d: number;
  cancelCandidateCount: number;
  reviewCount: number;
  duplicateCategories: Array<{ category: ToolCategory; count: number }>;
};
