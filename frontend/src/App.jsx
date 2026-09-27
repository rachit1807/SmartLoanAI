import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplyLoan from "./pages/ApplyLoan";
import LoanHistory from "./pages/LoanHistory";
import DocumentVerification from "./pages/DocumentVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apply-loan" element={<ApplyLoan />} />
        <Route path="/loan-history" element={<LoanHistory />} />
        <Route
          path="/document-verification"
          element={<DocumentVerification />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;