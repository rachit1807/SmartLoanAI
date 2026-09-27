import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck2, FileUp, ShieldCheck } from "lucide-react";

import Navbar from "../components/Navbar";
import API from "../api/axios";
import "../App.css";

function DocumentVerification() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [applicationId, setApplicationId] = useState("");
  const [documentType, setDocumentType] = useState("Income Proof");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user?.user_id) {
      navigate("/");
      return;
    }

    try {
      const [historyResponse, documentsResponse] = await Promise.all([
        API.get(`/loans/history/${user.user_id}`),
        API.get(`/documents/user/${user.user_id}`)
      ]);

      const loanApplications = Array.isArray(historyResponse.data)
        ? historyResponse.data
        : [];

      setApplications(loanApplications);

      setDocuments(
        Array.isArray(documentsResponse.data)
          ? documentsResponse.data
          : []
      );

      if (loanApplications.length > 0) {
        setApplicationId(String(loanApplications[0].id));
      }
    } catch (requestError) {
      setError("Could not load your applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!applicationId || !file) {
      setError("Select an application and a document file first.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    const payload = new FormData();

    payload.append("application_id", applicationId);
    payload.append("user_id", user.user_id);
    payload.append("document_type", documentType);
    payload.append("file", file);

    try {
      setUploading(true);

      await API.post("/documents/upload", payload);

      setFile(null);
      event.target.reset();

      setMessage(
        "Document uploaded successfully. Its verification status is Pending."
      );

      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        "Document upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="history-page">
      <Navbar />

      <main className="history-container">
        <div style={styles.heading}>
          <div>
            <p style={styles.eyebrow}>
              <ShieldCheck size={16} />
              APPLICATION DOCUMENTS
            </p>

            <h1>Document Verification</h1>

            <p className="subtitle">
              Upload sample documents for your loan application. Files remain
              Pending until a reviewer verifies them.
            </p>
          </div>
        </div>

        <section className="history-card" style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <FileUp size={24} />
            Upload a Document
          </h2>

          <form onSubmit={handleUpload} style={styles.form}>
            <label style={styles.field}>
              Select Loan Application

              <select
                style={styles.control}
                value={applicationId}
                onChange={(event) =>
                  setApplicationId(event.target.value)
                }
                required
              >
                <option value="">Select loan application</option>

                {applications.map((application) => (
                  <option
                    key={application.id}
                    value={application.id}
                  >
                    Application #{application.id} -{" "}
                    {application.review_status || "Submitted"}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.field}>
              Select Document Type

              <select
                style={styles.control}
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value)
                }
              >
                <option>Income Proof</option>
                <option>Bank Statement</option>
                <option>Identity Proof</option>
                <option>Address Proof</option>
              </select>
            </label>

            <label
              style={{
                ...styles.field,
                gridColumn: "1 / -1"
              }}
            >
              Choose Document File

              <input
                style={styles.fileInput}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(event) =>
                  setFile(event.target.files?.[0] || null)
                }
                required
              />
            </label>

            <button
              type="submit"
              className="predict-btn"
              style={styles.uploadButton}
              disabled={uploading || loading}
            >
              {uploading
                ? "Uploading..."
                : "Upload for Verification"}
            </button>
          </form>

          <p style={styles.note}>
            For your college demo, upload only sample documents. Maximum file
            size: 5 MB.
          </p>

          {message && <p style={styles.success}>{message}</p>}

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}
        </section>

        <section className="history-card" style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <FileCheck2 size={24} />
            Uploaded Documents
          </h2>

          {loading ? (
            <p>Loading documents...</p>
          ) : documents.length === 0 ? (
            <p style={styles.note}>No documents uploaded yet.</p>
          ) : (
            <div style={styles.tableWrap}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Document</th>
                    <th>File Name</th>
                    <th>Status</th>
                    <th>Uploaded Date</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>#{document.application_id}</td>

                      <td>{document.document_type}</td>

                      <td>{document.original_filename}</td>

                      <td>
                        <span
                          style={{
                            ...styles.badge,
                            ...badgeStyle(
                              document.verification_status
                            )
                          }}
                        >
                          {document.verification_status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          document.uploaded_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function badgeStyle(status) {
  if (status === "Verified") {
    return {
      background: "#dcfce7",
      color: "#166534"
    };
  }

  if (status === "Rejected") {
    return {
      background: "#fee2e2",
      color: "#b91c1c"
    };
  }

  return {
    background: "#fef3c7",
    color: "#92400e"
  };
}

const styles = {
  heading: {
    marginBottom: 30
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#2563eb",
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: ".07em",
    margin: 0
  },

  card: {
    marginBottom: 24,
    padding: 36
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 26
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 22,
    marginTop: 28
  },

  field: {
    display: "grid",
    gap: 10,
    color: "#334155",
    fontSize: 16,
    fontWeight: 700
  },

  control: {
    width: "100%",
    minHeight: 58,
    padding: "0 16px",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 16,
    boxSizing: "border-box"
  },

  fileInput: {
    width: "100%",
    minHeight: 60,
    padding: "16px",
    border: "1px dashed #2563eb",
    borderRadius: 12,
    background: "#eff6ff",
    boxSizing: "border-box",
    fontSize: 16
  },

  uploadButton: {
    gridColumn: "1 / -1",
    minHeight: 60,
    fontSize: 18,
    marginTop: 4
  },

  note: {
    color: "#64748b",
    fontSize: 15,
    marginTop: 18
  },

  success: {
    color: "#166534",
    fontWeight: 700,
    marginTop: 14
  },

  error: {
    color: "#b91c1c",
    fontWeight: 700,
    marginTop: 14
  },

  tableWrap: {
    overflowX: "auto"
  },

  badge: {
    padding: "7px 11px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13
  }
};

export default DocumentVerification;