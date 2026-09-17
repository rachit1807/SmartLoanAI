import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CircleDollarSign, ShieldCheck, Sparkles } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import Navbar from "../components/Navbar";
import API from "../api/axios";
import "../App.css";

const initialStats = {
  total_loans: 0,
  approved: 0,
  rejected: 0,
  pending: 0,
  approval_percentage: 0,
  risk_level: "Low",
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
    : "—";
};

const formatProbability = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${Math.round(number <= 1 ? number * 100 : number)}%`;
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(initialStats);
  const [user, setUser] = useState({});
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userData = storedUser ? JSON.parse(storedUser) : null;

        if (!userData?.user_id) {
          navigate("/login");
          return;
        }

        setUser(userData);
        const [statsResponse, historyResponse] = await Promise.all([
          API.get(`/loans/dashboard/${userData.user_id}`),
          API.get(`/loans/recent/${userData.user_id}`),
        ]);

        setStats({ ...initialStats, ...statsResponse.data });
        setRecentLoans(Array.isArray(historyResponse.data) ? historyResponse.data : []);
      } catch (requestError) {
        console.error(requestError);
        setError("We could not load your dashboard. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    getDashboard();
  }, [navigate]);

  const approvalPercentage = Math.min(100, Math.max(0, Number(stats.approval_percentage) || 0));
  const chartData = useMemo(() => [
    { name: "Total", value: Number(stats.total_loans) || 0 },
    { name: "Approved", value: Number(stats.approved) || 0 },
    { name: "Rejected", value: Number(stats.rejected) || 0 },
  ], [stats]);

  const riskClass = stats.risk_level === "High" ? "risk-high" : stats.risk_level === "Medium" ? "risk-medium" : "risk-low";

  return (
    <div className="dashboard">
      <Navbar />

      <div style={styles.welcome}>
        <div>
          <p style={styles.eyebrow}><Sparkles size={16} /> SMARTLOAN AI</p>
          <h1>Welcome back{user.name ? `, ${user.name}` : ""} 👋</h1>
          <p className="subtitle">Your AI-powered loan approval and risk overview.</p>
        </div>
        <button style={styles.applyButton} onClick={() => navigate("/apply-loan")}>Apply New Loan</button>
      </div>

      {error && <p role="alert" style={styles.error}><AlertCircle size={18} /> {error}</p>}

      <div className="stats">
        <StatCard label="Total Loans" value={stats.total_loans} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Approval %" value={`${approvalPercentage}%`} />
      </div>

      <div className="profile-card">
        <h2>Profile Details</h2>
        <p>Name: {user.name || "—"}</p>
        <p>Email: {user.email || "—"}</p>
      </div>

      <div className="profile-card">
        <h2>Risk Analysis</h2>
        <p>Risk Level: <span className={riskClass}>{stats.risk_level}</span></p>
        <p>Pending Applications: {stats.pending}</p>
        <h3>Approval Rate</h3>
        <div className="progress-container"><div className="progress-bar" style={{ width: `${approvalPercentage}%` }} /></div>
        <p>{approvalPercentage}% Approval</p>
      </div>

      <div className="profile-card">
        <h2>Loan Analytics</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-loans-card">
        <h2>Recent Loan Applications</h2>
        {loading ? <p style={styles.muted}>Loading your loan applications…</p> : recentLoans.length === 0 ? <p style={styles.muted}>No loan applications yet. Start with your first application.</p> : (
          <div style={styles.tableWrap}>
            <table className="recent-table">
              <thead><tr><th>ID</th><th>Amount</th><th>Income</th><th>Status</th><th>AI assessment</th><th>EMI</th><th>Date</th></tr></thead>
              <tbody>
                {recentLoans.map((loan) => {
                  const approved = String(loan.status || "").toLowerCase() === "approved";
                  return <tr key={loan.id}>
                    <td>#{loan.id}</td>
                    <td>{formatCurrency(loan.loan_amount)}</td>
                    <td>{formatCurrency(loan.income)}</td>
                    <td><span className={approved ? "recent-status-approved" : "recent-status-rejected"}>{loan.status || "Pending"}</span></td>
                    <td>{loan.financial_score != null ? <span style={styles.assessment}><ShieldCheck size={15} /> {loan.financial_score} · {loan.financial_health || loan.risk_level || "Assessed"}</span> : formatProbability(loan.approval_probability)}</td>
                    <td>{formatCurrency(loan.monthly_emi)}</td>
                    <td>{loan.created_at ? new Date(loan.created_at).toLocaleDateString() : "—"}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-buttons">
        <button onClick={() => navigate("/apply-loan")}>Apply New Loan</button>
        <button className="history-btn" onClick={() => navigate("/loan-history")}>Loan History</button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return <div className="stat-card"><h3>{label}</h3><p>{value ?? 0}</p></div>;
}

const styles = {
  welcome: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" },
  eyebrow: { display: "flex", alignItems: "center", gap: 7, color: "#2563eb", fontWeight: 800, fontSize: 12, letterSpacing: ".08em", margin: "0 0 8px" },
  applyButton: { border: 0, borderRadius: 9, padding: "12px 16px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" },
  error: { display: "flex", alignItems: "center", gap: 7, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: 12, margin: "20px 0" },
  muted: { color: "#64748b" }, tableWrap: { overflowX: "auto" }, assessment: { display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" },
};

export default Dashboard;
