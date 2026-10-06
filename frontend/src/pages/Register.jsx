import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Lock,
  UserPlus,
} from "lucide-react";

import API from "../api/axios";
import "../App.css";

const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail[0]?.msg || "Please check the details you entered.";
  }

  return "Registration failed. Please try again.";
};

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/users/register", {
        name,
        email,
        password,
      });

      console.log(response.data);

      alert("Registration successful!");

      navigate("/");
    } catch (error) {
      console.log(error);

      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>SmartLoan AI</h1>

        <p className="auth-subtitle">
          Create your AI loan account
        </p>

        <h2>Register</h2>

        <form onSubmit={handleRegister}>
          <div className="auth-input">
            <User size={20} />

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          <div className="auth-input">
            <Mail size={20} />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="auth-input">
            <Lock size={20} />

            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            className="auth-btn"
            type="submit"
          >
            <UserPlus size={20} />
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span
            style={{
              cursor: "pointer",
              color: "#2563eb",
            }}
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
