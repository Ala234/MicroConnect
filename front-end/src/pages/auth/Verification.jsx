import "./Login.css";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/login.png";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export default function Verification() {
  const navigate = useNavigate();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // move forward
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // move back on delete
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const finalCode = code.join("");

    if (finalCode.length < 6) {
      alert("Please enter the full 6-digit code");
      return;
    }

    const email = sessionStorage.getItem("resetEmail");
    if (!email) {
      alert("Session expired. Please start over.");
      navigate("/forgot-password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: finalCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid code");
      }

      // Save the verified code so reset-password page can use it
      sessionStorage.setItem("resetCode", finalCode);
      navigate("/reset-password");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-panel">
        
        {/* LEFT */}
        <div className="login-left">
          <h1>Verification Code</h1>
          <br />

          <p className="login-subtitle">
            We sent a code to your email
          </p>
          <br />

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{
                  width: "50px",
                  height: "55px",
                  textAlign: "center",
                  fontSize: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                }}
              />
            ))}
          </div>

          <button
            className="login-submit-btn"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
          <br />
          <p className="login-link" onClick={() => navigate("/login")}>
            Back to Login
          </p>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-visual-card">
            <img src={loginImage} alt="Login visual" />
          </div>
        </div>

      </div>
    </div>
  );
}