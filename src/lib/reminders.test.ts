import { describe, expect, it } from "vitest";
import type { SubscriptionTool } from "./types";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildMailtoUrl,
  buildOutlookCalendarUrl,
  buildSmsUrl,
} from "./reminders";

const tool: SubscriptionTool = {
  id: "abc",
  name: "Claude Pro",
  category: "AI Chat",
  price: 20,
  billingCycle: "monthly",
  renewalDate: "2026-05-28",
  usageFrequency: "weekly",
  businessValue: "useful",
  cancellationRisk: "medium",
  paymentMethod: "Wise",
  notes: "",
  status: "active",
};

describe("reminder links", () => {
  it("builds an importable all-day ICS reminder", () => {
    const ics = buildIcsContent(tool);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260528");
    expect(ics).toContain("DTEND;VALUE=DATE:20260529");
    expect(ics).toContain("SUMMARY:Review Claude Pro subscription");
  });

  it("builds calendar, mail, and sms URLs", () => {
    expect(buildGoogleCalendarUrl(tool)).toContain("calendar.google.com");
    expect(buildGoogleCalendarUrl(tool)).toContain("dates=20260528%2F20260529");
    expect(buildOutlookCalendarUrl(tool)).toContain("outlook.live.com");
    expect(buildMailtoUrl(tool)).toContain("mailto:?");
    expect(buildSmsUrl(tool)).toContain("sms:?");
  });

  it("builds Chinese reminder copy when requested", () => {
    expect(buildIcsContent(tool, "zh")).toContain("SUMMARY:复盘 Claude Pro 订阅");
    expect(decodeURIComponent(buildSmsUrl(tool, "zh"))).toContain("决定保留、降级还是取消");
  });
});
