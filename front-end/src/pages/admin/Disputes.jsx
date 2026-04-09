import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Disputes() {
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

  const disputes = [
    { id: "D1001", status: "Pending" },
    { id: "D1002", status: "Resolved" },
    { id: "D1003", status: "Pending" },
    { id: "D1004", status: "Resolved" },
    { id: "D1005", status: "Pending" },
    { id: "D1006", status: "Resolved" },
  ];

  const filteredDisputes = disputes.filter((d) =>
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = 11;
  const resolvedCount = 21;

  const statusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "status-resolved";
      case "Pending":
        return "status-pending";
      default:
        return "";
    }
  };

  const handleView = (d) => {
    alert(`Viewing dispute ${d.id}`);
  };

  const handleResolve = (d) => {
    alert(`Resolving dispute ${d.id}`);
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
              <h1>Disputes</h1>
            </div>

            <div className="disputes-top-row">

            {/* LEFT: SEARCH */}
            <div className="users-controls no-margin">
            <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
            </div>

            {/* RIGHT: CARDS */}
            <div className="disputes-cards">

            <div className="dashboard-stat-card small">
                <h3>{pendingCount}</h3>
                <p><strong>Pending</strong></p>
            </div>

            <div className="dashboard-stat-card small">
                <h3>{resolvedCount}</h3>
                <p><strong>Resolved</strong></p>
            </div>

            </div>

            </div>

            {/* TABLE */}
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>ID</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDisputes.map((d, index) => (
                    <tr key={d.id}>
                      <td>{index + 1}</td>
                      <td>{d.id}</td>
                      <td className={statusClass(d.status)}>
                        {d.status}
                      </td>

                      <td className="action-cell">
                        <button
                          className="action-btn"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === d.id ? null : d.id
                            )
                          }
                        >
                          ⋮
                        </button>

                        {openMenu === d.id && (
                          <div className="action-menu">
                            <div onClick={() => handleView(d)}>
                              View Details
                            </div>
                            <div onClick={() => handleResolve(d)}>
                              Mark as Resolved
                            </div>
                          </div>
                        )}
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