import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ChevronDown, Lightbulb, ShieldCheck } from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../api/axios";
import "../App.css";

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
    : "—";
};

const formatProbability = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number <= 1 ? number * 100 : number)}%` : "—";
};

const toList = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    return value
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .split(",")
      .map(item => item.replace(/"/g, "").trim())
      .filter(Boolean);
  }

  return [];
};

function LoanHistory() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userData = storedUser ? JSON.parse(storedUser) : null;

        if (!userData?.user_id) {
          navigate("/login");
          return;
        }

        const response = await API.get(`/loans/history/${userData.user_id}`);
        setLoans(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error(requestError);
        setError("We could not load your loan history. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    getHistory();
  }, [navigate]);

  return (
    <div className="history-page">
      <Navbar />
      <div className="history-container">
        <h1>Recent Loan Applications</h1>
        <p className="subtitle">View your previous applications and their AI assessments.</p>

        {error && <p role="alert" style={styles.error}><AlertCircle size={18} /> {error}</p>}

        <div className="history-card">
          {loading ? <p style={styles.muted}>Loading your applications…</p> : loans.length === 0 ? <p style={styles.muted}>You have not applied for a loan yet.</p> : (
            <div style={styles.tableWrap}>
              <table className="history-table">
                <thead><tr><th>ID</th><th>Loan Amount</th><th>Income</th><th>Status</th><th>AI Score</th><th>Monthly EMI</th><th>Date</th><th>Details</th></tr></thead>
                <tbody>
                  {loans.map((loan) => {
                    const approved = String(loan.status || "").toLowerCase() === "approved";
                    const expanded = expandedId === loan.id;
                    return <LoanRows key={loan.id} loan={loan} approved={approved} expanded={expanded} onToggle={() => setExpandedId(expanded ? null : loan.id)} />;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button className="back-dashboard-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      </div>
    </div>
  );
}

function LoanRows({ loan, approved, expanded, onToggle }) {
  const reasons = toList(loan.ai_reasons);
  const suggestions = toList(loan.ai_suggestions);
  return <>
    <tr>
      <td>#{loan.id}</td>
      <td>{formatCurrency(loan.loan_amount)}</td>
      <td>{formatCurrency(loan.income)}</td>
      <td><span className={approved ? "badge-approved" : "badge-rejected"}>{loan.status || "Pending"}</span></td>
      <td>{loan.financial_score ?? "—"}{loan.financial_health ? <small style={styles.health}> · {loan.financial_health}</small> : null}</td>
      <td>{formatCurrency(loan.monthly_emi)}</td>
      <td>{loan.created_at ? new Date(loan.created_at).toLocaleDateString() : "—"}</td>
      <td><button type="button" onClick={onToggle} style={styles.detailButton} aria-expanded={expanded}>View <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : "none" }} /></button></td>
    </tr>
    {expanded && <tr><td colSpan="8" style={styles.detailCell}>
      <div style={styles.detailGrid}>
        <Detail label="Approval probability" value={formatProbability(loan.approval_probability)} />
        <Detail label="Risk level" value={loan.risk_level || "—"} />
        <Detail label="Financial health" value={loan.financial_health || "—"} />
        <Detail label="Total interest" value={formatCurrency(loan.total_interest)} />
        <Detail label="Total payment" value={formatCurrency(loan.total_payment)} />
      </div>
      {(reasons.length > 0 || suggestions.length > 0) && <div style={styles.adviceGrid}>
        {reasons.length > 0 && <Advice title="Why this decision" icon={<ShieldCheck size={18} />} entries={reasons} />}
        {suggestions.length > 0 && <Advice title="AI suggestions" icon={<Lightbulb size={18} />} entries={suggestions} />}
      </div>}
    </td></tr>}
  </>;
}

function Detail({ label, value }) { return <div><p style={styles.detailLabel}>{label}</p><strong style={styles.detailValue}>{value}</strong></div>; }
function Advice({ title, icon, entries }) { return <div><h3 style={styles.adviceTitle}>{icon}{title}</h3><ul style={styles.list}>{entries.map((entry, index) => <li key={`${index}-${entry}`}>{entry}</li>)}</ul></div>; }

const styles = {
  error: { display:"flex", alignItems:"center", gap:7, color:"#b91c1c", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:9, padding:12, margin:"20px 0" },
  muted: { color:"#64748b", padding:"12px 0" }, tableWrap: { overflowX:"auto" }, health: { color:"#64748b", whiteSpace:"nowrap" },
  detailButton: { display:"inline-flex", alignItems:"center", gap:4, border:0, background:"transparent", color:"#2563eb", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" },
  detailCell: { padding:"18px 22px", background:"#f8fafc" }, detailGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:16 }, detailLabel: { margin:0, fontSize:12, color:"#64748b", textTransform:"uppercase", letterSpacing:".04em" }, detailValue: { display:"block", marginTop:5, color:"#1e293b", textTransform:"capitalize" },
  adviceGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 24,
  marginTop: 24,
  paddingTop: 20,
  borderTop: "1px solid #e2e8f0",
  alignItems: "start",
},

adviceTitle: {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 16,
  fontWeight: 600,
  margin: 0,
},

list: {
  marginTop: 12,
  paddingLeft: 22,
  color: "#475569",
  lineHeight: 1.8,
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "break-word",
},
};

export default LoanHistory;
