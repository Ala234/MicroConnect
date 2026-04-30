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
  const [contents, setContents] = useState([
    { id: 1, influencer: "SaraBlogs",  campaign: "Ramadan Collection", category: "Lifestyle", content: "Check out my latest Ramadan haul from NikeArabia! Amazing deals this season.",          flagReason: "Misleading product claims",      date: "Apr 28", status: "Pending"  },
    { id: 2, influencer: "AhmedFit",   campaign: "Summer Glow",        category: "Fitness",   content: "Just finished my morning workout with GlowCo supplements. Feeling energized!",          flagReason: "Unverified health claims",        date: "Apr 26", status: "Flagged"  },
    { id: 3, influencer: "LisaStyle",  campaign: "Eid Special Drop",   category: "Beauty",    content: "New makeup tutorial featuring LuxBrand's Eid collection. Full glam look!",              flagReason: "Competitor brand visible",        date: "Apr 24", status: "Pending"  },
    { id: 4, influencer: "SaraBlogs",  campaign: "Tech Review 2026",   category: "Tech",      content: "Top 5 gadgets from TechStore you need in 2026. Full honest review.",                    flagReason: "Undisclosed sponsorship",         date: "Apr 22", status: "Approved" },
    { id: 5, influencer: "AhmedFit",   campaign: "Food Week",          category: "Food",      content: "Baking FoodHub's signature cookies today. Recipe link in bio!",                         flagReason: "Inappropriate language",          date: "Apr 20", status: "Removed"  },
    { id: 6, influencer: "LisaStyle",  campaign: "Spring Drop",        category: "Fashion",   content: "Spring fashion haul with NikeArabia. These pieces are absolutely stunning!",            flagReason: "Copyright music in video",        date: "Apr 18", status: "Pending"  },
    { id: 7, influencer: "SaraBlogs",  campaign: "Glow Up Campaign",   category: "Lifestyle", content: "My honest review of GlowCo's new skincare line. Results after 2 weeks.",               flagReason: "Before/after claims unverified",  date: "Apr 15", status: "Flagged"  },
    { id: 8, influencer: "AhmedFit",   campaign: "Luxury Fitness",     category: "Fitness",   content: "LuxBrand's fitness gear review. Worth every riyal for serious athletes.",               flagReason: "Exaggerated performance claims",  date: "Apr 12", status: "Approved" },
  ]);

  const [search,          setSearch]         = useState("");
  const [statusFilter,    setStatusFilter]   = useState("All");
  const [categoryFilter,  setCategoryFilter] = useState("All");
  const [openMenu,        setOpenMenu]       = useState(null);
  const [confirmAction,   setConfirmAction]  = useState(null); // { id, type }
  const [page,            setPage]           = useState(1);

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
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter]);

  // ── Actions ────────────────────────────────────────────
  const handleApprove = (id) => {
    setContents((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "Approved" } : c)
    );
    setOpenMenu(null);
    // TODO: await api.patch(`/content/${id}/approve`)
  };

  const handleFlag = (id) => {
    setContents((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "Flagged" } : c)
    );
    setConfirmAction(null);
    setOpenMenu(null);
    // TODO: await api.patch(`/content/${id}/flag`)
  };

  const handleRemove = (id) => {
    setContents((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "Removed" } : c)
    );
    setConfirmAction(null);
    setOpenMenu(null);
    // TODO: await api.delete(`/content/${id}`)
  };

  // ── Categories (dynamic from data) ────────────────────
  const categories = useMemo(() => {
    const unique = [...new Set(contents.map((c) => c.category))];
    return ["All", ...unique];
  }, [contents]);

  // ── Stats (derived from real data) ────────────────────
  const totalContent  = contents.length;
  const pendingCount  = contents.filter((c) => c.status === "Pending").length;
  const approvedCount = contents.filter((c) => c.status === "Approved").length;
  const removedCount  = contents.filter((c) => c.status === "Removed").length;

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return contents.filter((c) => {
      const matchSearch =
        c.influencer.toLowerCase().includes(search.toLowerCase()) ||
        c.campaign.toLowerCase().includes(search.toLowerCase())   ||
        c.content.toLowerCase().includes(search.toLowerCase());
      const matchStatus   = statusFilter   === "All" || c.status   === statusFilter;
      const matchCategory = categoryFilter === "All" || c.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [contents, search, statusFilter, categoryFilter]);

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / CONTENT_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * CONTENT_PER_PAGE,
    page * CONTENT_PER_PAGE
  );

  // ── Helpers ────────────────────────────────────────────
  const statusClass = (status) => {
    switch (status) {
      case "Pending":  return "status-pending";
      case "Approved": return "status-resolved";
      case "Flagged":  return "status-suspended";
      case "Removed":  return "status-deleted";
      default:         return "";
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
              <h1>Content Review</h1>
              <p>Review flagged content and take appropriate action</p>
            </div>

            {/* STATS */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">{totalContent}</div>
                <div className="stat-title">Total Content</div>
                <div className="stat-note">Submitted for review</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{pendingCount}</div>
                <div className="stat-title">Pending Review</div>
                <div className="stat-note">Awaiting action</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{approvedCount}</div>
                <div className="stat-title">Approved</div>
                <div className="stat-note">Cleared for publishing</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{removedCount}</div>
                <div className="stat-title">Removed</div>
                <div className="stat-note">Taken down</div>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="users-controls">
              <input
                className="txn-search"
                type="text"
                placeholder="Search by influencer, campaign or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="txn-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {["All", "Pending", "Approved", "Flagged", "Removed"].map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                ))}
              </select>
              <select
                className="txn-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                ))}
              </select>
            </div>

            {/* COUNT */}
            <div className="txn-summary">
              <span>Showing <strong>{filtered.length}</strong> of <strong>{totalContent}</strong> items</span>
            </div>

            {/* TABLE */}
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Influencer</th>
                    <th>Campaign</th>
                    <th>Category</th>
                    <th>Content</th>
                    <th>Flag Reason</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", padding: "28px", color: "#b8c2e4" }}>
                        No content matches your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item, index) => (
                      <>
                        <tr key={item.id}>
                          <td>{(page - 1) * CONTENT_PER_PAGE + index + 1}</td>
                          <td>{item.influencer}</td>
                          <td>{item.campaign}</td>
                          <td className="txn-date">{item.category}</td>
                          <td className="dispute-reason" title={item.content}>{item.content}</td>
                          <td className="dispute-reason" title={item.flagReason}>{item.flagReason}</td>
                          <td className="txn-date">{item.date}</td>
                          <td className={statusClass(item.status)}>{item.status}</td>
                          <td className="action-cell" ref={openMenu === item.id ? menuRef : null}>
                            <button
                              className="action-btn"
                              onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenu === item.id && (
                              <div className="action-menu">
                                <div onClick={() => {
                                  navigate(`/admin/content/${item.id}`);
                                  // TODO: navigate to real content detail page
                                }}>
                                  View Details
                                </div>
                                {item.status !== "Approved" && (
                                  <div onClick={() => handleApprove(item.id)}>
                                    Approve
                                  </div>
                                )}
                                {item.status !== "Flagged" && (
                                  <div onClick={() => {
                                    setConfirmAction({ id: item.id, type: "flag" });
                                    setOpenMenu(null);
                                  }}>
                                    Flag Content
                                  </div>
                                )}
                                {item.status !== "Removed" && (
                                  <div
                                    className="danger"
                                    onClick={() => {
                                      setConfirmAction({ id: item.id, type: "remove" });
                                      setOpenMenu(null);
                                    }}
                                  >
                                    Remove Content
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* INLINE CONFIRM */}
                        {confirmAction?.id === item.id && (
                          <tr key={`confirm-${item.id}`}>
                            <td colSpan={9}>
                              <div className="confirm-row">
                                <span>
                                  {confirmAction.type === "remove"
                                    ? <>Are you sure you want to <strong>remove</strong> this content?</>
                                    : <>Are you sure you want to <strong>flag</strong> this content?</>
                                  }
                                </span>
                                <button
                                  className="confirm-yes"
                                  onClick={() =>
                                    confirmAction.type === "remove"
                                      ? handleRemove(item.id)
                                      : handleFlag(item.id)
                                  }
                                >
                                  {confirmAction.type === "remove" ? "Yes, Remove" : "Yes, Flag"}
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