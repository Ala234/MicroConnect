import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { MoreVertical } from "lucide-react";
import {
  formatDisputeDate,
  getAllDisputes,
  updateDispute,
} from "../../data/disputes";

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
  const [disputes, setDisputes] = useState(() => getAllDisputes());

  const [search,         setSearch]        = useState("");
  const [statusFilter,   setStatusFilter]  = useState("All");
  const [priorityFilter, setPriorityFilter]= useState("All");
  const [openMenu,       setOpenMenu]      = useState(null);
  const [confirmResolve, setConfirmResolve]= useState(null);
  const [viewDispute,    setViewDispute]   = useState(null);
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
    const nextDisputes = updateDispute(id, { status: "Resolved" });
    setDisputes(nextDisputes);
    setConfirmResolve(null);
    setOpenMenu(null);
  };

  const handleView = (dispute) => {
    setViewDispute(viewDispute === dispute.disputeId ? null : dispute.disputeId);
    setOpenMenu(null);
  };

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const matchSearch =
        d.disputeId.toLowerCase().includes(search.toLowerCase())        ||
        d.submittedByName.toLowerCase().includes(search.toLowerCase())  ||
        d.submittedByRole.toLowerCase().includes(search.toLowerCase())  ||
        d.brandName.toLowerCase().includes(search.toLowerCase())        ||
        d.campaignName.toLowerCase().includes(search.toLowerCase())     ||
        d.reason.toLowerCase().includes(search.toLowerCase())           ||
        d.subject.toLowerCase().includes(search.toLowerCase());
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
                    <th>Dispute ID</th>
                    <th>Submitted By</th>
                    <th>Role</th>
                    <th>Campaign</th>
                    <th>Brand</th>
                    <th>Reason</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center", padding: "28px", color: "#b8c2e4" }}>
                        No disputes match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((d, index) => (
                      <>
                        <tr key={d.disputeId}>
                          <td>{(page - 1) * DISPUTES_PER_PAGE + index + 1}</td>
                          <td className="txn-id">{d.disputeId}</td>
                          <td>{d.submittedByName}</td>
                          <td>{d.submittedByRole}</td>
                          <td>{d.campaignName}</td>
                          <td>{d.brandName}</td>
                          <td className="dispute-reason" title={d.reason}>{d.reason}</td>
                          <td className="dispute-reason" title={d.subject}>{d.subject}</td>
                          <td className="txn-date">{formatDisputeDate(d.dateSubmitted)}</td>
                          <td className={priorityClass(d.priority)}>{d.priority}</td>
                          <td className={statusClass(d.status)}>{d.status}</td>
                          <td className="action-cell" ref={openMenu === d.disputeId ? menuRef : null}>
                            <button
                              className="action-btn"
                              onClick={() => setOpenMenu(openMenu === d.disputeId ? null : d.disputeId)}
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenu === d.disputeId && (
                              <div className="action-menu">
                                <div onClick={() => handleView(d)}>
                                  View Details
                                </div>
                                {d.status === "Pending" && (
                                  <div onClick={() => {
                                    setConfirmResolve(d.disputeId);
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
                        {confirmResolve === d.disputeId && (
                          <tr key={`confirm-${d.disputeId}`}>
                            <td colSpan={12}>
                              <div className="confirm-row">
                                <span>Mark <strong>{d.disputeId}</strong> as resolved?</span>
                                <button
                                  className="confirm-yes"
                                  onClick={() => handleResolve(d.disputeId)}
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

                        {viewDispute === d.disputeId && (
                          <tr key={`details-${d.disputeId}`}>
                            <td colSpan={12}>
                              <div className="confirm-row">
                                <span><strong>Description:</strong> {d.description}</span>
                                <span><strong>Contract:</strong> {d.contractId}</span>
                                <span><strong>Submitted By Email:</strong> {d.submittedByEmail || 'Not provided'}</span>
                                <span><strong>Admin Response:</strong> {d.adminResponse || 'No admin response yet.'}</span>
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