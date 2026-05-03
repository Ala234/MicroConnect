import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/login.png";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill in both fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const email = sessionStorage.getItem("resetEmail");
    const code = sessionStorage.getItem("resetCode");

    if (!email || !code) {
      alert("Session expired. Please start over.");
      navigate("/forgot-password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Clear session data
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetCode");

      alert("Password reset successful! Please log in with your new password.");
      navigate("/login");
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
          <h1>Reset your password</h1>

          {/* NEW PASSWORD */}
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* CONFIRM PASSWORD */}
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            className="login-submit-btn"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>

          <p className="login-link">
            Back to <span onClick={() => navigate("/login")}>Log in</span>
          </p>
        </div>

        <div className="login-right">
          <div className="login-visual-card">
            <img src={loginImage} alt="Reset" />
          </div>
        </div>

      </div>
    </div>
  );
}