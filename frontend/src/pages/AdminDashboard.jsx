import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AdminNav from "../components/AdminNav";

function AdminDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await API.get("/admin/applications");
      setApplications(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const value = search.toLowerCase();

      return (
        String(app.id).includes(value) ||
        String(app.user_id).includes(value) ||
        app.status.toLowerCase().includes(value)
      );
    });
  }, [applications, search]);

  const total = applications.length;

  const approved = applications.filter(
    (a) => a.status === "Approved"
  ).length;

  const rejected = applications.filter(
    (a) => a.status === "Rejected"
  ).length;

  const pending = applications.filter(
    (a) =>
      a.status !== "Approved" &&
      a.status !== "Rejected"
  ).length;

  const cardStyle = {
    background: "#fff",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
    textAlign: "center",
  };

  const badgeStyle = (status) => ({
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "30px",
    fontWeight: 600,
    color:
      status === "Approved"
        ? "#166534"
        : status === "Rejected"
        ? "#991b1b"
        : "#92400e",
    background:
      status === "Approved"
        ? "#dcfce7"
        : status === "Rejected"
        ? "#fee2e2"
        : "#fef3c7",
  });

  if (loading) {
    return (
      <div className="bank-admin-page"><AdminNav /><h2
        style={{
          textAlign: "center",
          marginTop: 100,
        }}
      >
        Loading Dashboard...
      </h2></div>
    );
  }

  return (
    <div
  className="bank-admin-page"
  style={{
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "35px",
  }}
>
  <AdminNav />
  {/* Header */}

  <div
    className="bank-admin-heading"
    style={{
      background: "linear-gradient(135deg,#1e3c72,#2a5298)",
      color: "#fff",
      borderRadius: "20px",
      padding: "35px",
      marginBottom: "30px",
      boxShadow: "0 10px 30px rgba(0,0,0,.15)",
    }}
  >
    <h1
      style={{
        margin: 0,
        fontSize: "36px",
      }}
    >
      Lending operations
    </h1>

    <h2
      style={{
        marginTop: "12px",
        marginBottom: "10px",
      }}
    >
      Admin Dashboard
    </h2>

    <p
      style={{
        opacity: 0.9,
        fontSize: "17px",
      }}
    >
      Review loan applications, verify customer documents and approve or reject
      loans.
    </p>
  </div>

  {/* Statistics */}

  <div
    className="bank-admin-stats"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: "20px",
      marginBottom: "30px",
    }}
  >
    <div style={cardStyle}>
      <h3>Total Applications</h3>
      <h1>{total}</h1>
    </div>

    <div style={cardStyle}>
      <h3 style={{ color: "#16a34a" }}>Approved</h3>
      <h1>{approved}</h1>
    </div>

    <div style={cardStyle}>
      <h3 style={{ color: "#f59e0b" }}>Pending</h3>
      <h1>{pending}</h1>
    </div>

    <div style={cardStyle}>
      <h3 style={{ color: "#dc2626" }}>Rejected</h3>
      <h1>{rejected}</h1>
    </div>
  </div>

  {/* Search */}

  <div
    style={{
      background: "#fff",
      padding: "20px",
      borderRadius: "18px",
      marginBottom: "25px",
      boxShadow: "0 8px 20px rgba(0,0,0,.08)",
    }}
  >
    <input
      type="text"
      placeholder="Search by Application ID, User ID or Status..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        width: "100%",
        padding: "15px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        fontSize: "16px",
      }}
    />
  </div>

  {/* Table */}

  <div
    className="bank-admin-table"
    style={{
      background: "#fff",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 10px 25px rgba(0,0,0,.08)",
    }}
  >
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead
        style={{
          background: "#1e3c72",
          color: "#fff",
        }}
      >
        <tr>
          <th style={{ padding: "18px" }}>ID</th>
          <th>User</th>
          <th>Income</th>
          <th>Loan Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredApplications.map((app) => (
          <tr
            key={app.id}
            style={{
              borderBottom: "1px solid #eee",
            }}
          >
            <td
              style={{
                padding: "18px",
                textAlign: "center",
              }}
            >
              {app.id}
            </td>

            <td style={{ textAlign: "center" }}>
              {app.user_id}
            </td>

            <td style={{ textAlign: "center" }}>
              ₹ {app.income}
            </td>

            <td style={{ textAlign: "center" }}>
              ₹ {app.loan_amount}
            </td>

            <td style={{ textAlign: "center" }}>
              <span style={badgeStyle(app.status)}>
                {app.status}
              </span>
            </td>

            <td style={{ textAlign: "center" }}>
              <button
                onClick={() =>
                  navigate(`/admin/application/${app.id}`)
                }
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Review →
              </button>
            </td>
          </tr>
        ))}

        {filteredApplications.length === 0 && (
          <tr>
            <td
              colSpan="6"
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              No applications found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
);
}

export default AdminDashboard;
