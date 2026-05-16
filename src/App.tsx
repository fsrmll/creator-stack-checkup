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
  Trash2,
  Upload,
  WalletCards,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toolsToCsv, toolsToJson, parseToolsJson } from "./lib/exporters";
import { categories, toolPresets } from "./lib/presets";
import { evaluateStack, summarizeStack, toMonthlyCost } from "./lib/rules";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildMailtoUrl,
  buildOutlookCalendarUrl,
  buildSmsUrl,
  downloadTextFile,
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

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const exactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

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
      id: crypto.randomUUID(),
      name: "ChatGPT Plus",
      category: "AI Chat",
      price: 20,
      usageFrequency: "daily",
      businessValue: "essential",
      renewalDate: futureDate(8),
    },
    {
      ...createEmptyForm(),
      id: crypto.randomUUID(),
      name: "Claude Pro",
      category: "AI Chat",
      price: 20,
      usageFrequency: "weekly",
      businessValue: "useful",
      renewalDate: futureDate(18),
    },
    {
      ...createEmptyForm(),
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
  const [tools, setTools] = useState<SubscriptionTool[]>(() => loadTools());
  const [form, setForm] = useState<ToolForm>(() => createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  const evaluations = useMemo(() => evaluateStack(tools), [tools]);
  const summary = useMemo(() => summarizeStack(evaluations), [evaluations]);
  const upcoming = evaluations
    .filter((item) => item.tool.status !== "canceled" && item.renewalInDays !== null && item.renewalInDays >= 0)
    .sort((a, b) => (a.renewalInDays ?? 999) - (b.renewalInDays ?? 999))
    .slice(0, 6);
  const suggestions = evaluations.filter(
    (item) => item.recommendation !== "Keep" || item.reasons.some((reason) => reason.includes("Renews")),
  );

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
        id: crypto.randomUUID(),
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
      `${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-reminder.ics`,
      buildIcsContent(tool),
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
      setImportMessage(`Imported ${imported.length} tools.`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      event.target.value = "";
    }
  }

  async function notifyUpcoming() {
    if (!("Notification" in window)) {
      setNotificationMessage("This browser does not support local notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNotificationMessage("Notifications were not enabled.");
      return;
    }
    const dueSoon = upcoming.find((item) => item.renewalInDays !== null && item.renewalInDays <= 7);
    if (!dueSoon) {
      new Notification("Creator Stack Checkup", {
        body: "No renewals in the next 7 days. Calendar reminders are still the safest option.",
      });
      setNotificationMessage("No renewals in the next 7 days.");
      return;
    }
    new Notification(`Review ${dueSoon.tool.name}`, {
      body: `${dueSoon.tool.name} renews in ${dueSoon.renewalInDays} day(s). Decide whether to keep, downgrade, or cancel.`,
    });
    setNotificationMessage(`Sent a local notification for ${dueSoon.tool.name}.`);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Local-first creator finance tool</p>
          <h1>Creator Stack Checkup</h1>
          <p className="lede">
            Audit your AI tools and creator subscriptions before they quietly drain your budget.
          </p>
        </div>
        <div className="privacy-pill">
          <CheckCircle2 size={18} />
          No login. No backend. Your data stays in this browser.
        </div>
      </header>

      <div className="mobile-summary" aria-label="Mobile stack summary">
        <div>
          <span>Monthly</span>
          <strong>{currencyFormatter.format(summary.monthlyBurn)}</strong>
        </div>
        <div>
          <span>Can save</span>
          <strong>{currencyFormatter.format(summary.savingsPotential)}</strong>
        </div>
        <div>
          <span>Renewals</span>
          <strong>{currencyFormatter.format(summary.upcomingRenewalCost30d)}</strong>
        </div>
      </div>

      <main className="layout-grid">
        <section id="add-tool" className="panel add-panel" aria-labelledby="add-tool-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2 id="add-tool-title">{editingId ? "Edit tool" : "Add a subscription"}</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => setTools(createSampleStack())}>
              <RefreshCcw size={16} /> Load sample
            </button>
          </div>

          <form className="tool-form" onSubmit={handleSubmit}>
            <label>
              Tool preset
              <select value="" onChange={(event) => applyPreset(event.target.value)}>
                <option value="">Choose a common creator tool</option>
                {toolPresets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tool name
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="ChatGPT Plus"
                required
              />
            </label>

            <div className="form-row">
              <label>
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateForm("price", numberValue(event.target.value))}
                />
              </label>
              <label>
                Billing
                <select
                  value={form.billingCycle}
                  onChange={(event) => updateForm("billingCycle", event.target.value as BillingCycle)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value as ToolCategory)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Next renewal
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(event) => updateForm("renewalDate", event.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Usage
                <select
                  value={form.usageFrequency}
                  onChange={(event) => updateForm("usageFrequency", event.target.value as UsageFrequency)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="rarely">Rarely</option>
                </select>
              </label>
              <label>
                Business value
                <select
                  value={form.businessValue}
                  onChange={(event) => updateForm("businessValue", event.target.value as BusinessValue)}
                >
                  <option value="essential">Essential</option>
                  <option value="useful">Useful</option>
                  <option value="optional">Optional</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Cancel risk
                <select
                  value={form.cancellationRisk}
                  onChange={(event) => updateForm("cancellationRisk", event.target.value as CancellationRisk)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Payment method
                <input
                  value={form.paymentMethod}
                  onChange={(event) => updateForm("paymentMethod", event.target.value)}
                  placeholder="Visa, PayPal, Wise"
                />
              </label>
            </div>

            <label>
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="What would break if you canceled this?"
              />
            </label>

            <div className="button-row">
              <button className="primary-button" type="submit">
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? "Save changes" : "Add tool"}
              </button>
              {editingId && (
                <button className="secondary-button" type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section id="dashboard" className="dashboard-stack" aria-label="Dashboard">
          <div className="metric-grid">
            <MetricCard label="Monthly burn" value={currencyFormatter.format(summary.monthlyBurn)} icon={<WalletCards />} />
            <MetricCard label="Annualized" value={currencyFormatter.format(summary.annualBurn)} icon={<CalendarDays />} />
            <MetricCard label="Can save" value={currencyFormatter.format(summary.savingsPotential)} icon={<AlertTriangle />} />
            <MetricCard label="30-day renewals" value={currencyFormatter.format(summary.upcomingRenewalCost30d)} icon={<Bell />} />
          </div>

          <section id="suggestions" className="panel suggestions-panel" aria-labelledby="suggestions-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Step 2</p>
                <h2 id="suggestions-title">Smart suggestions</h2>
              </div>
              <span className="count-pill">{suggestions.length} items</span>
            </div>
            {tools.length === 0 ? (
              <EmptyState message="Add a few tools to see overlap, renewal warnings, and cancel candidates." />
            ) : (
              <div className="suggestion-list">
                {summary.duplicateCategories.map((item) => (
                  <div className="notice-card" key={item.category}>
                    <AlertTriangle size={18} />
                    <span>
                      {item.count} active tools in <strong>{item.category}</strong>. Review overlap before the next renewal.
                    </span>
                  </div>
                ))}
                {suggestions.map((item) => (
                  <article className="suggestion-item" key={item.tool.id}>
                    <div>
                      <span className={`status-chip ${recommendationClass(item.recommendation)}`}>
                        {item.recommendation}
                      </span>
                      <h3>{item.tool.name}</h3>
                      <p>{item.reasons.join(" ")}</p>
                    </div>
                    <strong>{exactCurrencyFormatter.format(item.monthlyCost)}/mo</strong>
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
            <p className="eyebrow">Step 3</p>
            <h2 id="tools-title">Tool list</h2>
          </div>
          <span className="count-pill">{summary.activeCount} active</span>
        </div>
        {tools.length === 0 ? (
          <EmptyState message="Start with your paid AI, design, hosting, and creator tools." />
        ) : (
          <div className="tool-grid">
            {evaluations.map((item) => (
              <article className={`tool-card ${item.tool.status === "canceled" ? "muted-card" : ""}`} key={item.tool.id}>
                <div className="tool-card-header">
                  <div>
                    <h3>{item.tool.name}</h3>
                    <p>
                      {item.tool.category} · {exactCurrencyFormatter.format(item.monthlyCost)}/mo ·{" "}
                      {item.tool.renewalDate || "No renewal date"}
                    </p>
                  </div>
                  <span
                    className={`status-chip ${
                      item.tool.status === "canceled" ? "canceled" : recommendationClass(item.recommendation)
                    }`}
                  >
                    {item.tool.status === "canceled" ? "Canceled" : item.recommendation}
                  </span>
                </div>
                <p className="tool-notes">{item.tool.notes || "No workflow note yet."}</p>
                <div className="tool-actions">
                  <button className="ghost-button" type="button" onClick={() => editTool(item.tool)}>
                    Edit
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => setToolStatus(item.tool.id, item.tool.status === "canceled" ? "active" : "canceled")}
                  >
                    {item.tool.status === "canceled" ? "Restore" : "Mark canceled"}
                  </button>
                  <button className="danger-button" type="button" onClick={() => deleteTool(item.tool.id)}>
                    <Trash2 size={16} /> Delete
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
              <p className="eyebrow">Step 4</p>
              <h2 id="reminder-title">Reminder center</h2>
            </div>
            <button className="ghost-button" type="button" onClick={notifyUpcoming}>
              <Bell size={16} /> Local notify
            </button>
          </div>
          <p className="helper-text">
            These reminders do not use a backend. Calendar, mail, and SMS links open your own apps.
          </p>
          {notificationMessage && <p className="inline-message">{notificationMessage}</p>}
          {upcoming.length === 0 ? (
            <EmptyState message="Add renewal dates to generate calendar, email, and SMS reminders." />
          ) : (
            <div className="reminder-list">
              {upcoming.map(({ tool, renewalInDays }) => (
                <article className="reminder-item" key={tool.id}>
                  <div>
                    <h3>{tool.name}</h3>
                    <p>
                      {renewalInDays === 0 ? "Renews today" : `Renews in ${renewalInDays} day(s)`} ·{" "}
                      {tool.renewalDate}
                    </p>
                  </div>
                  <div className="reminder-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => downloadIcs(tool)}
                      title="Download ICS"
                      aria-label={`Download ICS reminder for ${tool.name}`}
                    >
                      <FileDown size={17} />
                    </button>
                    <a
                      className="icon-button"
                      href={buildGoogleCalendarUrl(tool)}
                      target="_blank"
                      rel="noreferrer"
                      title="Google Calendar"
                      aria-label={`Add ${tool.name} to Google Calendar`}
                    >
                      <CalendarDays size={17} />
                    </a>
                    <a
                      className="icon-button"
                      href={buildOutlookCalendarUrl(tool)}
                      target="_blank"
                      rel="noreferrer"
                      title="Outlook Calendar"
                      aria-label={`Add ${tool.name} to Outlook Calendar`}
                    >
                      <CalendarDays size={17} />
                    </a>
                    <a className="icon-button" href={buildMailtoUrl(tool)} title="Email yourself" aria-label={`Email yourself about ${tool.name}`}>
                      <Mail size={17} />
                    </a>
                    <a className="icon-button" href={buildSmsUrl(tool)} title="Text yourself" aria-label={`Text yourself about ${tool.name}`}>
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
              <p className="eyebrow">Step 5</p>
              <h2 id="export-title">Import / Export</h2>
            </div>
          </div>
          <p className="helper-text">
            Back up your stack or move it between browsers. Nothing is uploaded to a server.
          </p>
          {importMessage && <p className="inline-message">{importMessage}</p>}
          <div className="export-actions">
            <button className="secondary-button" type="button" onClick={exportJson} disabled={tools.length === 0}>
              <Download size={17} /> Export JSON
            </button>
            <button className="secondary-button" type="button" onClick={exportCsv} disabled={tools.length === 0}>
              <Download size={17} /> Export CSV
            </button>
            <button className="secondary-button" type="button" onClick={() => importRef.current?.click()}>
              <Upload size={17} /> Import JSON
            </button>
            <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleImport} />
          </div>
        </section>
      </section>

      <nav className="mobile-tabbar" aria-label="Mobile sections">
        <a href="#add-tool">
          <Plus size={18} />
          Add
        </a>
        <a href="#dashboard">
          <WalletCards size={18} />
          Costs
        </a>
        <a href="#tools">
          <CheckCircle2 size={18} />
          Tools
        </a>
        <a href="#reminders">
          <Bell size={18} />
          Remind
        </a>
        <a href="#backup">
          <Download size={18} />
          Backup
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
