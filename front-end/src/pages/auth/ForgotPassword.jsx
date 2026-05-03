import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/login.png";

const API_URL = (import.meta.env.VITE_API_URL || "https://microconnect-1.onrender.com/api").replace(/\/$/, "");

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send code");
      }

      // Save email temporarily so the next pages can use it
      sessionStorage.setItem("resetEmail", email);

      alert("Code sent! Please check your email.");
      navigate("/verification");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-left">
          <h1>Forgot Password</h1>
          <br />
          <p className="login-subtitle">
            Enter your email and we'll send you a code
          </p>
          <br />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="login-submit-btn"
            onClick={handleSendCode}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Code"}
          </button>
          <br />
          <p className="login-link" onClick={() => navigate("/login")}>
            Back to Login
          </p>
        </div>

        <div className="login-right">
          <div className="login-visual-card">
            <img src={loginImage} alt="Forgot password" />
          </div>
        </div>
      </div>
    </div>
  );
}