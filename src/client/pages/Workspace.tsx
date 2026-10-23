import { useMemo, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, CircleHelp, Code2, FileCheck2, GitCompareArrows, LogOut, Menu, Play, RotateCcw, ShieldCheck, Sparkles, X } from "lucide-react";
import Brand from "../components/Brand";
import ThemeToggle from "../components/ThemeToggle";
import JsonEditor from "../components/JsonEditor";
import { CompareResults, ValidationResults } from "../components/Results";
import { compareJson, parseJson } from "../services/compare";
import { validateJson } from "../services/validate";
import { saveComparison } from "../services/comparisonApi";
import type { DemoUser, JsonChange, ValidationIssue } from "../types";
type Props = { theme: "dark" | "light"; onToggleTheme: () => void; user: DemoUser | null; onAuth: (m: "login" | "signup") => void; onContact: () => void; onLogout: () => void; onHome: () => void };
const leftSample = JSON.stringify({ user: { id: 1042, name: "Ari Morgan", role: "editor" }, preferences: { theme: "dark", notifications: true }, tags: ["product", "engineering"] }, null, 2);
const rightSample = JSON.stringify({ user: { id: 1042, name: "Ari Morgan", role: "admin", verified: true }, preferences: { theme: "light", notifications: true }, tags: ["product", "engineering", "design"] }, null, 2);
const dataSample = JSON.stringify({ name: "Ari", age: 17, active: "yes" }, null, 2);
const schemaSample = JSON.stringify({ type: "object", required: ["name", "age", "active"], properties: { name: { type: "string" }, age: { type: "integer", minimum: 18 }, active: { type: "boolean" } }, additionalProperties: false }, null, 2);
export default function Workspace({ theme, onToggleTheme, user, onAuth, onContact, onLogout, onHome }: Props) {
  const [tab, setTab] = useState<"compare" | "validate">("compare");
  const [left, setLeft] = useState(leftSample); const [right, setRight] = useState(rightSample);
  const [data, setData] = useState(dataSample); const [schema, setSchema] = useState(schemaSample);
  const [changes, setChanges] = useState<JsonChange[]>([]); const [compared, setCompared] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; issues: ValidationIssue[] } | null>(null); const [validated, setValidated] = useState(false);
  const [error, setError] = useState(""); const [menuOpen, setMenuOpen] = useState(false);
  const counts = useMemo(() => ({ added: changes.filter(c => c.kind === "added").length, removed: changes.filter(c => c.kind === "removed").length, changed: changes.filter(c => c.kind === "changed").length }), [changes]);
async function runCompare() {
  try {
    setError("");

    const original = parseJson(left);
    const updated = parseJson(right);
    const result = compareJson(original, updated);

    setChanges(result);
    setCompared(true);

    try {
      const id = await saveComparison({
        title: `Comparison ${new Date().toLocaleString()}`,
        original_json: original,
        updated_json: updated,
        changes: result,
      });

      console.log("Comparison saved successfully. ID:", id);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Comparison completed, but saving failed: ${saveError.message}`
          : "Comparison completed, but saving failed.",
      );
    }
  } catch (e) {
    setCompared(false);
    setError(
      e instanceof Error
        ? e.message.replace("INVALID_JSON: ", "")
        : "Could not compare JSON.",
    );
  }
}  function runValidate() { try { setError(""); setValidation(validateJson(data, schema)); setValidated(true); } catch (e) { setValidated(false); setError(e instanceof Error ? e.message.replace(/^(INVALID_JSON|INVALID_SCHEMA): /, "") : "Could not validate JSON."); } }
  function reset() { setError(""); setCompared(false); setValidated(false); setChanges([]); setValidation(null); setLeft(leftSample); setRight(rightSample); setData(dataSample); setSchema(schemaSample); }
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}><div className="sidebar-top"><Brand onClick={onHome} /><button className="icon-button mobile-only" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div><button className={`side-link ${tab === "compare" ? "active" : ""}`} onClick={() => { setTab("compare"); setError(""); setMenuOpen(false); }}><GitCompareArrows size={17} /> JSON comparison <span className="side-shortcut">⌘ 1</span></button><button className={`side-link ${tab === "validate" ? "active" : ""}`} onClick={() => { setTab("validate"); setError(""); setMenuOpen(false); }}><FileCheck2 size={17} /> Schema validation <span className="side-shortcut">⌘ 2</span></button>
      <div className="sidebar-bottom"><div className="sidebar-promo"><span className="promo-icon"><Sparkles size={17} /></span><strong>Clarity in every change.</strong><p>Understand your data before it ships.</p><button onClick={onContact}>Give feedback <ArrowDownUp size={13} /></button></div><button className="side-link" onClick={onContact}><CircleHelp size={17} /> Help & contact</button><div className="user-mini"><div className="avatar">{user?.name?.[0]?.toUpperCase() ?? "G"}</div><div className="user-mini-copy"><strong>{user?.name ?? "Guest workspace"}</strong><span>{user?.email ?? "Local demo mode"}</span></div>{user ? <button className="icon-button tiny-icon" title="Sign out" onClick={onLogout}><LogOut size={15} /></button> : <button className="text-link" onClick={() => onAuth("login")}>Sign in</button>}</div></div>
    </aside>
    {menuOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className="workspace-main"><header className="workspace-topbar"><div className="topbar-left"><button className="icon-button mobile-only" onClick={() => setMenuOpen(true)}><Menu size={19} /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{tab === "compare" ? "Compare JSON" : "Validate schema"}</strong></div></div><div className="topbar-actions"><span className="environment-pill"><span className="status-dot" /> Demo environment</span><ThemeToggle theme={theme} onToggle={onToggleTheme} />{user ? <button className="user-chip" onClick={onLogout}><span className="avatar small-avatar">{user.name[0]?.toUpperCase()}</span><span>{user.name.split(" ")[0]}</span><LogOut size={14} /></button> : <button className="button button-secondary button-small" onClick={() => onAuth("login")}>Sign in</button>}</div></header>
      <div className="workspace-content"><div className="page-heading"><div><span className="eyebrow"><span className="status-dot" /> YOUR JSON WORKBENCH</span><h1>{tab === "compare" ? "Compare with confidence." : "Validate with precision."}</h1><p>{tab === "compare" ? "Spot the smallest change across nested JSON documents." : "Check your JSON data against a schema and get actionable feedback."}</p></div><button className="button button-quiet reset-button" onClick={reset}><RotateCcw size={14} /> Reset workspace</button></div>
        <div className="tool-tabs"><button className={tab === "compare" ? "selected" : ""} onClick={() => { setTab("compare"); setError(""); }}><GitCompareArrows size={16} /> Compare JSON</button><button className={tab === "validate" ? "selected" : ""} onClick={() => { setTab("validate"); setError(""); }}><ShieldCheck size={16} /> Validate schema</button><span className="tab-spacer" /><span className="privacy-note"><ShieldCheck size={13} /> Processed locally in this demo</span></div>
        {error && <div className="error-banner"><span><X size={15} /></span><div><strong>Could not complete request</strong><p>{error}</p></div><button onClick={() => setError("")}><X size={15} /></button></div>}
        {tab === "compare" ? <><div className="editor-grid"><JsonEditor title="Original JSON" subtitle="Baseline document" value={left} onChange={setLeft} onSample={() => setLeft(leftSample)} tint="violet" /><div className="swap-column"><span><ArrowDownUp size={17} /></span></div><JsonEditor title="Updated JSON" subtitle="Document to compare" value={right} onChange={setRight} onSample={() => setRight(rightSample)} tint="coral" /></div><div className="run-row"><div className="run-hint"><Code2 size={15} /> Supports nested objects, arrays, and primitive values</div><button className="button button-primary" onClick={runCompare}><Play size={15} fill="currentColor" /> Compare documents <span className="button-key">↵</span></button></div>
          <section className="results-panel"><div className="results-header"><div><h2>Comparison results</h2><p>{compared ? `${changes.length} ${changes.length === 1 ? "change" : "changes"} detected` : "Your changes will be summarized here"}</p></div>{compared && <div className="result-counts"><span className="count-added">+ {counts.added} added</span><span className="count-removed">− {counts.removed} removed</span><span className="count-changed">↻ {counts.changed} changed</span></div>}</div><CompareResults changes={changes} ran={compared} /></section>
        </> : <><div className="editor-grid validate-grid"><JsonEditor title="JSON data" subtitle="Value to validate" value={data} onChange={setData} onSample={() => setData(dataSample)} tint="violet" /><div className="swap-column"><span><ShieldCheck size={17} /></span></div><JsonEditor title="JSON Schema" subtitle="Rules the data must satisfy" value={schema} onChange={setSchema} onSample={() => setSchema(schemaSample)} tint="coral" /></div><div className="run-row"><div className="run-hint"><ShieldCheck size={15} /> JSON Schema validation powered by Ajv</div><button className="button button-primary" onClick={runValidate}><Play size={15} fill="currentColor" /> Validate data <span className="button-key">↵</span></button></div><section className="results-panel"><div className="results-header"><div><h2>Validation report</h2><p>{validated && validation ? validation.valid ? "All checks passed" : "Review the issues below" : "Your schema report will appear here"}</p></div>{validated && validation && <span className={`validity-pill ${validation.valid ? "is-valid" : "is-invalid"}`}>{validation.valid ? "Valid JSON" : "Needs attention"}</span>}</div><ValidationResults result={validation} ran={validated} /></section></>}
        <footer className="workspace-footer"><span>DIFFIFY <span className="footer-separator">/</span> JSON CLARITY, LAYER BY LAYER</span><span>Built for reliable data workflows <span className="footer-spark">✳</span></span></footer>
      </div>
    </main>
  </div>;
}