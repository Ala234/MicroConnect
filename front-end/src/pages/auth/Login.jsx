import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "../../data/mockUsers";
import loginImage from "../../assets/images/login.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "brand") navigate("/brand");
    if (user.role === "influencer") navigate("/influencer");
    if (user.role === "admin") navigate("/admin");
  };

  return (
    <div className="login-screen">
      

      <div className="login-panel">
        <div className="login-left">
          <h1>Welcome Back !</h1>
        <br></br>
        <br></br>
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

          <button className="login-submit-btn" onClick={handleLogin}>
            Log in
          </button>
          <br></br>

          <p className="login-link muted" onClick={() => navigate("/verification")}>
        Forgot your password?
            </p>
            <br></br>
          <p className="login-link">
            Don’t have an account? <span onClick={() => navigate("/create-account")}>Register</span>
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