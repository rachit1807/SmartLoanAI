import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import API from "../api/axios";
import "../App.css";
import "./BankAuth.css";

const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail[0]?.msg || "Please check the details you entered.";
  return "We could not sign you in. Please try again.";
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await API.post("/users/login", { email, password });
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bank-auth-page">
      <section className="bank-auth-shell" aria-label="SmartLoan secure sign in">
        <aside className="bank-auth-intro">
          <div className="bank-brand">
            <span className="bank-brand-mark" aria-hidden="true"><Building2 size={24} /></span>
            <span>SmartLoan</span>
          </div>
          <div className="bank-auth-intro-copy">
            <p className="bank-eyebrow">DIGITAL LENDING PORTAL</p>
            <h1>Banking that starts with clarity.</h1>
            <p>Review eligibility, repayment estimates and application updates in one secure place.</p>
          </div>
          <div className="bank-security-note">
            <ShieldCheck size={20} aria-hidden="true" />
            <span>Keep your password private and sign out when using a shared device.</span>
          </div>
        </aside>

        <section className="bank-auth-panel">
          <div className="bank-mobile-brand">
            <span className="bank-brand-mark" aria-hidden="true"><Building2 size={21} /></span>
            <span>SmartLoan</span>
          </div>
          <div className="bank-auth-heading">
            <p className="bank-eyebrow">ACCOUNT ACCESS</p>
            <h2>Sign in to your account</h2>
            <p>Enter your registered details to continue.</p>
          </div>

          <form className="bank-auth-form" onSubmit={handleLogin}>
            <div className="bank-field">
              <label htmlFor="login-email">Email address</label>
              <div className="bank-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input id="login-email" type="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
            </div>

            <div className="bank-field">
              <label htmlFor="login-password">Password</label>
              <div className="bank-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input id="login-password" type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
              </div>
            </div>

            {errorMessage && <p className="bank-form-error" role="alert">{errorMessage}</p>}
            <button className="bank-primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
              {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <p className="bank-auth-switch">
            New to SmartLoan? <button type="button" onClick={() => navigate("/register")}>Create an account</button>
          </p>
        </section>
      </section>
    </main>
  );
}

export default Login;
