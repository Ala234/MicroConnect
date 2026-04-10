import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Reports() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const [chartType, setChartType] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [generated, setGenerated] = useState(false);

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

  // ================= DATA =================

  const usersData = [
    { name: "Brands", value: 438 },
    { name: "Influencers", value: 807 },
  ];

  const usersStatus = [
    { name: "Active", value: 900 },
    { name: "Suspended", value: 120 },
    { name: "Pending", value: 150 },
    { name: "Deleted", value: 75 },
  ];

  const contractsData = [
    { name: "Active", value: 50 },
    { name: "Completed", value: 120 },
    { name: "Pending", value: 30 },
    { name: "Accepted", value: 80 },
    { name: "Rejected", value: 20 },
  ];

  const paymentsData = [
    { name: "Completed", value: 9000 },
    { name: "Pending", value: 2000 },
    { name: "Failed", value: 500 },
  ];

  const commissionsData = [
    { name: "Admin (10%)", value: 1000 },
    { name: "Influencer (90%)", value: 9000 },
  ];

  const monthlyData = [
  { month: "Jan", value1: 50, value2: 100 },
  { month: "Feb", value1: 80, value2: 90 },
  { month: "Mar", value1: 120, value2: 110 },
  { month: "Apr", value1: 150, value2: 160 },
];

  const getChartData = () => {
    switch (reportType) {
      case "users":
        return usersData;
      case "contracts":
        return contractsData;
      case "payments":
        return paymentsData;
      case "commissions":
        return commissionsData;
      default:
        return [];
    }
  };

  // ================= TOTALS =================

  const totalUsers =
    usersData.reduce((acc, item) => acc + item.value, 0);

  const totalPayments =
    paymentsData.reduce((acc, item) => acc + item.value, 0);

  // ================= RENDER =================

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

            <div className="dashboard-hero">
              <h1>Reports</h1>
              <p>Generate platform insights</p>
            </div>

            {/* CONFIG */}
            {!generated && (
              <div className="reports-config">

                <h3 className="reports-title">
                  Customize the report before generating
                </h3>

                <div className="reports-row">
                  <p>Chart Type:</p>
                  <div className="reports-options">
                    <button
                      className={chartType === "pie" ? "active" : ""}
                      onClick={() => setChartType("pie")}
                    >
                      Pie
                    </button>

                    <button
                      className={chartType === "bar" ? "active" : ""}
                      onClick={() => setChartType("bar")}
                    >
                      Bar
                    </button>
                  </div>
                </div>

                <div className="reports-row">
                  <p>Report of:</p>
                  <div className="reports-grid">

                    <div
                      className={`reports-card ${reportType === "users" ? "selected" : ""}`}
                      onClick={() => setReportType("users")}
                    >
                      Total Users
                    </div>

                    <div
                      className={`reports-card ${reportType === "contracts" ? "selected" : ""}`}
                      onClick={() => setReportType("contracts")}
                    >
                      Total Contracts
                    </div>

                    <div
                      className={`reports-card ${reportType === "payments" ? "selected" : ""}`}
                      onClick={() => setReportType("payments")}
                    >
                      Total Payments
                    </div>

                    <div
                      className={`reports-card ${reportType === "commissions" ? "selected" : ""}`}
                      onClick={() => setReportType("commissions")}
                    >
                      Commissions
                    </div>

                  </div>
                </div>

                <button
                  className="generate-btn"
                  disabled={!chartType || !reportType}
                  onClick={() => setGenerated(true)}
                >
                  Generate Report
                </button>

              </div>
            )}

            {/* RESULT */}
{generated && (
  <div className="reports-result">

    {/* TITLE */}
    <div className="reports-header">
      <h2>
        Customized Report :{" "}
        <span>
          Report of {reportType} with {chartType} Chart
        </span>
      </h2>
    </div>

    {/* STATS CARDS */}
    <div className="dashboard-stats">

      {reportType === "users" && (
        <>
          <div className="dashboard-stat-card">
            <h3>{totalUsers}</h3>
            <p>Total Users</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>438</h3>
            <p>Brands</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>807</h3>
            <p>Influencers</p>
          </div>

        </>
      )}

      {reportType === "contracts" && (
        <>
          {contractsData.map((c, i) => (
            <div key={i} className="dashboard-stat-card">
              <h3>{c.value}</h3>
              <p>{c.name}</p>
            </div>
          ))}
        </>
      )}

      {reportType === "payments" && (
        <>
          <div className="dashboard-stat-card">
            <h3>{totalPayments}</h3>
            <p>Total (100%)</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>{totalPayments * 0.1}</h3>
            <p>Admin (10%)</p>
          </div>

          <div className="dashboard-stat-card">
            <h3>{totalPayments * 0.9}</h3>
            <p>Influencer (90%)</p>
          </div>
        </>
      )}

      {reportType === "commissions" && (
        <>
          {commissionsData.map((c, i) => (
            <div key={i} className="dashboard-stat-card">
              <h3>{c.value}</h3>
              <p>{c.name}</p>
            </div>
          ))}
        </>
      )}

    </div>

    {/* CHART */}
    <div className="dashboard-section">

      <div className="dashboard-section-header">
        <h2>Report Overview</h2>

      </div>

      <div className="chart-container">

        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="value1" fill="#4aa8ff" />
              <Bar dataKey="value2" fill="#6d5dfc" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={getChartData()}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>

    {/* ACTION BUTTONS */}
    <div className="reports-actions">

      <button
        className="reports-back-btn"
        onClick={() => {
          setGenerated(false);
          setChartType(null);
          setReportType(null);
        }}
      >
        Back
      </button>

      <button className="dashboard-primary-btn">
        Download PDF
      </button>

    </div>

  </div>
)}

          </div>
        </div>
      </div>
    </div>
  );
}