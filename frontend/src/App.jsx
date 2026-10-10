import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplyLoan from "./pages/ApplyLoan";
import LoanHistory from "./pages/LoanHistory";
import DocumentVerification from "./pages/DocumentVerification";
import UploadDocuments from "./pages/UploadDocuments";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApplication from "./pages/AdminApplication";
import "./Banking.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Authentication */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/apply-loan" element={<ApplyLoan />} />
                <Route path="/loan-history" element={<LoanHistory />} />
                <Route
                    path="/document-verification"
                    element={<DocumentVerification />}
                />
                <Route
                    path="/upload-documents"
                    element={<UploadDocuments />}
                />

                {/* Admin */}
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                    path="/admin-dashboard"
                    element={<AdminDashboard />}
                />
                <Route
                    path="/admin/application/:id"
                    element={<AdminApplication />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
