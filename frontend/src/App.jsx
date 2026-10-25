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
import ProtectedRoute from './components/ProtectedRoute';
import ThemePreview from './pages/ThemePreview';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {import.meta.env.DEV && <Route path="/theme-preview" element={<ThemePreview />} />}

                {/* Authentication */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-setup" element={<Register adminSetup />} />

                {/* User */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/apply-loan" element={<ProtectedRoute><ApplyLoan /></ProtectedRoute>} />
                <Route path="/loan-history" element={<ProtectedRoute><LoanHistory /></ProtectedRoute>} />
                <Route
                    path="/document-verification"
                    element={<ProtectedRoute><DocumentVerification /></ProtectedRoute>}
                />
                <Route
                    path="/upload-documents"
                    element={<ProtectedRoute><UploadDocuments /></ProtectedRoute>}
                />

                {/* Admin */}
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                    path="/admin-dashboard"
                    element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/admin/application/:id"
                    element={<ProtectedRoute admin><AdminApplication /></ProtectedRoute>}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
