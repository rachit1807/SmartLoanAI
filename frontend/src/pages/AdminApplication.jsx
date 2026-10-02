import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function AdminApplication() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`${API}/admin/application/${id}`);
      const data = await res.json();
      setApplication(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyDocuments = async () => {
    try {
      await fetch(`${API}/admin/verify/${id}`, {
        method: "POST",
      });

      fetchApplication();
      alert("Documents Verified Successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const approveLoan = async () => {
    try {
      await fetch(`${API}/admin/approve/${id}`, {
        method: "POST",
      });

      fetchApplication();
      alert("Loan Approved Successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const rejectLoan = async () => {
    try {
      await fetch(`${API}/admin/reject/${id}`, {
        method: "POST",
      });

      fetchApplication();
      alert("Loan Rejected");
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: 100 }}>
        Loading...
      </h2>
    );
  }

  if (!application) {
    return (
      <h2 style={{ textAlign: "center", marginTop: 100 }}>
        Application not found
      </h2>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "40px",
      }}
    >
      {/* Header */}

      <div
        style={{
          background: "linear-gradient(135deg,#1e3c72,#2a5298)",
          color: "#fff",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 12px 35px rgba(0,0,0,.15)",
          marginBottom: "35px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 34 }}>
          🏦 Admin Loan Review
        </h1>

        <p
          style={{
            marginTop: 10,
            opacity: 0.9,
            fontSize: 17,
          }}
        >
          Review applicant information, uploaded documents and AI prediction
          before making the final approval decision.
        </p>
      </div>

      {/* Application Details */}

      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 30,
          boxShadow: "0 8px 20px rgba(0,0,0,.08)",
          marginBottom: 30,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>📋 Application Details</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 18,
          }}
        >
          <InfoCard title="Application ID" value={application.id} />
          <InfoCard title="User ID" value={application.user_id} />
          <InfoCard title="Income" value={`₹ ${application.income}`} />
          <InfoCard
            title="Loan Amount"
            value={`₹ ${application.loan_amount}`}
          />
          <InfoCard
            title="Property Area"
            value={application.property_area}
          />
          <InfoCard
            title="Employment"
            value={application.employment_status}
          />
          <InfoCard
            title="Credit History"
            value={application.credit_history}
          />

          <div
            style={{
              background: "#f8fafc",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #eee",
            }}
          >
            <h4 style={{ margin: 0, color: "#666" }}>Status</h4>

            <span
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "8px 16px",
                borderRadius: 30,
                fontWeight: 700,
                background:
                  application.status === "Approved"
                    ? "#dcfce7"
                    : application.status === "Rejected"
                    ? "#fee2e2"
                    : "#fef3c7",
                color:
                  application.status === "Approved"
                    ? "#15803d"
                    : application.status === "Rejected"
                    ? "#dc2626"
                    : "#b45309",
              }}
            >
              {application.status}
            </span>
          </div>
        </div>
      </div>

      {/* AI Prediction */}

      {application.approval_probability && (
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 30,
            boxShadow: "0 8px 20px rgba(0,0,0,.08)",
            marginBottom: 30,
          }}
        >
          <h2>🤖 AI Prediction Report</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
              gap: 18,
              marginTop: 20,
            }}
          >
            <InfoCard
              title="Approval Probability"
              value={`${application.approval_probability}%`}
            />

            <InfoCard
              title="Risk Level"
              value={application.risk_level}
            />

            <InfoCard
              title="Financial Score"
              value={application.financial_score}
            />

            <InfoCard
              title="Financial Health"
              value={application.financial_health}
            />

            <InfoCard
              title="Monthly EMI"
              value={`₹ ${application.monthly_emi}`}
            />

            <InfoCard
              title="Total Interest"
              value={`₹ ${application.total_interest}`}
            />

            <InfoCard
              title="Total Payment"
              value={`₹ ${application.total_payment}`}
            />
          </div>
        </div>
      )}

      {/* Documents */}

      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 30,
          boxShadow: "0 8px 20px rgba(0,0,0,.08)",
          marginBottom: 30,
        }}
      >
        <h2>📂 Uploaded Documents</h2>

        {application.documents?.length > 0 ? (
          application.documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                marginTop: 20,
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3>{doc.document_type}</h3>

              <a
                href={`${API}/${doc.file_path}`}
                target="_blank"
                rel="noreferrer"
              >
                📄 View Document
              </a>

              <p style={{ marginTop: 10 }}>
                <b>Status:</b>{" "}
                {doc.review_status || "Pending"}
              </p>
            </div>
          ))
        ) : (
          <p>No documents uploaded.</p>
        )}
      </div>

      {/* Buttons */}

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <ActionButton
          color="#f59e0b"
          onClick={verifyDocuments}
        >
          📄 Verify Documents
        </ActionButton>

        <ActionButton
          color="#16a34a"
          onClick={approveLoan}
        >
          ✅ Approve Loan
        </ActionButton>

        <ActionButton
          color="#dc2626"
          onClick={rejectLoan}
        >
          ❌ Reject Loan
        </ActionButton>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #eee",
      }}
    >
      <h4
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: 14,
        }}
      >
        {title}
      </h4>

      <h3
        style={{
          marginTop: 10,
          color: "#111827",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

function ActionButton({ children, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: "#fff",
        border: "none",
        padding: "16px 28px",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 10px 20px rgba(0,0,0,.15)",
      }}
    >
      {children}
    </button>
  );
}

export default AdminApplication;