import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { MoreVertical } from "lucide-react";

const USERS_PER_PAGE = 5;

export default function ManageUsers() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── State ──────────────────────────────────────────────
  const [users, setUsers] = useState([
    { id: 1, name: "SaraBlogs",  email: "saraproff@gmail.com",  role: "Influencer", status: "Active"    },
    { id: 2, name: "AhmedFit",   email: "ahmed@gmail.com",       role: "Influencer", status: "Active"    },
    { id: 3, name: "LisaStyle",  email: "lisaSt@hotmail.com",    role: "Influencer", status: "Active"    },
    { id: 4, name: "BrandCo",    email: "brand@hotmail.com",     role: "Brand",      status: "Pending"   },
    { id: 5, name: "ShopX",      email: "shop@hotmail.com",      role: "Brand",      status: "Active"    },
    { id: 6, name: "TestUser",   email: "test@hotmail.com",      role: "Influencer", status: "Suspended" },
    { id: 7, name: "Alpha",      email: "alpha@hotmail.com",     role: "Influencer", status: "Active"    },
    { id: 8, name: "Beta",       email: "beta@hotmail.com",      role: "Influencer", status: "Active"    },
    { id: 9, name: "Gamma",      email: "gamma@hotmail.com",     role: "Influencer", status: "Deleted"   },
  ]);

  const [roleTab,    setRoleTab]    = useState("All");
  const [statusTab,  setStatusTab]  = useState("All");
  const [search,     setSearch]     = useState("");
  const [openMenu,   setOpenMenu]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [page,       setPage]       = useState(1);

  const menuRef = useRef(null);

  // ── Close menu on outside click ────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Actions (swap with API calls when backend is ready) ─
  const handleSuspend = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" }
          : u
      )
    );
    setOpenMenu(null);
    // TODO: await api.patch(`/users/${user.id}/suspend`)
  };

  const handleDelete = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "Deleted" } : u))
    );
    setConfirmDel(null);
    setOpenMenu(null);
    // TODO: await api.delete(`/users/${userId}`)
  };

  const handleView = (user) => {
    navigate(`/admin/users/${user.id}`);
    // TODO: navigate to real user detail page
  };

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchRole =
        roleTab === "All" ||
        (roleTab === "Influencers" && u.role === "Influencer") ||
        (roleTab === "Brands"      && u.role === "Brand");

      const matchStatus =
        statusTab === "All" || u.status === statusTab;

      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase())  ||
        u.email.toLowerCase().includes(search.toLowerCase());

      return matchRole && matchStatus && matchSearch;
    });
  }, [users, roleTab, statusTab, search]);

  // ── Reset to page 1 on filter change ──────────────────
  useEffect(() => { setPage(1); }, [roleTab, statusTab, search]);

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE
  );

  // ── Helpers ────────────────────────────────────────────
  const statusClass = (status) => {
    switch (status) {
      case "Active":    return "status-active";
      case "Pending":   return "status-pending";
      case "Suspended": return "status-suspended";
      case "Deleted":   return "status-deleted";
      default:          return "";
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
          <button className="dashboard-logout" onClick={handleLogout}>Log out</button>
        </div>

        <div className="admin-layout">
          <Sidebar onCollapse={setCollapsed} />

          <div className="admin-content">

            {/* HERO */}
            <div className="dashboard-hero">
              <h1>Manage Users</h1>
              <p>View, suspend, or remove platform users</p>
            </div>

            {/* CONTROLS */}
            <div className="users-controls">
              <input
                className="txn-search"
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Role tabs */}
              <div className="tabs">
                {["All", "Influencers", "Brands"].map((tab) => (
                  <button
                    key={tab}
                    className={roleTab === tab ? "active" : ""}
                    onClick={() => setRoleTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Status tabs */}
              <select
                className="txn-select"
                value={statusTab}
                onChange={(e) => setStatusTab(e.target.value)}
              >
                {["All", "Active", "Pending", "Suspended", "Deleted"].map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                ))}
              </select>
            </div>

            {/* USER COUNT */}
            <div className="txn-summary">
              <span>Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> users</span>
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
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "#b8c2e4" }}>
                        No users match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((user, index) => (
                      <>
                        <tr key={user.id}>
                          <td>{(page - 1) * USERS_PER_PAGE + index + 1}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td className={statusClass(user.status)}>{user.status}</td>
                          <td className="action-cell" ref={openMenu === user.id ? menuRef : null}>
                            <button
                              className="action-btn"
                              onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenu === user.id && (
                              <div className="action-menu">
                                <div onClick={() => handleView(user)}>
                                  View Details
                                </div>
                                <div onClick={() => handleSuspend(user)}>
                                  {user.status === "Suspended" ? "Unsuspend User" : "Suspend User"}
                                </div>
                                <div
                                  className="danger"
                                  onClick={() => {
                                    setConfirmDel(user.id);
                                    setOpenMenu(null);
                                  }}
                                >
                                  Delete User
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* INLINE DELETE CONFIRM */}
                        {confirmDel === user.id && (
                          <tr key={`confirm-${user.id}`}>
                            <td colSpan={6}>
                              <div className="confirm-row">
                                <span>Are you sure you want to delete <strong>{user.name}</strong>?</span>
                                <button
                                  className="confirm-yes"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  className="confirm-no"
                                  onClick={() => setConfirmDel(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={page === i + 1 ? "active" : ""}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}