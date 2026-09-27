import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

function Navbar() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="main-navbar">
      <h2 className="nav-logo" onClick={() => navigate("/dashboard")}>SmartLoan AI</h2>
      <div className="nav-links">
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        <button onClick={() => navigate("/apply-loan")}>Apply Loan</button>
        <button onClick={() => navigate("/document-verification")}>Documents</button>
        <button onClick={() => navigate("/loan-history")}>Loan History</button>
        <button className="theme-btn" onClick={() => setDark((current) => !current)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
