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

  const [disputes,       setDisputes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [successMsg,     setSuccessMsg]     = useState("");
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [openMenu,       setOpenMenu]       = useState(null);
  const [confirmResolve, setConfirmResolve] = useState(null);
  const [adminResponse,  setAdminResponse]  = useState("");
  const [page,           setPage]           = useState(1);

  const menuRef = useRef(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res  = await fetch("/api/admin/disputes", { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDisputes(data);
      } catch (err) {
        setError(err.message || "Failed to load disputes");
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setPage(1); }, [search, statusFilter, priorityFilter]);

  const handleResolve = async (id) => {
    try {
      const res  = await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ adminResponse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setDisputes((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, status: "Resolved", adminResponse } : d
        )
      );
      setConfirmResolve(null);
      setAdminResponse("");
      showSuccess("Dispute resolved successfully.");
    } catch (err) {
      setError(err.message || "Failed to resolve dispute");
    }
  };

  const totalDisputes = disputes.length;
  const pendingCount  = disputes.filter((d) => d.status === "Pending").length;
  const resolvedCount = disputes.filter((d) => d.status === "Resolved").length;
  const highPriority  = disputes.filter((d) => d.priority === "High" && d.status === "Pending").length;

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const filedBy  = d.submittedBy?.name || "";
      const against  = d.against?.name     || "";
      const campaign = d.campaignId?.title || "";

      const matchSearch =
        d.disputeId?.toLowerCase().includes(search.toLowerCase()) ||
        d.subject?.toLowerCase().includes(search.toLowerCase())   ||
        filedBy.toLowerCase().includes(search.toLowerCase())      ||
        against.toLowerCase().includes(search.toLowerCase())      ||
        campaign.toLowerCase().includes(search.toLowerCase());

      const matchStatus   = statusFilter   === "All" || d.status   === statusFilter;
      const matchPriority = priorityFilter === "All" || d.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [disputes, search, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filtered.length / DISPUTES_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * DISPUTES_PER_PAGE,
    page * DISPUTES_PER_PAGE
  );

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

            <div className="dashboard-hero">
              <h1>Disputes</h1>
              <p>Review and resolve conflicts between brands and influencers</p>
            </div>

            {successMsg && (
              <div className="settings-success">{successMsg}</div>
            )}

            {error && (
              <div className="confirm-row">
                <span className="error-text">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="txn-summary">
                <span className="loading-text">Loading disputes...</span>
              </div>
            ) : (
              <>
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
                      <option key={s} value={s}>
                        {s === "All" ? "All Statuses" : s}
                      </option>
                    ))}
                  </select>
                  <select
                    className="txn-select"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    {["All", "High", "Medium", "Low"].map((p) => (
                      <option key={p} value={p}>
                        {p === "All" ? "All Priorities" : p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="txn-summary">
                  <span>
                    Showing <strong>{filtered.length}</strong> of{" "}
                    <strong>{totalDisputes}</strong> disputes
                  </span>
                </div>

                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>ID</th>
                        <th>Filed By</th>
                        <th>Against</th>
                        <th>Campaign</th>
                        <th>Subject</th>
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
                          <td colSpan={11} className="table-empty-cell">
                            No disputes match your filters.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((d, index) => (
                          <>
                            <tr key={d._id}>
                              <td>{(page - 1) * DISPUTES_PER_PAGE + index + 1}</td>
                              <td className="txn-id">{d.disputeId}</td>
                              <td>{d.submittedBy?.name || "—"}</td>
                              <td>{d.against?.name     || "—"}</td>
                              <td>{d.campaignId?.title || "—"}</td>
                              <td className="dispute-reason" title={d.subject}>
                                {d.subject}
                              </td>
                              <td className="txn-date">{d.reason}</td>
                              <td className="txn-date">
                                {new Date(d.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </td>
                              <td className={priorityClass(d.priority)}>{d.priority}</td>
                              <td className={statusClass(d.status)}>{d.status}</td>
                              <td
                                className="action-cell"
                                ref={openMenu === d._id ? menuRef : null}
                              >
                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    setOpenMenu(openMenu === d._id ? null : d._id)
                                  }
                                >
                                  <MoreVertical size={18} />
                                </button>

                                {openMenu === d._id && (
                                  <div className="action-menu">
                                    <div onClick={() => {
                                      navigate(`/admin/disputes/${d._id}`);
                                      setOpenMenu(null);
                                    }}>
                                      View Details
                                    </div>
                                    {d.status === "Pending" && (
                                      <div onClick={() => {
                                        setConfirmResolve(d._id);
                                        setAdminResponse(d.adminResponse || "");
                                        setOpenMenu(null);
                                      }}>
                                        Mark as Resolved
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>

                            {confirmResolve === d._id && (
                              <tr key={`confirm-${d._id}`}>
                                <td colSpan={11}>
                                  <div className="resolve-confirm-row">
                                    <span className="resolve-confirm-label">
                                      Resolve dispute <strong>{d.disputeId}</strong>? Add an optional response:
                                    </span>
                                    <textarea
                                      className="resolve-textarea"
                                      value={adminResponse}
                                      onChange={(e) => setAdminResponse(e.target.value)}
                                      placeholder="Optional admin response to both parties..."
                                      rows={2}
                                    />
                                    <div className="resolve-confirm-actions">
                                      <button
                                        className="confirm-yes"
                                        onClick={() => handleResolve(d._id)}
                                      >
                                        Yes, Resolve
                                      </button>
                                      <button
                                        className="confirm-no"
                                        onClick={() => {
                                          setConfirmResolve(null);
                                          setAdminResponse("");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      )}
                    </tbody>
                  </table>

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
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}