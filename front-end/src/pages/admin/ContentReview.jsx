import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { MoreVertical } from "lucide-react";

const CONTENT_PER_PAGE = 5;

export default function ContentReview() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── State ──────────────────────────────────────────────
  const [influencers,   setInfluencers]  = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [search,        setSearch]       = useState("");
  const [statusFilter,  setStatusFilter] = useState("All");
  const [openMenu,      setOpenMenu]     = useState(null);
  const [confirmAction, setConfirmAction]= useState(null);
  const [successMsg,    setSuccessMsg]   = useState("");
  const [error,         setError]        = useState("");
  const [page,          setPage]         = useState(1);

  const menuRef = useRef(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // ── Fetch influencers ──────────────────────────────────
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const res  = await fetch("/api/admin/influencers", { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setInfluencers(data);
      } catch (err) {
        setError(err.message || "Failed to load influencers");
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

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
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Show success message ───────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ── Actions ────────────────────────────────────────────
  const updateBioStatus = async (id, bioStatus) => {
    try {
      const res  = await fetch(`/api/admin/influencers/${id}/bio-status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ bioStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setInfluencers((prev) =>
        prev.map((inf) =>
          inf._id === id ? { ...inf, bioStatus } : inf
        )
      );
      setConfirmAction(null);
      setOpenMenu(null);
      showSuccess(data.message);
    } catch (err) {
      setError(err.message || "Failed to update bio status");
    }
  };

  // ── Stats (derived from real data) ────────────────────
  const totalContent  = influencers.length;
  const approvedCount = influencers.filter((i) => i.bioStatus === "approved" || !i.bioStatus).length;
  const flaggedCount  = influencers.filter((i) => i.bioStatus === "flagged").length;

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return influencers.filter((inf) => {
      const bioStatus = inf.bioStatus || "approved";

      const matchSearch =
        inf.name?.toLowerCase().includes(search.toLowerCase())          ||
        inf.email?.toLowerCase().includes(search.toLowerCase())         ||
        inf.bio?.toLowerCase().includes(search.toLowerCase())           ||
        inf.userId?.name?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All"      ||
        (statusFilter === "Approved" && bioStatus === "approved") ||
        (statusFilter === "Flagged"  && bioStatus === "flagged");

      return matchSearch && matchStatus;
    });
  }, [influencers, search, statusFilter]);

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / CONTENT_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * CONTENT_PER_PAGE,
    page * CONTENT_PER_PAGE
  );

  // ── Helpers ────────────────────────────────────────────
  const bioStatusClass = (bioStatus) => {
    if (!bioStatus || bioStatus === "approved") return "status-resolved";
    return "status-suspended";
  };

  const bioStatusLabel = (bioStatus) => {
    if (!bioStatus || bioStatus === "approved") return "Approved";
    return "Flagged";
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
              <h1>Content Review</h1>
              <p>Review influencer bios and flag any conflicting interests</p>
            </div>

            {/* SUCCESS */}
            {successMsg && (
              <div className="settings-success">{successMsg}</div>
            )}

            {/* ERROR */}
            {error && (
              <div className="confirm-row">
                <span style={{ color: "#ef4444" }}>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="txn-summary">
                <span style={{ color: "#b8c2e4" }}>Loading influencers...</span>
              </div>
            ) : (
              <>
                {/* STATS */}
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <div className="stat-number">{totalContent}</div>
                    <div className="stat-title">Total Influencers</div>
                    <div className="stat-note">Registered on platform</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{approvedCount}</div>
                    <div className="stat-title">Approved Bios</div>
                    <div className="stat-note">No issues found</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{flaggedCount}</div>
                    <div className="stat-title">Flagged Bios</div>
                    <div className="stat-note">Needs update</div>
                  </div>
                </div>

                {/* CONTROLS */}
                <div className="users-controls">
                  <input
                    className="txn-search"
                    type="text"
                    placeholder="Search by name, email or bio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="txn-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {["All", "Approved", "Flagged"].map((s) => (
                      <option key={s} value={s}>
                        {s === "All" ? "All Statuses" : s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COUNT */}
                <div className="txn-summary">
                  <span>
                    Showing <strong>{filtered.length}</strong> of{" "}
                    <strong>{totalContent}</strong> influencers
                  </span>
                </div>

                {/* TABLE */}
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Niche</th>
                        <th>Bio</th>
                        <th>Bio Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              textAlign: "center",
                              padding: "28px",
                              color: "#b8c2e4",
                            }}
                          >
                            No influencers match your filters.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((inf, index) => (
                          <>
                            <tr key={inf._id}>
                              <td>{(page - 1) * CONTENT_PER_PAGE + index + 1}</td>
                              <td>{inf.userId?.name || inf.name}</td>
                              <td>{inf.userId?.email || inf.email}</td>
                              <td className="txn-date">{inf.niche || "—"}</td>
                              <td
                                className="dispute-reason"
                                title={inf.bio || "No bio provided"}
                              >
                                {inf.bio || <span style={{ color: "#64748b" }}>No bio</span>}
                              </td>
                              <td className={bioStatusClass(inf.bioStatus)}>
                                {bioStatusLabel(inf.bioStatus)}
                              </td>
                              <td
                                className="action-cell"
                                ref={openMenu === inf._id ? menuRef : null}
                              >
                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === inf._id ? null : inf._id
                                    )
                                  }
                                >
                                  <MoreVertical size={18} />
                                </button>

                                {openMenu === inf._id && (
                                  <div className="action-menu">
                                    <div
                                      onClick={() =>
                                        navigate(`/admin/users/${inf.userId?._id || inf._id}?from=content-review`)
                                      }
                                    >
                                      View Full Profile
                                    </div>
                                    {(inf.bioStatus === "flagged") && (
                                      <div
                                        onClick={() => {
                                          setConfirmAction({ id: inf._id, type: "approve" });
                                          setOpenMenu(null);
                                        }}
                                      >
                                        Approve Bio
                                      </div>
                                    )}
                                    {(!inf.bioStatus || inf.bioStatus === "approved") && (
                                      <div
                                        className="danger"
                                        onClick={() => {
                                          setConfirmAction({ id: inf._id, type: "flag" });
                                          setOpenMenu(null);
                                        }}
                                      >
                                        Flag Bio
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>

                            {/* INLINE CONFIRM */}
                            {confirmAction?.id === inf._id && (
                              <tr key={`confirm-${inf._id}`}>
                                <td colSpan={7}>
                                  <div className="confirm-row">
                                    <span>
                                      {confirmAction.type === "flag" ? (
                                        <>
                                          Flag bio of{" "}
                                          <strong>
                                            {inf.userId?.name || inf.name}
                                          </strong>
                                          ?
                                        </>
                                      ) : (
                                        <>
                                          Approve bio of{" "}
                                          <strong>
                                            {inf.userId?.name || inf.name}
                                          </strong>
                                          ?
                                        </>
                                      )}
                                    </span>
                                    <button
                                      className="confirm-yes"
                                      onClick={() =>
                                        updateBioStatus(
                                          inf._id,
                                          confirmAction.type === "flag"
                                            ? "flagged"
                                            : "approved"
                                        )
                                      }
                                    >
                                      Yes,{" "}
                                      {confirmAction.type === "flag"
                                        ? "Flag"
                                        : "Approve"}
                                    </button>
                                    <button
                                      className="confirm-no"
                                      onClick={() => setConfirmAction(null)}
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
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
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