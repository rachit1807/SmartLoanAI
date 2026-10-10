import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

import API from "../api/axios";
import "../App.css";
import "./BankAuth.css";

const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail[0]?.msg || "Please check the details you entered.";
  return "We could not create your account. Please try again.";
};

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await API.post("/users/register", { name, email, password });
      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bank-auth-page">
      <section className="bank-auth-shell bank-register-shell" aria-label="SmartLoan account registration">
        <aside className="bank-auth-intro">
          <div className="bank-brand">
            <span className="bank-brand-mark" aria-hidden="true"><Building2 size={24} /></span>
            <span>SmartLoan</span>
          </div>
          <div className="bank-auth-intro-copy">
            <p className="bank-eyebrow">DIGITAL LENDING PORTAL</p>
            <h1>Start your application with confidence.</h1>
            <p>Create your account to plan your loan, upload documents and track your application securely.</p>
          </div>
          <div className="bank-security-note">
            <ShieldCheck size={20} aria-hidden="true" />
            <span>Account access is kept separate from your loan assessment and review.</span>
          </div>
        </aside>

        <section className="bank-auth-panel">
          <div className="bank-mobile-brand">
            <span className="bank-brand-mark" aria-hidden="true"><Building2 size={21} /></span>
            <span>SmartLoan</span>
          </div>
          <div className="bank-auth-heading">
            <p className="bank-eyebrow">CREATE ACCOUNT</p>
            <h2>Open your SmartLoan account</h2>
            <p>Use your email address to create a secure applicant profile.</p>
          </div>

          <form className="bank-auth-form" onSubmit={handleRegister}>
            <div className="bank-field">
              <label htmlFor="register-name">Full name</label>
              <div className="bank-input-wrap">
                <UserRound size={18} aria-hidden="true" />
                <input id="register-name" type="text" placeholder="Enter your full name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
              </div>
            </div>

            <div className="bank-field">
              <label htmlFor="register-email">Email address</label>
              <div className="bank-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input id="register-email" type="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
            </div>

            <div className="bank-field">
              <label htmlFor="register-password">Create password</label>
              <div className="bank-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input id="register-password" type="password" placeholder="Choose a password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
              </div>
            </div>

            {errorMessage && <p className="bank-form-error" role="alert">{errorMessage}</p>}
            <button className="bank-primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
              {!isSubmitting && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <p className="bank-auth-switch">
            Already have an account? <button type="button" onClick={() => navigate("/")}>Sign in</button>
          </p>
        </section>
      </section>
    </main>
  );
}

export default Register;
