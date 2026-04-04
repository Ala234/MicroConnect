import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/login.png";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = () => {
    if (!password || !confirmPassword) {
      alert("Please fill in both fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    alert("Password reset successful");
    navigate("/login");
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

          <button className="login-submit-btn" onClick={handleReset}>
            Reset password
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