import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import SaraBImage from "../../assets/images/SaraBlogs-Profile.jpg";
import AhmedFImage from "../../assets/images/AhmedFit-Profile.jpg";
import LisaSImage from "../../assets/images/Lisa-Profile.jpg";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

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
    { name: "Contracts", path: "/contracts", icon: "📄" },
    { name: "Transactions", path: "/transactions", icon: "💰" },
    { name: "Disputes", path: "/disputes", icon: "⚠️" },
    { name: "Content Review", path: "/ContentReview", icon: "📝" },
    { name: "Commission Earnings", path: "/CommissionEarnings", icon: "💵" },
    { name: "Reports", path: "/reports", icon: "📊" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const earningsData = [
    { month: "Jan", revenue: 20000, commission: 8000 },
    { month: "Feb", revenue: 30000, commission: 12500 },
    { month: "Mar", revenue: 25000, commission: 10200 },
    { month: "Apr", revenue: 40000, commission: 15800 },
    { month: "May", revenue: 48000, commission: 18900 },
  ];

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

        {/* MAIN LAYOUT */}
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
                  className={
                    location.pathname === item.path ? "active" : ""
                  }
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
              <h1>Admin Dashboard</h1>
              <p>Monitor platform activity and manage the system</p>
            </div>

            {/* STATS */}
            <div className="dashboard-stats">
              <div className="dashboard-stat-card">
                <h3>1,500</h3>
                <p><strong>Total Users</strong></p>
              </div>

              <div className="dashboard-stat-card">
                <h3>86</h3>
                <p><strong>Active Contracts</strong></p>
              </div>

              <div className="dashboard-stat-card">
                <h3>11</h3>
                <p><strong>Pending Disputes</strong></p>
              </div>

              <div className="dashboard-stat-card">
                <h3>SAR 125K</h3>
                <p><strong>Total Revenue</strong></p>
              </div>

              <div className="dashboard-stat-card">
                <h3>★★★★☆</h3>
                <p><strong>App Rating</strong></p>
              </div>
            </div>

            {/* OVERVIEW */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <div>
                  <h2>Top Influencers</h2>
                </div>
              </div>

              <div className="dashboard-campaign-list">

                <div className="dashboard-campaign-item">
                  <div className="dashboard-campaign-content">
                    <img
                      src={SaraBImage}
                      alt="SaraBlogs Profile"
                      className="influencer-img"
                    />
                  </div>
                  <div className="dashboard-campaign-content">
                  <h4>SaraBlogs</h4>
                  </div>
                </div>

                <div className="dashboard-campaign-item">
                  <div className="dashboard-campaign-content">
                    <img
                      src={AhmedFImage}
                      alt="AhmedFit Profile"
                      className="influencer-img"
                    />
                  </div>
                  <div className="dashboard-campaign-content">
                  <h4>AhmedFit</h4>
                  </div>
                </div>

                <div className="dashboard-campaign-item">
                  <div className="dashboard-campaign-content">
                    <img
                      src={LisaSImage}
                      alt="LisaStyle Profile"
                      className="influencer-img"
                    />
                  </div>
                  <div className="dashboard-campaign-content">
                  <h4>LisaStyle</h4>
                  </div>
                </div>

              </div>
            </div>

              {/* EARNINGS CHART */}
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h2>Earnings Overview</h2>
                    <p>Monthly Revenue vs Commission </p>
                  </div>
                </div>

                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={earningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4aa8ff"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="commission"
                        stroke="#6d5dfc"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

          </div>
        </div>
      </div>
    </div>
  );
}