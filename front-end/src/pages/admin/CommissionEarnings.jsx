import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CommissionEarnings() {
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

  const earnings = [
    { id: "1005578", total: "1000 SAR", commission: "100 SAR", date: "22-03-2025" },
    { id: "1053733", total: "1000 SAR", commission: "100 SAR", date: "31-12-2025" },
    { id: "1074321", total: "800 SAR", commission: "80 SAR", date: "09-01-2026" },
    { id: "1054732", total: "1500 SAR", commission: "150 SAR", date: "18-02-2026" },
  ];

  const filtered = earnings.filter((e) =>
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (item) => {
    alert(`Viewing earning ${item.id}`);
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
              <h1>Commission Earnings</h1>
            </div>

            {/* TOP ROW */}
            <div className="disputes-top-row">

              {/* SEARCH */}
              <div className="users-controls no-margin">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* CARD */}
              <div className="disputes-cards">

                <div className="dashboard-stat-card small">
                  <h3>SAR 125,200</h3>
                  <p><strong>Total Revenue</strong></p>
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
                    <th>Total</th>
                    <th>Commission</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.id}</td>
                      <td>{item.total}</td>
                      <td className="status-completed">
                        {item.commission}
                      </td>
                      <td>{item.date}</td>

                      <td className="action-cell">
                        <button
                          className="action-btn"
                          onClick={() =>
                            setOpenMenu(openMenu === item.id ? null : item.id)
                          }
                        >
                          ⋮
                        </button>

                        {openMenu === item.id && (
                          <div className="action-menu">
                            <div onClick={() => handleView(item)}>
                              View Details
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