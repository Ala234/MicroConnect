import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed);
  }, [collapsed]);

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

  const transactions = [
    { id: "TX1001", total: 5000, admin: 500, influencer: 4500, status: "Completed" },
    { id: "TX1002", total: 3000, admin: 300, influencer: 2700, status: "Pending" },
    { id: "TX1003", total: 4200, admin: 420, influencer: 3780, status: "Completed" },
    { id: "TX1004", total: 2500, admin: 250, influencer: 2250, status: "Failed" },
    { id: "TX1005", total: 6000, admin: 600, influencer: 5400, status: "Completed" },
    { id: "TX1006", total: 3200, admin: 320, influencer: 2880, status: "Pending" },
    { id: "TX1007", total: 2800, admin: 280, influencer: 2520, status: "Completed" },
    { id: "TX1008", total: 1500, admin: 150, influencer: 1350, status: "Failed" },
  ];

  const filteredTransactions = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  const statusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Pending":
        return "status-pending";
      case "Failed":
        return "status-deleted";
      default:
        return "";
    }
  };

  // Actions
  const handleView = (t) => {
    alert(`Viewing transaction ${t.id}`);
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

            {/* HEADER */}
            <div className="dashboard-hero">
              <h1>Transactions</h1><h2>(Payment Info.)</h2>
            </div>

            {/* SEARCH */}
            <div className="users-controls">
              <input
                type="text"
                placeholder="Search by ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* TABLE */}
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>ID</th>
                    <th>Total</th>
                    <th>Admin (10%)</th>
                    <th>Influencer</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((t, index) => (
                    <tr key={t.id}>
                      <td>{index + 1}</td>
                      <td>{t.id}</td>
                      <td>SAR {t.total}</td>
                      <td>SAR {t.admin}</td>
                      <td>SAR {t.influencer}</td>
                      <td className={statusClass(t.status)}>
                        {t.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="pagination">
                <button>Previous</button>
                <span>1</span>
                <button>Next</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}