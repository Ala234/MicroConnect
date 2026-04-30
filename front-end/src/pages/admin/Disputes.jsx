import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { MoreVertical } from "lucide-react";

const DISPUTES_PER_PAGE = 5;

export default function Disputes() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── State ──────────────────────────────────────────────
  const [disputes, setDisputes] = useState([
    { id: "D1001", filedBy: "SaraBlogs",  against: "NikeArabia", campaign: "Ramadan Collection", reason: "Payment not received after content delivery",      date: "Apr 28", priority: "High",   status: "Pending"  },
    { id: "D1002", filedBy: "GlowCo",     against: "AhmedFit",   campaign: "Summer Glow",        reason: "Content did not meet agreed specifications",        date: "Apr 25", priority: "Medium", status: "Resolved" },
    { id: "D1003", filedBy: "LisaStyle",  against: "LuxBrand",   campaign: "Eid Special Drop",   reason: "Brand changed requirements after contract signing",  date: "Apr 22", priority: "High",   status: "Pending"  },
    { id: "D1004", filedBy: "TechStore",  against: "SaraBlogs",  campaign: "Tech Review 2026",   reason: "Influencer missed agreed posting deadline",          date: "Apr 18", priority: "Low",    status: "Resolved" },
    { id: "D1005", filedBy: "AhmedFit",   against: "FoodHub",    campaign: "Food Week",          reason: "Partial payment dispute — amount mismatch",         date: "Apr 15", priority: "Medium", status: "Pending"  },
    { id: "D1006", filedBy: "NikeArabia", against: "LisaStyle",  campaign: "Spring Drop",        reason: "Content removed before agreed campaign end date",    date: "Apr 10", priority: "High",   status: "Pending"  },
    { id: "D1007", filedBy: "SaraBlogs",  against: "GlowCo",     campaign: "Glow Up Campaign",   reason: "Contract terms were modified without consent",       date: "Apr 05", priority: "Low",    status: "Resolved" },
    { id: "D1008", filedBy: "LuxBrand",   against: "AhmedFit",   campaign: "Luxury Fitness",     reason: "Influencer promoted competitor during campaign",     date: "Mar 30", priority: "High",   status: "Resolved" },
  ]);

  const [search,         setSearch]        = useState("");
  const [statusFilter,   setStatusFilter]  = useState("All");
  const [priorityFilter, setPriorityFilter]= useState("All");
  const [openMenu,       setOpenMenu]      = useState(null);
  const [confirmResolve, setConfirmResolve]= useState(null);
  const [page,           setPage]          = useState(1);

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

  // ── Reset page on filter change ────────────────────────
  useEffect(() => { setPage(1); }, [search, statusFilter, priorityFilter]);

  // ── Actions ────────────────────────────────────────────
  const handleResolve = (id) => {
    setDisputes((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: "Resolved" } : d)
    );
    setConfirmResolve(null);
    setOpenMenu(null);
    // TODO: await api.patch(`/disputes/${id}/resolve`)
  };

  const handleView = (dispute) => {
    navigate(`/admin/disputes/${dispute.id}`);
    // TODO: navigate to real dispute detail page
  };

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const matchSearch =
        d.id.toLowerCase().includes(search.toLowerCase())        ||
        d.filedBy.toLowerCase().includes(search.toLowerCase())   ||
        d.against.toLowerCase().includes(search.toLowerCase())   ||
        d.campaign.toLowerCase().includes(search.toLowerCase());
      const matchStatus   = statusFilter   === "All" || d.status   === statusFilter;
      const matchPriority = priorityFilter === "All" || d.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [disputes, search, statusFilter, priorityFilter]);

  // ── Stats (derived from real data) ────────────────────
  const totalDisputes   = disputes.length;
  const pendingCount    = disputes.filter((d) => d.status === "Pending").length;
  const resolvedCount   = disputes.filter((d) => d.status === "Resolved").length;
  const highPriority    = disputes.filter((d) => d.priority === "High" && d.status === "Pending").length;

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / DISPUTES_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * DISPUTES_PER_PAGE,
    page * DISPUTES_PER_PAGE
  );

  // ── Helpers ────────────────────────────────────────────
  const statusClass = (status) => {
    switch (status) {
      case "Pending":  return "status-pending";
      case "Resolved": return "status-resolved";
      default:         return "";
    }
  };

  const priorityClass = (priority) => {
    switch (priority) {
      case "High":   return "priority-high";
      case "Medium": return "priority-medium";
      case "Low":    return "priority-low";
      default:       return "";
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
              <h1>Disputes</h1>
              <p>Review and resolve conflicts between brands and influencers</p>
            </div>

            {/* STATS */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{totalDisputes}</div>
                <div className="stat-title">Total Disputes</div>
                <div className="stat-note">All time</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{pendingCount}</div>
                <div className="stat-title">Pending</div>
                <div className="stat-note">Awaiting resolution</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{resolvedCount}</div>
                <div className="stat-title">Resolved</div>
                <div className="stat-note">Successfully closed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{highPriority}</div>
                <div className="stat-title">High Priority</div>
                <div className="stat-note">Pending & urgent</div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="users-controls">
              <input
                className="txn-search"
                type="text"
                placeholder="Search by ID, user or campaign..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="txn-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {["All", "Pending", "Resolved"].map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                ))}
              </select>
              <select
                className="txn-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                {["All", "High", "Medium", "Low"].map((p) => (
                  <option key={p} value={p}>{p === "All" ? "All Priorities" : p}</option>
                ))}
              </select>
            </div>

            {/* COUNT */}
            <div className="txn-summary">
              <span>Showing <strong>{filtered.length}</strong> of <strong>{totalDisputes}</strong> disputes</span>
            </div>

            {/* TABLE */}
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>ID</th>
                    <th>Filed By</th>
                    <th>Against</th>
                    <th>Campaign</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "28px", color: "#b8c2e4" }}>
                        No disputes match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((d, index) => (
                      <>
                        <tr key={d.id}>
                          <td>{(page - 1) * DISPUTES_PER_PAGE + index + 1}</td>
                          <td className="txn-id">{d.id}</td>
                          <td>{d.filedBy}</td>
                          <td>{d.against}</td>
                          <td>{d.campaign}</td>
                          <td className="dispute-reason" title={d.reason}>{d.reason}</td>
                          <td className="txn-date">{d.date}</td>
                          <td className={priorityClass(d.priority)}>{d.priority}</td>
                          <td className={statusClass(d.status)}>{d.status}</td>
                          <td className="action-cell" ref={openMenu === d.id ? menuRef : null}>
                            <button
                              className="action-btn"
                              onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)}
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenu === d.id && (
                              <div className="action-menu">
                                <div onClick={() => handleView(d)}>
                                  View Details
                                </div>
                                {d.status === "Pending" && (
                                  <div onClick={() => {
                                    setConfirmResolve(d.id);
                                    setOpenMenu(null);
                                  }}>
                                    Mark as Resolved
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* INLINE RESOLVE CONFIRM */}
                        {confirmResolve === d.id && (
                          <tr key={`confirm-${d.id}`}>
                            <td colSpan={10}>
                              <div className="confirm-row">
                                <span>Mark <strong>{d.id}</strong> as resolved?</span>
                                <button
                                  className="confirm-yes"
                                  onClick={() => handleResolve(d.id)}
                                >
                                  Yes, Resolve
                                </button>
                                <button
                                  className="confirm-no"
                                  onClick={() => setConfirmResolve(null)}
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