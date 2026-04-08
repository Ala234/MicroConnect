import "../../styles/dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ContentReview() {
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

  const contents = [
  { id: 1, name: "Alice Johnson", content: "Travel - Check out my latest travel vlog from Bali! 🌴✈️ #wanderlust" },
  { id: 2, name: "Mark Smith", content: "Fitness - Just finished my morning workout. Feeling energized! 💪 #fitnessgoals" },
  { id: 3, name: "Sofia Lee", content: "Beauty - New makeup tutorial is live on my channel! 💄✨ #beauty" },
  { id: 4, name: "David Kim", content: "Technology - Sharing my top 5 coding tips for React developers. 👨‍💻 #webdev" },
  { id: 5, name: "Emma Williams", content: "Food - Baking homemade cookies today 🍪❤️ #bakingfun" },
    ];

  const filteredContents = contents.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase())
  );

  // Actions
  const handleView = (item) => {
    alert(`Viewing content: ${item.name}`);
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
              <h1>Content Review</h1>
            </div>

            {/* SEARCH */}
            <div className="users-controls">
              <input
                type="text"
                placeholder="Search by name or content..."
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
                    <th>Name</th>
                    <th>Content</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredContents.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.content}</td>

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

                            <div>
                                Flag Content
                            </div>

                            <div>
                                Remove Content
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