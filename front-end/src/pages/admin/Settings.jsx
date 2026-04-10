import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const [policies, setPolicies] = useState([
    "All users must verify their accounts.",
    "Payments are processed within 3-5 business days.",
    "Contracts must be approved by both parties.",
  ]);

  const [showForm, setShowForm] = useState(false);
  const [policyNo, setPolicyNo] = useState("");
  const [policyText, setPolicyText] = useState("");

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed);
  }, [collapsed]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menu = [
    { name: "Dashboard", path: "/admin", icon: "🏠" },
    { name: "Manage Users", path: "/ManageUsers", icon: "👥" },
    { name: "Contracts", path: "/AdminContracts", icon: "📄" },
    { name: "Transactions", path: "/transactions", icon: "💰" },
    { name: "Disputes", path: "/disputes", icon: "⚠️" },
    { name: "Content Review", path: "/ContentReview", icon: "📝" },
    { name: "Commission Earnings", path: "/CommissionEarnings", icon: "💵" },
    { name: "Reports", path: "/reports", icon: "📊" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  // ================= HANDLERS =================

  const handleAddClick = () => {
    setShowForm(true);
    setPolicyNo("");
    setPolicyText("");
  };

  const handleSave = () => {
    if (!policyNo || !policyText) {
      alert("Please fill all fields");
      return;
    }

    const index = parseInt(policyNo) - 1;

    const updated = [...policies];
    updated[index] = policyText;

    setPolicies(updated);
    setShowForm(false);

    alert("Policy saved successfully ✅");
  };

  return (
    <div className={`dashboard-page ${collapsed ? "collapsed" : ""}`}>
      <div className="dashboard-shell">

        {/* TOP BAR */}
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>

          <button className="dashboard-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="admin-layout">

          {/* SIDEBAR */}
          <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
            <button
              className="sidebar-toggle"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? "➡️" : "⬅️"}
            </button>

            <ul>
              {menu.map((item) => (
                <li
                  key={item.path}
                  className={location.pathname === item.path ? "active" : ""}
                  onClick={() => navigate(item.path)}
                >
                  <span className="icon">{item.icon}</span>
                  {!collapsed && <span><strong>{item.name}</strong></span>}
                </li>
              ))}
            </ul>
          </div>

          {/* CONTENT */}
          <div className="admin-content">

            {/* HERO */}
            <div className="dashboard-hero">
              <h1>Settings</h1>
              <p>Manage platform policies</p>
            </div>

            {/* POLICIES SECTION */}
            <div className="dashboard-section">

              <div className="dashboard-section-header">
                <h2>Platform Policies</h2>
              </div>

              {/* LIST */}
              <div className="policies-list">
                {policies.map((p, index) => (
                  <div key={index} className="policy-item">
                    <span className="policy-number">{index + 1}.</span>
                    <p>{p}</p>
                  </div>
                ))}
              </div>

              {/* BUTTONS */}
              <div className="policies-actions">
                <button
                  className="dashboard-primary-btn"
                  onClick={handleAddClick}
                >
                  Add Policy
                </button>

                <button
                  className="dashboard-primary-btn"
                  onClick={handleAddClick}
                >
                  Update Policy
                </button>
              </div>

              {/* FORM */}
              {showForm && (
                <div className="policy-form">

                  <div className="policy-input">
                    <label>Policy No.</label>
                    <input
                      type="number"
                      value={policyNo}
                      onChange={(e) => setPolicyNo(e.target.value)}
                      placeholder="Enter policy number"
                    />
                  </div>

                  <div className="policy-input">
                    <label>Policy</label>
                    <textarea
                      value={policyText}
                      onChange={(e) => setPolicyText(e.target.value)}
                      placeholder="Enter policy text"
                    />
                  </div>

                  <button
                    className="dashboard-primary-btn"
                    onClick={handleSave}
                  >
                    Save
                  </button>

                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}