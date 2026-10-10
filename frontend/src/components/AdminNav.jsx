import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminNav() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return <nav className="main-navbar" aria-label="Administration">
    <Link to="/admin-dashboard" className="nav-logo" style={{ textDecoration: "none" }}>SmartLoan <small style={{ fontSize: 12, fontWeight: 400 }}>Operations</small></Link>
    <div className="nav-links"><Link to="/admin-dashboard">Application queue</Link><Link to="/dashboard">Applicant portal</Link>
      <button type="button" className="theme-btn" aria-pressed={dark} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setDark(current => !current)}>{dark ? "Light theme" : "Dark theme"}</button>
    </div>
  </nav>;
}
