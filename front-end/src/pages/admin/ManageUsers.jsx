import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ManageUsers() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleView = (user) => {
    alert(`Viewing ${user.name}`);
    };

  const handleSuspend = (user) => {
    alert(`Suspending ${user.name}`);
    };

  const handleDelete = (user) => {
    alert(`Deleting ${user.name}`);
    };

    const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    };


  const [activeTab, setActiveTab] = useState("All");
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

  const users = [
    { id: 1, name: "SaraBlogs", email: "saraproff@gmail.com", role: "Influencer", status: "Active" },
    { id: 2, name: "AhmedFit", email: "ahmed@gmail.com", role: "Influencer", status: "Active" },
    { id: 3, name: "LisaStyle", email: "lisaSt@hotmail.com", role: "Influencer", status: "Active" },
    { id: 4, name: "BrandCo", email: "brand@hotmail.com", role: "Brand", status: "Pending" },
    { id: 5, name: "ShopX", email: "shop@hotmail.com", role: "Brand", status: "Active" },
    { id: 6, name: "TestUser", email: "test@hotmail.com", role: "Influencer", status: "Suspended" },
    { id: 7, name: "Alpha", email: "alpha@hotmail.com", role: "Influencer", status: "Active" },
    { id: 8, name: "Beta", email: "beta@hotmail.com", role: "Influencer", status: "Active" },
    { id: 9, name: "Gamma", email: "gamma@hotmail.com", role: "Influencer", status: "Deleted" },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Influencers" && u.role === "Influencer") ||
      (activeTab === "Brands" && u.role === "Brand");

    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const statusClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Pending":
        return "status-pending";
      case "Suspended":
        return "status-suspended";
      case "Deleted":
        return "status-deleted";
      default:
        return "";
    }
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
              <h1>Manage Users</h1>
            </div>

            {/* CONTROLS */}
            <div className="users-controls">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="tabs">
                {["All", "Influencers", "Brands"].map((tab) => (
                  <button
                    key={tab}
                    className={activeTab === tab ? "active" : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLE */}
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td className={statusClass(user.status)}>
                        {user.status}
                      </td>
                      <td className="action-cell">
                        <button
                        className="action-btn"
                        onClick={() =>
                        setOpenMenu(openMenu === user.id ? null : user.id)
                        }
                        >  ⋮
                        </button>

                        {openMenu === user.id && (
                        <div className="action-menu">
                        <div onClick={() => handleView(user)}>View Details</div>
                        <div onClick={() => handleSuspend(user)}>Suspend User</div>
                        <div
                            className="danger"
                            onClick={() => handleDelete(user)}
                        > Delete User
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