import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, CircleDollarSign, FileText, Lightbulb, Printer, ShieldCheck, SlidersHorizontal, Sparkles, XCircle } from "lucide-react";
import API from "../api/axios";
import "../App.css";

const blankForm = { age:"", gender:"", married:"", education:"", employment_status:"", income:"", coapplicant_income:"", loan_amount:"", loan_term:"", credit_history:"", property_area:"" };
const list = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Ignore JSON parse error
    }

    return value
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .split(",")
      .map((item) => item.replace(/"/g, "").trim())
      .filter(Boolean);
  }

  return [];
};
const money = value => Number.isFinite(Number(value)) ? new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(Number(value)) : "Not available";
const percent = value => Number.isFinite(Number(value)) ? `${Math.round(Number(value) <= 1 ? Number(value) * 100 : Number(value))}%` : "Not available";

function ApplyLoan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(blankForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emiData, setEmiData] = useState({ amount:"", rate:"", tenure:"" });
  const [emi, setEmi] = useState(0);
  const [simulation, setSimulation] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState("");

  const handleChange = event => setFormData(current => ({ ...current, [event.target.name]:event.target.value }));
  const handleEmiChange = event => setEmiData(current => ({ ...current, [event.target.name]:event.target.value }));
  const calculateEMI = () => {
    const principal = Number(emiData.amount), rate = Number(emiData.rate), months = Number(emiData.tenure);
    if (!principal || !rate || !months) return alert("Please enter all EMI details");
    const monthlyRate = rate / 1200;
    setEmi(Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)));
  };
  const loanDataFromForm = () => ({ user_id:JSON.parse(localStorage.getItem("user") || "null")?.user_id, age:Number(formData.age), gender:formData.gender, married:formData.married, education:formData.education, employment_status:formData.employment_status, income:Number(formData.income), coapplicant_income:Number(formData.coapplicant_income), loan_amount:Number(formData.loan_amount), loan_term:Number(formData.loan_term), credit_history:formData.credit_history, property_area:formData.property_area });
  const runSimulation = async () => {
    setSimulationError("");
    setSimulation(null);
    const missing = Object.entries(formData).filter(([, value]) => value === "").map(([key]) => key.replaceAll("_", " "));
    if (missing.length) {
      setSimulationError(`Complete the application fields before previewing: ${missing.join(", ")}.`);
      return;
    }
    setSimulationLoading(true);
    try {
      const response = await API.post("/loans/simulate", loanDataFromForm());
      setSimulation(response.data);
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setSimulationError(typeof detail === "string" ? detail : "Could not calculate the simulation. Please check the entered values.");
    } finally { setSimulationLoading(false); }
  };
  const handleSubmit = async event => {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const loanData = loanDataFromForm();
      const response = await API.post("/loans/apply", loanData);
      setResult(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.detail || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };
  const status = String(result?.status || "").toLowerCase();
  const isApproved = ["approved", "approve", "eligible", "accepted"].includes(status);
  const rawProbability = Number(result?.approval_probability);
  const probability = Number.isFinite(rawProbability) ? Math.min(100, Math.max(0, rawProbability <= 1 ? rawProbability * 100 : rawProbability)) : 0;
  const reasons = list(result?.ai_reasons), suggestions = list(result?.ai_suggestions);
console.log("RESULT:", result);
console.log("AI REASONS RAW:", result?.ai_reasons);
console.log("AI SUGGESTIONS RAW:", result?.ai_suggestions);
console.log("REASONS ARRAY:", reasons);
console.log("SUGGESTIONS ARRAY:", suggestions);
  return <div className="loan-page"><div className="loan-card-new">
    <div style={styles.header}><div><p style={styles.eyebrow}><Sparkles size={16} /> SMARTLOAN AI</p><h1>AI Loan Application</h1><p className="subtitle">Get an instant AI-based loan prediction and repayment estimate.</p></div><ShieldCheck size={38} color="#2563eb" /></div>
    <form className="loan-form" onSubmit={handleSubmit}>
      <h2>Personal Details</h2><div className="input-grid">
        <input name="age" type="number" min="18" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <Choice name="gender" label="Gender" values={["Male","Female"]} data={formData} onChange={handleChange} />
        <Choice name="married" label="Married" values={["Yes","No"]} data={formData} onChange={handleChange} />
        <Choice name="education" label="Education" values={["Graduate","Not Graduate"]} data={formData} onChange={handleChange} />
      </div>
      <h2>Financial Details</h2><div className="input-grid">
        <Choice name="employment_status" label="Employment" values={["Employed","Self Employed"]} data={formData} onChange={handleChange} />
        <input name="income" type="number" min="0" placeholder="Monthly Income" value={formData.income} onChange={handleChange} required />
        <input name="coapplicant_income" type="number" min="0" placeholder="Coapplicant Income" value={formData.coapplicant_income} onChange={handleChange} required />
        <input name="loan_amount" type="number" min="1" placeholder="Loan Amount" value={formData.loan_amount} onChange={handleChange} required />
        <input name="loan_term" type="number" min="1" placeholder="Loan Term (Months)" value={formData.loan_term} onChange={handleChange} required />
        <Choice name="credit_history" label="Credit History" values={["Good","Bad"]} data={formData} onChange={handleChange} />
        <Choice name="property_area" label="Property Area" values={["Urban","Semiurban","Rural"]} data={formData} onChange={handleChange} />
      </div>
      <div style={styles.actions}>
        <button type="button" className="emi-btn" onClick={runSimulation} disabled={simulationLoading}><SlidersHorizontal size={18} />{simulationLoading ? "Calculating preview..." : "Preview affordability & AI assessment"}</button>
        <button type="submit" className="predict-btn" disabled={loading}>{loading ? "Submitting..." : "Submit application"}</button>
      </div>
    </form>
    {error && <p role="alert" style={styles.error}>{error}</p>}
    {simulationError && <p role="alert" style={styles.error}>{simulationError}</p>}
    {simulation && <DecisionReceipt result={simulation} formData={formData} simulated />}
    {result && <section className={`ai-result ${isApproved ? "approved" : "rejected"}`} style={styles.result}>
      <div style={styles.top}>{isApproved ? <CheckCircle size={45} /> : <XCircle size={45} />}<div><p style={styles.label}>LOAN PREDICTION RESULT</p><h2 style={styles.status}>Status: {result.status || "Completed"}</h2></div></div>
      {result.application_id && <p>Application ID: {result.application_id}</p>}
      <div style={styles.grid}><Metric label="Approval Probability" value={percent(result.approval_probability)} /><Metric label="Risk Level" value={result.risk_level || "Not available"} /><Metric label="Financial Score" value={result.financial_score ?? "Not available"} /><Metric label="Financial Health" value={result.financial_health || "Not available"} /></div>
      <div className="approval-bar" aria-label={`Approval probability: ${percent(result.approval_probability)}`}><div style={{ width:`${probability}%` }} /></div>
      <p style={styles.notice}>Application submitted for document review. AI assessment and final approval are performed by the authorised reviewer after verification.</p>
      {(reasons.length > 0 || suggestions.length > 0) && <div style={styles.insights}>{reasons.length > 0 && <Insight title="Why this decision" icon={<ShieldCheck size={19} />} items={reasons} />}{suggestions.length > 0 && <Insight title="AI suggestions" icon={<Lightbulb size={19} />} items={suggestions} />}</div>}
    </section>}
    <div className="emi-card"><h2>EMI Calculator</h2><div className="emi-grid"><input name="amount" type="number" min="1" placeholder="Loan Amount" value={emiData.amount} onChange={handleEmiChange} /><input name="rate" type="number" min="0" step="0.01" placeholder="Interest Rate %" value={emiData.rate} onChange={handleEmiChange} /><input name="tenure" type="number" min="1" placeholder="Tenure Months" value={emiData.tenure} onChange={handleEmiChange} /></div><button type="button" className="emi-btn" onClick={calculateEMI}>Calculate EMI</button>{emi > 0 && <p className="emi-result">Monthly EMI: ₹ {emi.toLocaleString("en-IN")}</p>}</div>
    <button className="back-dashboard-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
  </div></div>;
}
function Choice({ name, label, values, data, onChange }) { return <select name={name} value={data[name]} onChange={onChange} required><option value="">{label}</option>{values.map(value => <option key={value} value={value}>{value}</option>)}</select>; }
function Metric({ label, value }) { return <div style={styles.metric}><p style={styles.metricLabel}>{label}</p><strong style={styles.metricValue}>{value}</strong></div>; }
function DecisionReceipt({ result, formData }) {
  const signals = list(result.ai_reasons);
  const suggestions = list(result.ai_suggestions);
  const printReceipt = () => window.print();
  return <section className="decision-receipt" style={styles.receipt}>
    <div style={styles.receiptHead}><div><p style={styles.eyebrow}><FileText size={16} /> AI DECISION RECEIPT</p><h2 style={{ margin:"0 0 6px" }}>Loan recovery & affordability preview</h2><p style={{ margin:0, color:"#475569" }}>Generated {new Date().toLocaleString("en-IN")}</p></div><button type="button" onClick={printReceipt} style={styles.print}><Printer size={17} /> Print / Save PDF</button></div>
    <p style={styles.notice}>{result.simulation_notice}</p>
    <div style={styles.grid}><Metric label="AI Recommendation" value={result.status} /><Metric label="Approval likelihood" value={percent(result.approval_probability)} /><Metric label="Risk indicator" value={result.risk_level} /><Metric label="Financial score" value={result.financial_score} /></div>
    <div style={styles.emiSummary}><h3 style={styles.summaryTitle}><CircleDollarSign size={21} /> Simulated repayment estimate</h3><div style={styles.grid}><Metric label="Monthly EMI" value={money(result.monthly_emi)} /><Metric label="Total interest" value={money(result.total_interest)} /><Metric label="Total repayment" value={money(result.total_payment)} /><Metric label="Requested term" value={`${formData.loan_term} months`} /></div></div>
    <div style={styles.insights}>{signals.length > 0 && <Insight title="Model-aligned factors" icon={<ShieldCheck size={19} />} items={signals} />}{suggestions.length > 0 && <Insight title="Safer next steps" icon={<Lightbulb size={19} />} items={suggestions} />}</div>
    <div style={styles.limits}><strong>Limits and human review</strong><ul>{(result.model_limitations || []).map((item, index) => <li key={index}>{item}</li>)}</ul><p>The simulation only changes the amount and term you entered. Never provide inaccurate financial information to improve a result.</p></div>
  </section>;
}
function Insight({ title, icon, items }) {
  return (
    <div style={styles.insight}>
      <h3 style={styles.insightTitle}>
        {icon}
        <span>{title}</span>
      </h3>

      <ul style={styles.list}>
        {items.map((item, index) => (
          <li
            key={index}
            style={{
              marginBottom: "10px",
              color: "#374151",
              lineHeight: "1.7",
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
  },

  eyebrow: {
    display: "flex",
    gap: 7,
    alignItems: "center",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: ".08em",
    margin: "0 0 8px",
  },

  error: {
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 9,
    padding: 12,
    marginTop: 18,
  },
  actions: { display:"flex", gap:12, flexWrap:"wrap", marginTop:18 },
  receipt: { marginTop:28, padding:24, borderRadius:16, background:"#f8fbff", border:"1px solid #bfdbfe", textAlign:"left" },
  receiptHead: { display:"flex", justifyContent:"space-between", gap:16, flexWrap:"wrap", alignItems:"flex-start" },
  print: { display:"inline-flex", alignItems:"center", gap:7, border:"1px solid #2563eb", color:"#1d4ed8", background:"white", padding:"10px 14px", borderRadius:9, fontWeight:700, cursor:"pointer" },
  notice: { background:"#eff6ff", border:"1px solid #bfdbfe", color:"#1e3a8a", borderRadius:10, padding:12, lineHeight:1.5, margin:"18px 0" },
  limits: { marginTop:18, background:"#fffbeb", border:"1px solid #fde68a", color:"#713f12", borderRadius:10, padding:14, lineHeight:1.5 },

  result: {
    marginTop: 28,
    textAlign: "left",
    padding: 24,
  },

  top: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  label: {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    opacity: 0.8,
    letterSpacing: ".05em",
  },

  status: {
    margin: "4px 0 0",
    textTransform: "capitalize",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
    gap: 12,
    margin: "20px 0",
  },

  metric: {
    background: "rgba(255,255,255,.54)",
    borderRadius: 10,
    padding: 12,
  },

  metricLabel: {
    margin: 0,
    fontSize: 12,
    opacity: 0.75,
  },

  metricValue: {
    display: "block",
    fontSize: 16,
    marginTop: 5,
    textTransform: "capitalize",
  },

  emiSummary: {
    background: "rgba(37,99,235,.10)",
    border: "1px solid rgba(37,99,235,.2)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },

  summaryTitle: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    margin: "0 0 14px",
    fontSize: 16,
  },

  insights: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
    gap: 24,
    marginTop: 24,
    alignItems: "start",
  },

  insight: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
    overflowWrap: "break-word",
    wordBreak: "break-word",
    boxShadow: "0 4px 12px rgba(0,0,0,.05)",
  },

  insightTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: 0,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 600,
  },

  list: {
    margin: 0,
    paddingLeft: 22,
    lineHeight: 1.8,
  },
};
export default ApplyLoan;
