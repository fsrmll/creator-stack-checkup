import { reminderDescription, reminderTitle, type Language } from "./i18n";
import type { SubscriptionTool } from "./types";

function dateToCalendarValue(dateValue: string): string {
  return dateValue.replaceAll("-", "");
}

function addDaysToDateValue(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function calendarEndDate(dateValue: string): string {
  return dateToCalendarValue(addDaysToDateValue(dateValue, 1));
}

function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");
}

export function getReminderTitle(tool: SubscriptionTool, language: Language = "en"): string {
  return reminderTitle(tool, language);
}

export function getReminderDescription(tool: SubscriptionTool, language: Language = "en"): string {
  return reminderDescription(tool, language);
}

export function buildIcsContent(tool: SubscriptionTool, language: Language = "en"): string {
  const date = dateToCalendarValue(tool.renewalDate);
  const endDate = calendarEndDate(tool.renewalDate);
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const title = escapeIcsText(getReminderTitle(tool, language));
  const description = escapeIcsText(getReminderDescription(tool, language));

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Creator Stack Checkup//Local Reminder//EN",
    "BEGIN:VEVENT",
    `UID:${tool.id}@creator-stack-checkup`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function buildGoogleCalendarUrl(tool: SubscriptionTool, language: Language = "en"): string {
  const date = dateToCalendarValue(tool.renewalDate);
  const endDate = calendarEndDate(tool.renewalDate);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: getReminderTitle(tool, language),
    details: getReminderDescription(tool, language),
    dates: `${date}/${endDate}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarUrl(tool: SubscriptionTool, language: Language = "en"): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: getReminderTitle(tool, language),
    body: getReminderDescription(tool, language),
    startdt: tool.renewalDate,
    enddt: addDaysToDateValue(tool.renewalDate, 1),
    allday: "true",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function buildMailtoUrl(tool: SubscriptionTool, language: Language = "en"): string {
  const params = new URLSearchParams({
    subject: getReminderTitle(tool, language),
    body: getReminderDescription(tool, language),
  });
  return `mailto:?${params.toString()}`;
}

export function buildSmsUrl(tool: SubscriptionTool, language: Language = "en"): string {
  const body =
    language === "zh"
      ? `${getReminderTitle(tool, language)}：${tool.renewalDate}。打开 Creator Stack Checkup，决定保留、降级还是取消。`
      : `${getReminderTitle(tool, language)}: ${tool.renewalDate}. Open Creator Stack Checkup and decide whether to keep, downgrade, or cancel it.`;
  return `sms:?&body=${encodeURIComponent(body)}`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
