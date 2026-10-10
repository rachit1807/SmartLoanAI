import { Link } from "react-router-dom";

export default function AdminNav() {
  return <nav className="main-navbar" aria-label="Administration">
    <Link to="/admin-dashboard" className="nav-logo" style={{ textDecoration: "none" }}>SmartLoan <small style={{ fontSize: 12, fontWeight: 400 }}>Operations</small></Link>
    <div className="nav-links"><Link to="/admin-dashboard">Application queue</Link><Link to="/dashboard">Applicant portal</Link></div>
  </nav>;
}
