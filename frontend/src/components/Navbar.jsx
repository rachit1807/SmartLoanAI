import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
      <h2 className="nav-logo" onClick={() => navigate("/dashboard")}>SmartLoan</h2>
      <div className="nav-links">
        <NavLink to="/dashboard">Overview</NavLink>
        <NavLink to="/apply-loan">Apply for a loan</NavLink>
        <NavLink to="/document-verification">Documents</NavLink>
        <NavLink to="/loan-history">Applications</NavLink>
        <button className="theme-btn" onClick={() => setDark((current) => !current)}>{dark ? "Light theme" : "Dark theme"}</button>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
