import "../auth/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import loginImage from "../../assets/images/login.png";

export default function CreateAccount() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser({ name, email, password, role });

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "brand") navigate("/brand/setup");
      else if (data.user.role === "influencer") navigate("/influencer/setup");
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
          <h1>Create New Account</h1>

          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <p style={{ marginTop: "10px", color: "#b8c2e4" }}>
            I want to join as
          </p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button
              className="login-submit-btn"
              style={{
                background: role === "brand"
                  ? "linear-gradient(90deg,#7b61ff,#3fa9ff)"
                  : "rgba(255,255,255,0.05)"
              }}
              onClick={() => setRole("brand")}
            >
              Brand
            </button>

            <button
              className="login-submit-btn"
              style={{
                background: role === "influencer"
                  ? "linear-gradient(90deg,#7b61ff,#3fa9ff)"
                  : "rgba(255,255,255,0.05)"
              }}
              onClick={() => setRole("influencer")}
            >
              Influencer
            </button>
          </div>

          <button
            className="login-submit-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-visual-card">
            <img src={loginImage} alt="Create account visual" />
          </div>
        </div>

      </div>
    </div>
  );
}
