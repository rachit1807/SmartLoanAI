import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, CircleDollarSign, Lightbulb, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import API from "../api/axios";
import "../App.css";

const blankForm = { age:"", gender:"", married:"", education:"", employment_status:"", income:"", coapplicant_income:"", loan_amount:"", loan_term:"", credit_history:"", property_area:"" };
const list = value => Array.isArray(value) ? value : typeof value === "string" ? value.split(/\n|(?<=[.!?])\s+/).filter(Boolean) : [];
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

  const handleChange = event => setFormData(current => ({ ...current, [event.target.name]:event.target.value }));
  const handleEmiChange = event => setEmiData(current => ({ ...current, [event.target.name]:event.target.value }));
  const calculateEMI = () => {
    const principal = Number(emiData.amount), rate = Number(emiData.rate), months = Number(emiData.tenure);
    if (!principal || !rate || !months) return alert("Please enter all EMI details");
    const monthlyRate = rate / 1200;
    setEmi(Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)));
  };
  const handleSubmit = async event => {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const loanData = { user_id:user?.user_id, age:Number(formData.age), gender:formData.gender, married:formData.married, education:formData.education, employment_status:formData.employment_status, income:Number(formData.income), coapplicant_income:Number(formData.coapplicant_income), loan_amount:Number(formData.loan_amount), loan_term:Number(formData.loan_term), credit_history:formData.credit_history, property_area:formData.property_area };
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
      <button type="submit" className="predict-btn" disabled={loading}>{loading ? "Processing AI..." : "Predict Loan Approval"}</button>
    </form>
    {error && <p role="alert" style={styles.error}>{error}</p>}
    {result && <section className={`ai-result ${isApproved ? "approved" : "rejected"}`} style={styles.result}>
      <div style={styles.top}>{isApproved ? <CheckCircle size={45} /> : <XCircle size={45} />}<div><p style={styles.label}>LOAN PREDICTION RESULT</p><h2 style={styles.status}>Status: {result.status || "Completed"}</h2></div></div>
      {result.application_id && <p>Application ID: {result.application_id}</p>}
      <div style={styles.grid}><Metric label="Approval Probability" value={percent(result.approval_probability)} /><Metric label="Risk Level" value={result.risk_level || "Not available"} /><Metric label="Financial Score" value={result.financial_score ?? "Not available"} /><Metric label="Financial Health" value={result.financial_health || "Not available"} /></div>
      <div className="approval-bar" aria-label={`Approval probability: ${percent(result.approval_probability)}`}><div style={{ width:`${probability}%` }} /></div>
      <div style={styles.emiSummary}><h3 style={styles.summaryTitle}><CircleDollarSign size={21} /> Backend repayment estimate</h3><div style={styles.grid}><Metric label="Monthly EMI" value={money(result.monthly_emi)} /><Metric label="Total Interest" value={money(result.total_interest)} /><Metric label="Total Payment" value={money(result.total_payment)} /></div></div>
      {(reasons.length > 0 || suggestions.length > 0) && <div style={styles.insights}>{reasons.length > 0 && <Insight title="Why this decision" icon={<ShieldCheck size={19} />} items={reasons} />}{suggestions.length > 0 && <Insight title="AI suggestions" icon={<Lightbulb size={19} />} items={suggestions} />}</div>}
    </section>}
    <div className="emi-card"><h2>EMI Calculator</h2><div className="emi-grid"><input name="amount" type="number" min="1" placeholder="Loan Amount" value={emiData.amount} onChange={handleEmiChange} /><input name="rate" type="number" min="0" step="0.01" placeholder="Interest Rate %" value={emiData.rate} onChange={handleEmiChange} /><input name="tenure" type="number" min="1" placeholder="Tenure Months" value={emiData.tenure} onChange={handleEmiChange} /></div><button type="button" className="emi-btn" onClick={calculateEMI}>Calculate EMI</button>{emi > 0 && <p className="emi-result">Monthly EMI: ₹ {emi.toLocaleString("en-IN")}</p>}</div>
    <button className="back-dashboard-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
  </div></div>;
}
function Choice({ name, label, values, data, onChange }) { return <select name={name} value={data[name]} onChange={onChange} required><option value="">{label}</option>{values.map(value => <option key={value} value={value}>{value}</option>)}</select>; }
function Metric({ label, value }) { return <div style={styles.metric}><p style={styles.metricLabel}>{label}</p><strong style={styles.metricValue}>{value}</strong></div>; }
function Insight({ title, icon, items }) { return <div style={styles.insight}><h3 style={styles.insightTitle}>{icon}{title}</h3><ul style={styles.list}>{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div>; }
const styles = { header:{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start"}, eyebrow:{display:"flex",gap:7,alignItems:"center",color:"#2563eb",fontSize:12,fontWeight:800,letterSpacing:".08em",margin:"0 0 8px"}, error:{color:"#b91c1c",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:9,padding:12,marginTop:18}, result:{marginTop:28,textAlign:"left",padding:24}, top:{display:"flex",gap:14,alignItems:"center"}, label:{margin:0,fontSize:12,fontWeight:800,opacity:.8,letterSpacing:".05em"}, status:{margin:"4px 0 0",textTransform:"capitalize"}, grid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:12,margin:"20px 0"}, metric:{background:"rgba(255,255,255,.54)",borderRadius:10,padding:12}, metricLabel:{margin:0,fontSize:12,opacity:.75}, metricValue:{display:"block",fontSize:16,marginTop:5,textTransform:"capitalize"}, emiSummary:{background:"rgba(37,99,235,.10)",border:"1px solid rgba(37,99,235,.2)",borderRadius:12,padding:16,marginTop:20}, summaryTitle:{display:"flex",gap:8,alignItems:"center",margin:"0 0 14px",fontSize:16}, insights:{display:"grid",gap:16,marginTop:22}, insight:{borderTop:"1px solid rgba(71,85,105,.2)",paddingTop:16}, insightTitle:{display:"flex",gap:8,alignItems:"center",margin:0,fontSize:16}, list:{margin:"9px 0 0",paddingLeft:20,lineHeight:1.55} };
export default ApplyLoan;
