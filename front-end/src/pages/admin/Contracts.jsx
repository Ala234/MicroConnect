import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Contracts() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed);
  }, [collapsed]);

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

  const contracts = [
    { id: "1005578", status: "Active" },
    { id: "1063843", status: "Active" },
    { id: "1042217", status: "Completed" },
    { id: "1049999", status: "Pending" },
    { id: "1058888", status: "Active" },
    { id: "1067777", status: "Accepted" },
    { id: "1076666", status: "Active" },
    { id: "1085555", status: "Active" },
    { id: "1094444", status: "Rejected" },
  ];

  const filteredContracts = contracts.filter((c) =>
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const statusClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Completed":
        return "status-completed";
      case "Pending":
        return "status-pending";
      case "Accepted":
        return "status-accepted";
      case "Rejected":
        return "status-deleted";
      default:
        return "";
    }
  };

  // Actions
  const handleView = (contract) => {
    alert(`Viewing contract ${contract.id}`);
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
              <h1>Contracts</h1>
            </div>

            {/* SEARCH */}
            <div className="users-controls">
              <input
                type="text"
                placeholder="Search..."
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
                    <th>Contract Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredContracts.map((contract, index) => (
                    <tr key={contract.id}>
                      <td>{index + 1}</td>
                      <td>{contract.id}</td>
                      <td className={statusClass(contract.status)}>
                        {contract.status}
                      </td>

                      <td className="action-cell">
                        <button
                          className="action-btn"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === contract.id ? null : contract.id
                            )
                          }
                        >
                          ⋮
                        </button>

                        {openMenu === contract.id && (
                          <div className="action-menu">
                            <div onClick={() => handleView(contract)}>
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