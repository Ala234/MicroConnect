import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentInfluencerProfile, loginUser } from "../../api/auth";
import { getProfileForUser, isInfluencerProfileComplete, saveInfluencerProfile } from "../../data/influencerAccounts";
import loginImage from "../../assets/images/login.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser({ email, password });

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "brand") navigate("/brand");
      else if (data.user.role === "influencer") {
        let profile = getProfileForUser(data.user);

        if (!data.token?.startsWith("mock-token-")) {
          try {
            const backendProfile = await getCurrentInfluencerProfile(data.token);
            if (backendProfile) {
              profile = saveInfluencerProfile(backendProfile);
            }
          } catch {
            profile = getProfileForUser(data.user);
          }
        }

        navigate(isInfluencerProfileComplete(profile) ? "/influencer" : "/influencer/setup");
      }
      else if (data.user.role === "admin") navigate("/admin");
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
          <h1>Welcome Back !</h1>
          <br />
          <br />
          <input
            type="text"
            placeholder="Email / User Name"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="login-submit-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          <br />

          <p
            className="login-link muted"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot your password?
          </p>
          <br />
          <p className="login-link">
            Don't have an account?{" "}
            <span onClick={() => navigate("/create-account")}>Register</span>
          </p>
        </div>

        <div className="login-right">
          <div className="login-visual-card">
            <img src={loginImage} alt="Login visual" />
          </div>
        </div>
      </div>
    </div>
  );
}