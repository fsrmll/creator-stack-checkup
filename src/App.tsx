import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Download,
  FileDown,
  Mail,
  MessageSquare,
  Plus,
  RefreshCcw,
  Save,
  Languages,
  Trash2,
  Upload,
  WalletCards,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toolsToCsv, toolsToJson, parseToolsJson } from "./lib/exporters";
import {
  formatBillingCycle,
  formatBusinessValue,
  formatCancellationRisk,
  formatCategory,
  formatEvaluationReasons,
  formatMonthlySuffix,
  formatRecommendation,
  formatUsageFrequency,
  getCurrencyFormatter,
  getInitialLanguage,
  languageNames,
  saveLanguagePreference,
  ui,
  type Language,
} from "./lib/i18n";
import { createId } from "./lib/ids";
import { categories, toolPresets } from "./lib/presets";
import { evaluateStack, summarizeStack } from "./lib/rules";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildMailtoUrl,
  buildOutlookCalendarUrl,
  buildSmsUrl,
  downloadTextFile,
  reminderFilename,
} from "./lib/reminders";
import { loadTools, saveTools } from "./lib/storage";
import type {
  BillingCycle,
  BusinessValue,
  CancellationRisk,
  SubscriptionTool,
  ToolCategory,
  ToolStatus,
  UsageFrequency,
} from "./lib/types";

type ToolForm = Omit<SubscriptionTool, "id">;

function futureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createEmptyForm(): ToolForm {
  return {
    name: "",
    category: "AI Chat",
    price: 20,
    billingCycle: "monthly",
    renewalDate: futureDate(14),
    usageFrequency: "weekly",
    businessValue: "useful",
    cancellationRisk: "medium",
    paymentMethod: "",
    notes: "",
    status: "active",
  };
}

function createSampleStack(): SubscriptionTool[] {
  return [
    {
      ...createEmptyForm(),
      id: createId(),
      name: "ChatGPT Plus",
      category: "AI Chat",
      price: 20,
      usageFrequency: "daily",
      businessValue: "essential",
      renewalDate: futureDate(8),
    },
    {
      ...createEmptyForm(),
      id: createId(),
      name: "Claude Pro",
      category: "AI Chat",
      price: 20,
      usageFrequency: "weekly",
      businessValue: "useful",
      renewalDate: futureDate(18),
    },
    {
      ...createEmptyForm(),
      id: createId(),
      name: "Midjourney",
      category: "Design",
      price: 10,
      usageFrequency: "rarely",
      businessValue: "optional",
      cancellationRisk: "low",
      renewalDate: futureDate(4),
    },
    {
      ...createEmptyForm(),
      id: createId(),
      name: "Cursor Pro",
      category: "AI Coding",
      price: 20,
      usageFrequency: "daily",
      businessValue: "essential",
      renewalDate: futureDate(25),
    },
  ];
}

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function recommendationClass(label: string): string {
  return label.toLowerCase().replaceAll(" ", "-");
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const [tools, setTools] = useState<SubscriptionTool[]>(() => loadTools());
  const [form, setForm] = useState<ToolForm>(() => createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const t = ui[language];

  const evaluations = useMemo(() => evaluateStack(tools), [tools]);
  const summary = useMemo(() => summarizeStack(evaluations), [evaluations]);
  const currencyFormatter = useMemo(() => getCurrencyFormatter(language, 0), [language]);
  const exactCurrencyFormatter = useMemo(() => getCurrencyFormatter(language, 2), [language]);
  const monthlySuffix = formatMonthlySuffix(language);
  const upcoming = evaluations
    .filter((item) => item.tool.status !== "canceled" && item.renewalInDays !== null && item.renewalInDays >= 0)
    .sort((a, b) => (a.renewalInDays ?? 999) - (b.renewalInDays ?? 999))
    .slice(0, 6);
  const suggestions = evaluations.filter(
    (item) => item.tool.status !== "canceled" && (item.recommendation !== "Keep" || item.reasonCodes.includes("soonRenewal")),
  );

  useEffect(() => {
    saveLanguagePreference(language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = language === "zh" ? `${t.appTitle} | Creator Stack Checkup` : t.appTitle;
  }, [language, t.appTitle]);

  useEffect(() => {
    saveTools(tools);
  }, [tools]);

  function updateForm<K extends keyof ToolForm>(key: K, value: ToolForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(name: string) {
    const preset = toolPresets.find((item) => item.name === name);
    if (!preset) return;
    setForm((current) => ({
      ...current,
      name: preset.name,
      category: preset.category,
      price: preset.price,
      billingCycle: preset.billingCycle,
    }));
  }

  function resetForm() {
    setForm(createEmptyForm());
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      setTools((current) =>
        current.map((tool) =>
          tool.id === editingId
            ? {
                ...form,
                id: editingId,
                name: form.name.trim(),
                price: Math.max(0, form.price),
              }
            : tool,
        ),
      );
      resetForm();
      return;
    }

    setTools((current) => [
      {
        ...form,
        id: createId(),
        name: form.name.trim(),
        price: Math.max(0, form.price),
      },
      ...current,
    ]);
    resetForm();
  }

  function editTool(tool: SubscriptionTool) {
    const { id: _id, ...nextForm } = tool;
    setForm(nextForm);
    setEditingId(tool.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setToolStatus(toolId: string, status: ToolStatus) {
    setTools((current) => current.map((tool) => (tool.id === toolId ? { ...tool, status } : tool)));
  }

  function deleteTool(toolId: string) {
    setTools((current) => current.filter((tool) => tool.id !== toolId));
  }

  function downloadIcs(tool: SubscriptionTool) {
    downloadTextFile(
      reminderFilename(tool.name),
      buildIcsContent(tool, language),
      "text/calendar;charset=utf-8",
    );
  }

  function exportJson() {
    downloadTextFile("creator-stack-checkup-backup.json", toolsToJson(tools), "application/json;charset=utf-8");
  }

  function exportCsv() {
    downloadTextFile("creator-stack-checkup-tools.csv", toolsToCsv(tools), "text/csv;charset=utf-8");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseToolsJson(text);
      setTools(imported);
      setImportMessage(t.imported(imported.length));
    } catch (error) {
      setImportMessage(language === "en" && error instanceof Error ? error.message : t.importFailed);
    } finally {
      event.target.value = "";
    }
  }

  async function notifyUpcoming() {
    if (!("Notification" in window)) {
      setNotificationMessage(t.notificationUnsupported);
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNotificationMessage(t.notificationDenied);
      return;
    }
    const dueSoon = upcoming.find((item) => item.renewalInDays !== null && item.renewalInDays <= 7);
    if (!dueSoon) {
      new Notification("Creator Stack Checkup", {
        body: t.notificationNoSoonBody,
      });
      setNotificationMessage(t.notificationNoSoon);
      return;
    }
    new Notification(language === "zh" ? `复盘 ${dueSoon.tool.name}` : `Review ${dueSoon.tool.name}`, {
      body: t.notificationBody(dueSoon.tool.name, dueSoon.renewalInDays ?? 0),
    });
    setNotificationMessage(t.notificationSent(dueSoon.tool.name));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.appTitle}</h1>
          <p className="lede">{t.lede}</p>
        </div>
        <div className="header-actions">
          <button
            className="language-button"
            type="button"
            onClick={() => setLanguage((current) => (current === "zh" ? "en" : "zh"))}
            aria-label={`Switch language to ${language === "zh" ? languageNames.en : languageNames.zh}`}
          >
            <Languages size={16} />
            {t.languageToggle}
          </button>
          <div className="privacy-pill">
            <CheckCircle2 size={18} />
            {t.privacy}
          </div>
        </div>
      </header>

      <div className="mobile-summary" aria-label={t.mobileSummary}>
        <div>
          <span>{t.monthlyShort}</span>
          <strong>{currencyFormatter.format(summary.monthlyBurn)}</strong>
        </div>
        <div>
          <span>{t.canSave}</span>
          <strong>{currencyFormatter.format(summary.savingsPotential)}</strong>
        </div>
        <div>
          <span>{t.renewalsShort}</span>
          <strong>{currencyFormatter.format(summary.upcomingRenewalCost30d)}</strong>
        </div>
      </div>

      <main className="layout-grid">
        <section id="add-tool" className="panel add-panel" aria-labelledby="add-tool-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.step} 1</p>
              <h2 id="add-tool-title">{editingId ? t.editTitle : t.addTitle}</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => setTools(createSampleStack())}>
              <RefreshCcw size={16} /> {t.loadSample}
            </button>
          </div>

          <form className="tool-form" onSubmit={handleSubmit}>
            <label>
              {t.preset}
              <select value="" onChange={(event) => applyPreset(event.target.value)}>
                <option value="">{t.presetPlaceholder}</option>
                {toolPresets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.toolName}
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder={t.toolNamePlaceholder}
                required
              />
            </label>

            <div className="form-row">
              <label>
                {t.price}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateForm("price", numberValue(event.target.value))}
                />
              </label>
              <label>
                {t.billing}
                <select
                  value={form.billingCycle}
                  onChange={(event) => updateForm("billingCycle", event.target.value as BillingCycle)}
                >
                  <option value="monthly">{formatBillingCycle("monthly", language)}</option>
                  <option value="yearly">{formatBillingCycle("yearly", language)}</option>
                  <option value="quarterly">{formatBillingCycle("quarterly", language)}</option>
                  <option value="weekly">{formatBillingCycle("weekly", language)}</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                {t.category}
                <select
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value as ToolCategory)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category, language)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t.nextRenewal}
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(event) => updateForm("renewalDate", event.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                {t.usage}
                <select
                  value={form.usageFrequency}
                  onChange={(event) => updateForm("usageFrequency", event.target.value as UsageFrequency)}
                >
                  <option value="daily">{formatUsageFrequency("daily", language)}</option>
                  <option value="weekly">{formatUsageFrequency("weekly", language)}</option>
                  <option value="monthly">{formatUsageFrequency("monthly", language)}</option>
                  <option value="rarely">{formatUsageFrequency("rarely", language)}</option>
                </select>
              </label>
              <label>
                {t.businessValue}
                <select
                  value={form.businessValue}
                  onChange={(event) => updateForm("businessValue", event.target.value as BusinessValue)}
                >
                  <option value="essential">{formatBusinessValue("essential", language)}</option>
                  <option value="useful">{formatBusinessValue("useful", language)}</option>
                  <option value="optional">{formatBusinessValue("optional", language)}</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                {t.cancelRisk}
                <select
                  value={form.cancellationRisk}
                  onChange={(event) => updateForm("cancellationRisk", event.target.value as CancellationRisk)}
                >
                  <option value="low">{formatCancellationRisk("low", language)}</option>
                  <option value="medium">{formatCancellationRisk("medium", language)}</option>
                  <option value="high">{formatCancellationRisk("high", language)}</option>
                </select>
              </label>
              <label>
                {t.paymentMethod}
                <input
                  value={form.paymentMethod}
                  onChange={(event) => updateForm("paymentMethod", event.target.value)}
                  placeholder={t.paymentPlaceholder}
                />
              </label>
            </div>

            <label>
              {t.notes}
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder={t.notesPlaceholder}
              />
            </label>

            <div className="button-row">
              <button className="primary-button" type="submit">
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? t.saveChanges : t.addTool}
              </button>
              {editingId && (
                <button className="secondary-button" type="button" onClick={resetForm}>
                  {t.cancelEdit}
                </button>
              )}
            </div>
          </form>
        </section>

        <section id="dashboard" className="dashboard-stack" aria-label={t.dashboardTitle}>
          <div className="metric-grid">
            <MetricCard label={t.monthlyBurn} value={currencyFormatter.format(summary.monthlyBurn)} icon={<WalletCards />} />
            <MetricCard label={t.annualized} value={currencyFormatter.format(summary.annualBurn)} icon={<CalendarDays />} />
            <MetricCard label={t.canSave} value={currencyFormatter.format(summary.savingsPotential)} icon={<AlertTriangle />} />
            <MetricCard label={t.renewals30} value={currencyFormatter.format(summary.upcomingRenewalCost30d)} icon={<Bell />} />
          </div>

          <section id="suggestions" className="panel suggestions-panel" aria-labelledby="suggestions-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.step} 2</p>
                <h2 id="suggestions-title">{t.suggestionsTitle}</h2>
              </div>
              <span className="count-pill">
                {suggestions.length} {t.items}
              </span>
            </div>
            {tools.length === 0 ? (
              <EmptyState message={t.emptySuggestions} />
            ) : (
              <div className="suggestion-list">
                {summary.duplicateCategories.map((item) => (
                  <div className="notice-card" key={item.category}>
                    <AlertTriangle size={18} />
                    <span>{t.overlapNotice(item.count, formatCategory(item.category, language))}</span>
                  </div>
                ))}
                {suggestions.map((item) => (
                  <article className="suggestion-item" key={item.tool.id}>
                    <div>
                      <span className={`status-chip ${recommendationClass(item.recommendation)}`}>
                        {formatRecommendation(item.recommendation, language)}
                      </span>
                      <h3>{item.tool.name}</h3>
                      <p>{formatEvaluationReasons(item, language).join(" ")}</p>
                    </div>
                    <strong>
                      {exactCurrencyFormatter.format(item.monthlyCost)}
                      {monthlySuffix}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>

      <section id="tools" className="panel full-width" aria-labelledby="tools-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.step} 3</p>
            <h2 id="tools-title">{t.toolListTitle}</h2>
          </div>
          <span className="count-pill">
            {summary.activeCount} {t.active}
          </span>
        </div>
        {tools.length === 0 ? (
          <EmptyState message={t.emptyTools} />
        ) : (
          <div className="tool-grid">
            {evaluations.map((item) => (
              <article className={`tool-card ${item.tool.status === "canceled" ? "muted-card" : ""}`} key={item.tool.id}>
                <div className="tool-card-header">
                  <div>
                    <h3>{item.tool.name}</h3>
                    <p>
                      {formatCategory(item.tool.category, language)} · {exactCurrencyFormatter.format(item.monthlyCost)}
                      {monthlySuffix} · {item.tool.renewalDate || t.noRenewalDate}
                    </p>
                  </div>
                  <span
                    className={`status-chip ${
                      item.tool.status === "canceled" ? "canceled" : recommendationClass(item.recommendation)
                    }`}
                  >
                    {item.tool.status === "canceled" ? t.canceled : formatRecommendation(item.recommendation, language)}
                  </span>
                </div>
                <p className="tool-notes">{item.tool.notes || t.noWorkflowNote}</p>
                <div className="tool-actions">
                  <button className="ghost-button" type="button" onClick={() => editTool(item.tool)}>
                    {t.edit}
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => setToolStatus(item.tool.id, item.tool.status === "canceled" ? "active" : "canceled")}
                  >
                    {item.tool.status === "canceled" ? t.restore : t.markCanceled}
                  </button>
                  <button className="danger-button" type="button" onClick={() => deleteTool(item.tool.id)}>
                    <Trash2 size={16} /> {t.delete}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="two-column-section">
        <section id="reminders" className="panel" aria-labelledby="reminder-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.step} 4</p>
              <h2 id="reminder-title">{t.reminderTitle}</h2>
            </div>
            <button className="ghost-button" type="button" onClick={notifyUpcoming}>
              <Bell size={16} /> {t.localNotify}
            </button>
          </div>
          <p className="helper-text">{t.reminderHelp}</p>
          {notificationMessage && <p className="inline-message">{notificationMessage}</p>}
          {upcoming.length === 0 ? (
            <EmptyState message={t.noReminderTools} />
          ) : (
            <div className="reminder-list">
              {upcoming.map(({ tool, renewalInDays }) => (
                <article className="reminder-item" key={tool.id}>
                  <div>
                    <h3>{tool.name}</h3>
                    <p>
                      {renewalInDays === 0 ? t.renewsToday : t.renewsIn(renewalInDays ?? 0)} · {tool.renewalDate}
                    </p>
                  </div>
                  <div className="reminder-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => downloadIcs(tool)}
                      title={t.downloadIcs(tool.name)}
                      aria-label={t.downloadIcs(tool.name)}
                    >
                      <FileDown size={17} />
                    </button>
                    <a
                      className="icon-button"
                      href={buildGoogleCalendarUrl(tool, language)}
                      target="_blank"
                      rel="noreferrer"
                      title={t.googleCalendar(tool.name)}
                      aria-label={t.googleCalendar(tool.name)}
                    >
                      <CalendarDays size={17} />
                    </a>
                    <a
                      className="icon-button"
                      href={buildOutlookCalendarUrl(tool, language)}
                      target="_blank"
                      rel="noreferrer"
                      title={t.outlookCalendar(tool.name)}
                      aria-label={t.outlookCalendar(tool.name)}
                    >
                      <CalendarDays size={17} />
                    </a>
                    <a className="icon-button" href={buildMailtoUrl(tool, language)} title={t.emailYourself(tool.name)} aria-label={t.emailYourself(tool.name)}>
                      <Mail size={17} />
                    </a>
                    <a className="icon-button" href={buildSmsUrl(tool, language)} title={t.textYourself(tool.name)} aria-label={t.textYourself(tool.name)}>
                      <MessageSquare size={17} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="backup" className="panel" aria-labelledby="export-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.step} 5</p>
              <h2 id="export-title">{t.backupTitle}</h2>
            </div>
          </div>
          <p className="helper-text">{t.backupHelp}</p>
          {importMessage && <p className="inline-message">{importMessage}</p>}
          <div className="export-actions">
            <button className="secondary-button" type="button" onClick={exportJson} disabled={tools.length === 0}>
              <Download size={17} /> {t.exportJson}
            </button>
            <button className="secondary-button" type="button" onClick={exportCsv} disabled={tools.length === 0}>
              <Download size={17} /> {t.exportCsv}
            </button>
            <button className="secondary-button" type="button" onClick={() => importRef.current?.click()}>
              <Upload size={17} /> {t.importJson}
            </button>
            <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleImport} />
          </div>
        </section>
      </section>

      <nav className="mobile-tabbar" aria-label={language === "zh" ? "手机分区导航" : "Mobile sections"}>
        <a href="#add-tool">
          <Plus size={18} />
          {t.navAdd}
        </a>
        <a href="#dashboard">
          <WalletCards size={18} />
          {t.navCosts}
        </a>
        <a href="#tools">
          <CheckCircle2 size={18} />
          {t.navTools}
        </a>
        <a href="#reminders">
          <Bell size={18} />
          {t.navRemind}
        </a>
        <a href="#backup">
          <Download size={18} />
          {t.navBackup}
        </a>
      </nav>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="empty-state">{message}</div>;
}
