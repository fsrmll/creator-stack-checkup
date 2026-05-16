import type { ToolCategory, ToolPreset } from "./types";

export const categories: ToolCategory[] = [
  "AI Chat",
  "AI Coding",
  "Design",
  "Video",
  "Audio",
  "Writing",
  "Storage",
  "Email",
  "Hosting",
  "Marketplace",
  "Analytics",
  "Productivity",
  "Other",
];

export const toolPresets: ToolPreset[] = [
  { name: "ChatGPT Plus", category: "AI Chat", price: 20, billingCycle: "monthly" },
  { name: "Claude Pro", category: "AI Chat", price: 20, billingCycle: "monthly" },
  { name: "Gemini Advanced", category: "AI Chat", price: 20, billingCycle: "monthly" },
  { name: "Cursor Pro", category: "AI Coding", price: 20, billingCycle: "monthly" },
  { name: "GitHub Copilot", category: "AI Coding", price: 10, billingCycle: "monthly" },
  { name: "Windsurf Pro", category: "AI Coding", price: 15, billingCycle: "monthly" },
  { name: "Canva Pro", category: "Design", price: 15, billingCycle: "monthly" },
  { name: "Adobe Express", category: "Design", price: 10, billingCycle: "monthly" },
  { name: "Midjourney", category: "Design", price: 10, billingCycle: "monthly" },
  { name: "Runway", category: "Video", price: 15, billingCycle: "monthly" },
  { name: "Descript", category: "Audio", price: 12, billingCycle: "monthly" },
  { name: "Notion Plus", category: "Productivity", price: 10, billingCycle: "monthly" },
  { name: "Airtable", category: "Productivity", price: 20, billingCycle: "monthly" },
  { name: "ConvertKit", category: "Email", price: 15, billingCycle: "monthly" },
  { name: "Beehiiv", category: "Email", price: 39, billingCycle: "monthly" },
  { name: "Webflow", category: "Hosting", price: 18, billingCycle: "monthly" },
  { name: "Vercel Pro", category: "Hosting", price: 20, billingCycle: "monthly" },
  { name: "Gumroad", category: "Marketplace", price: 0, billingCycle: "monthly" },
  { name: "Fathom Analytics", category: "Analytics", price: 15, billingCycle: "monthly" },
];

