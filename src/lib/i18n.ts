import type {
  BillingCycle,
  BusinessValue,
  CancellationRisk,
  RecommendationLabel,
  SubscriptionTool,
  ToolCategory,
  ToolEvaluation,
  UsageFrequency,
} from "./types";

export type Language = "en" | "zh";

export const LANGUAGE_STORAGE_KEY = "creator-stack-checkup.language.v1";

export const languageNames: Record<Language, string> = {
  en: "English",
  zh: "中文",
};

export const ui = {
  en: {
    appTitle: "Creator Stack Checkup",
    eyebrow: "Local-first creator finance tool",
    lede: "Audit your AI tools and creator subscriptions before they quietly drain your budget.",
    privacy: "No login. No backend. Your data stays in this browser.",
    languageToggle: "中文",
    mobileSummary: "Mobile stack summary",
    step: "Step",
    addTitle: "Add a subscription",
    editTitle: "Edit tool",
    loadSample: "Load sample",
    preset: "Tool preset",
    presetPlaceholder: "Choose a common creator tool",
    toolName: "Tool name",
    toolNamePlaceholder: "ChatGPT Plus",
    price: "Price",
    billing: "Billing",
    category: "Category",
    nextRenewal: "Next renewal",
    usage: "Usage",
    businessValue: "Business value",
    cancelRisk: "Cancel risk",
    paymentMethod: "Payment method",
    paymentPlaceholder: "Visa, PayPal, Wise",
    notes: "Notes",
    notesPlaceholder: "What would break if you canceled this?",
    addTool: "Add tool",
    saveChanges: "Save changes",
    cancelEdit: "Cancel edit",
    monthlyBurn: "Monthly burn",
    dashboardTitle: "Dashboard",
    monthlyShort: "Monthly",
    annualized: "Annualized",
    canSave: "Can save",
    renewals30: "30-day renewals",
    renewalsShort: "Renewals",
    suggestionsTitle: "Smart suggestions",
    items: "items",
    active: "active",
    overlapNotice: (count: number, category: string) =>
      `${count} active tools in ${category}. Review overlap before the next renewal.`,
    emptySuggestions: "Add a few tools to see overlap, renewal warnings, and cancel candidates.",
    toolListTitle: "Tool list",
    emptyTools: "Start with your paid AI, design, hosting, and creator tools.",
    noRenewalDate: "No renewal date",
    noWorkflowNote: "No workflow note yet.",
    canceled: "Canceled",
    edit: "Edit",
    markCanceled: "Mark canceled",
    restore: "Restore",
    delete: "Delete",
    reminderTitle: "Reminder center",
    localNotify: "Local notify",
    reminderHelp: "These reminders do not use a backend. Calendar, mail, and SMS links open your own apps.",
    noReminderTools: "Add renewal dates to generate calendar, email, and SMS reminders.",
    renewsToday: "Renews today",
    renewsIn: (days: number) => `Renews in ${days} day(s)`,
    notificationUnsupported: "This browser does not support local notifications.",
    notificationDenied: "Notifications were not enabled.",
    notificationNoSoon: "No renewals in the next 7 days.",
    notificationNoSoonBody: "No renewals in the next 7 days. Calendar reminders are still the safest option.",
    notificationSent: (name: string) => `Sent a local notification for ${name}.`,
    notificationBody: (name: string, days: number) =>
      `${name} renews in ${days} day(s). Decide whether to keep, downgrade, or cancel.`,
    backupTitle: "Import / Export",
    backupHelp: "Back up your stack or move it between browsers. Nothing is uploaded to a server.",
    exportJson: "Export JSON",
    exportCsv: "Export CSV",
    importJson: "Import JSON",
    imported: (count: number) => `Imported ${count} tools.`,
    importFailed: "Import failed.",
    navAdd: "Add",
    navCosts: "Costs",
    navTools: "Tools",
    navRemind: "Remind",
    navBackup: "Backup",
    downloadIcs: (name: string) => `Download ICS reminder for ${name}`,
    googleCalendar: (name: string) => `Add ${name} to Google Calendar`,
    outlookCalendar: (name: string) => `Add ${name} to Outlook Calendar`,
    emailYourself: (name: string) => `Email yourself about ${name}`,
    textYourself: (name: string) => `Text yourself about ${name}`,
  },
  zh: {
    appTitle: "创作者订阅体检",
    eyebrow: "本地优先的创作者成本工具",
    lede: "记录你的 AI 工具和创作者订阅，及时发现悄悄流失的预算。",
    privacy: "无需登录，无后端服务，数据只保存在当前浏览器。",
    languageToggle: "English",
    mobileSummary: "手机费用概览",
    step: "步骤",
    addTitle: "添加订阅",
    editTitle: "编辑订阅",
    loadSample: "载入示例",
    preset: "常见工具",
    presetPlaceholder: "选择一个常见创作者工具",
    toolName: "工具名称",
    toolNamePlaceholder: "例如 ChatGPT Plus",
    price: "价格",
    billing: "计费周期",
    category: "分类",
    nextRenewal: "下次续费",
    usage: "使用频率",
    businessValue: "业务价值",
    cancelRisk: "取消风险",
    paymentMethod: "付款方式",
    paymentPlaceholder: "Visa、PayPal、Wise",
    notes: "备注",
    notesPlaceholder: "如果取消它，哪些工作会受影响？",
    addTool: "添加工具",
    saveChanges: "保存修改",
    cancelEdit: "取消编辑",
    monthlyBurn: "每月支出",
    dashboardTitle: "费用概览",
    monthlyShort: "每月",
    annualized: "年化成本",
    canSave: "可节省",
    renewals30: "30 天续费",
    renewalsShort: "续费",
    suggestionsTitle: "智能建议",
    items: "项",
    active: "个启用",
    overlapNotice: (count: number, category: string) => `${category} 有 ${count} 个启用工具，下次续费前建议检查是否重复。`,
    emptySuggestions: "添加几个工具后，这里会显示重复订阅、续费提醒和可取消候选项。",
    toolListTitle: "工具列表",
    emptyTools: "先添加你付费使用的 AI、设计、主机和创作者工具。",
    noRenewalDate: "无续费日期",
    noWorkflowNote: "暂未填写工作流备注。",
    canceled: "已取消",
    edit: "编辑",
    markCanceled: "标记取消",
    restore: "恢复",
    delete: "删除",
    reminderTitle: "提醒中心",
    localNotify: "本地通知",
    reminderHelp: "这些提醒不依赖后端。日历、邮件和短信链接都会打开你自己的应用。",
    noReminderTools: "添加续费日期后，这里会生成日历、邮件和短信提醒入口。",
    renewsToday: "今天续费",
    renewsIn: (days: number) => `${days} 天后续费`,
    notificationUnsupported: "当前浏览器不支持本地通知。",
    notificationDenied: "通知权限未开启。",
    notificationNoSoon: "未来 7 天没有续费。",
    notificationNoSoonBody: "未来 7 天没有续费。长期提醒仍建议使用日历。",
    notificationSent: (name: string) => `已发送 ${name} 的本地通知。`,
    notificationBody: (name: string, days: number) => `${name} 将在 ${days} 天后续费，请决定保留、降级还是取消。`,
    backupTitle: "导入 / 导出",
    backupHelp: "备份你的订阅数据，或迁移到另一个浏览器。数据不会上传到服务器。",
    exportJson: "导出 JSON",
    exportCsv: "导出 CSV",
    importJson: "导入 JSON",
    imported: (count: number) => `已导入 ${count} 个工具。`,
    importFailed: "导入失败。",
    navAdd: "添加",
    navCosts: "费用",
    navTools: "工具",
    navRemind: "提醒",
    navBackup: "备份",
    downloadIcs: (name: string) => `下载 ${name} 的 ICS 提醒`,
    googleCalendar: (name: string) => `把 ${name} 添加到 Google 日历`,
    outlookCalendar: (name: string) => `把 ${name} 添加到 Outlook 日历`,
    emailYourself: (name: string) => `给自己发送 ${name} 的提醒邮件`,
    textYourself: (name: string) => `给自己发送 ${name} 的提醒短信`,
  },
} as const;

const billingCycleLabels: Record<Language, Record<BillingCycle, string>> = {
  en: {
    monthly: "Monthly",
    yearly: "Yearly",
    quarterly: "Quarterly",
    weekly: "Weekly",
  },
  zh: {
    monthly: "月付",
    yearly: "年付",
    quarterly: "季付",
    weekly: "周付",
  },
};

const usageLabels: Record<Language, Record<UsageFrequency, string>> = {
  en: {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    rarely: "Rarely",
  },
  zh: {
    daily: "每天",
    weekly: "每周",
    monthly: "每月",
    rarely: "很少",
  },
};

const businessValueLabels: Record<Language, Record<BusinessValue, string>> = {
  en: {
    essential: "Essential",
    useful: "Useful",
    optional: "Optional",
  },
  zh: {
    essential: "必需",
    useful: "有用",
    optional: "可选",
  },
};

const cancellationRiskLabels: Record<Language, Record<CancellationRisk, string>> = {
  en: {
    low: "Low",
    medium: "Medium",
    high: "High",
  },
  zh: {
    low: "低",
    medium: "中",
    high: "高",
  },
};

const recommendationLabels: Record<Language, Record<RecommendationLabel, string>> = {
  en: {
    Keep: "Keep",
    Review: "Review",
    Downgrade: "Downgrade",
    "Cancel Candidate": "Cancel Candidate",
  },
  zh: {
    Keep: "保留",
    Review: "复盘",
    Downgrade: "降级",
    "Cancel Candidate": "可取消",
  },
};

const categoryLabels: Record<Language, Record<ToolCategory, string>> = {
  en: {
    "AI Chat": "AI Chat",
    "AI Coding": "AI Coding",
    Design: "Design",
    Video: "Video",
    Audio: "Audio",
    Writing: "Writing",
    Storage: "Storage",
    Email: "Email",
    Hosting: "Hosting",
    Marketplace: "Marketplace",
    Analytics: "Analytics",
    Productivity: "Productivity",
    Other: "Other",
  },
  zh: {
    "AI Chat": "AI 对话",
    "AI Coding": "AI 编程",
    Design: "设计",
    Video: "视频",
    Audio: "音频",
    Writing: "写作",
    Storage: "存储",
    Email: "邮件",
    Hosting: "托管",
    Marketplace: "交易平台",
    Analytics: "数据分析",
    Productivity: "效率工具",
    Other: "其他",
  },
};

export function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "zh";
}

export function getInitialLanguage(): Language {
  try {
    const saved = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage may be disabled; fall back to browser language.
  }
  return globalThis.navigator?.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function saveLanguagePreference(language: Language): void {
  try {
    globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Language still works for the current session when persistence is unavailable.
  }
}

export function getCurrencyFormatter(language: Language, maximumFractionDigits: number) {
  return new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  });
}

export function formatBillingCycle(value: BillingCycle, language: Language): string {
  return billingCycleLabels[language][value];
}

export function formatUsageFrequency(value: UsageFrequency, language: Language): string {
  return usageLabels[language][value];
}

export function formatBusinessValue(value: BusinessValue, language: Language): string {
  return businessValueLabels[language][value];
}

export function formatCancellationRisk(value: CancellationRisk, language: Language): string {
  return cancellationRiskLabels[language][value];
}

export function formatRecommendation(value: RecommendationLabel, language: Language): string {
  return recommendationLabels[language][value];
}

export function formatCategory(value: ToolCategory, language: Language): string {
  return categoryLabels[language][value];
}

export function formatMonthlySuffix(language: Language): string {
  return language === "zh" ? "/月" : "/mo";
}

export function formatEvaluationReasons(item: ToolEvaluation, language: Language): string[] {
  if (language === "en") return item.reasons;

  return item.reasonCodes.map((code) => {
    switch (code) {
      case "alreadyCanceled":
        return "已标记为已取消。";
      case "lowUsageLowValueHighCost":
        return "使用频率低、业务价值低，而且月成本不低。";
      case "dailyEssential":
        return "每天使用，并且被标记为必需工具。";
      case "mediumValueOverlap":
        return "有用，但和同分类的其他工具存在重叠。";
      case "noUrgentIssue":
        return "暂时没有明显的成本、续费或重复风险。";
      case "overlap":
        return `${formatCategory(item.tool.category, language)}分类下有多个启用工具。`;
      case "soonRenewal":
        return item.renewalInDays === 0 ? "今天续费。" : `${item.renewalInDays} 天后续费。`;
      case "lowUsage":
        return "使用频率为每月或很少。";
      case "highCancellationRisk":
        return "取消风险较高，先确认是否会影响关键工作流。";
      case "defaultReview":
        return "建议在下次月度体检时复盘这个订阅。";
    }
  });
}

export function reminderTitle(tool: SubscriptionTool, language: Language): string {
  return language === "zh" ? `复盘 ${tool.name} 订阅` : `Review ${tool.name} subscription`;
}

export function reminderDescription(tool: SubscriptionTool, language: Language): string {
  if (language === "zh") {
    return [
      `检查是否要保留、降级或取消 ${tool.name}。`,
      `分类：${formatCategory(tool.category, language)}`,
      `价格：${tool.price}（${formatBillingCycle(tool.billingCycle, language)}）`,
      "由 Creator Stack Checkup 生成。这里没有创建账号，也没有服务器提醒。",
    ].join("\n");
  }

  return [
    `Check whether to keep, downgrade, or cancel ${tool.name}.`,
    `Category: ${formatCategory(tool.category, language)}`,
    `Price: ${tool.price} (${formatBillingCycle(tool.billingCycle, language)})`,
    "Generated by Creator Stack Checkup. No account or server reminder was created.",
  ].join("\n");
}
