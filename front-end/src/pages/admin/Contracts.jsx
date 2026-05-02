import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { MoreVertical } from "lucide-react";

const CONTRACTS_PER_PAGE = 5;

export default function Contracts() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── State ──────────────────────────────────────────────
  const [contracts,     setContracts]    = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [error,         setError]        = useState("");
  const [search,        setSearch]       = useState("");
  const [statusFilter,  setStatusFilter] = useState("All");
  const [openMenu,      setOpenMenu]     = useState(null);
  const [page,          setPage]         = useState(1);

  const menuRef = useRef(null);

  // ── Fetch Contracts ────────────────────────────────────
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const res  = await fetch("/api/admin/contracts", { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setContracts(data);
      } catch (err) {
        setError(err.message || "Failed to load contracts");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
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

  // ── Stats (derived from real data) ────────────────────
  const total     = contracts.length;
  const active    = contracts.filter((c) => c.status === "Active").length;
  const pending   = contracts.filter((c) => c.status === "Pending").length;
  const completed = contracts.filter((c) => c.status === "Completed").length;

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const brand      = c.brandName || c.brand?.name || c.brandId?.companyName || c.brandId?.name || "";
      const influencer = c.influencerName || c.influencer?.name || c.influencerId?.name || "";
      const campaign   = c.campaignName || c.campaign?.name || c.campaign?.title || c.campaignId?.name || c.campaignId?.title || "";

      const matchSearch =
        c.contractId?.toLowerCase().includes(search.toLowerCase()) ||
        brand.toLowerCase().includes(search.toLowerCase())         ||
        influencer.toLowerCase().includes(search.toLowerCase())    ||
        campaign.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "All" || c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [contracts, search, statusFilter]);

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / CONTRACTS_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * CONTRACTS_PER_PAGE,
    page * CONTRACTS_PER_PAGE
  );

  // ── Helpers ────────────────────────────────────────────
  const statusClass = (status) => {
    switch (status) {
      case "Active":    return "status-accepted";
      case "Completed": return "status-completed";
      case "Pending":   return "status-pending";
      case "Rejected":  return "status-deleted";
      default:          return "";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
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
              <h1>Contracts</h1>
              <p>Monitor all platform contracts between brands and influencers</p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="confirm-row">
                <span className="error-text">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="txn-summary">
                <span className="loading-text">Loading contracts...</span>
              </div>
            ) : (
              <>
                {/* STATS */}
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <div className="stat-number">{total}</div>
                    <div className="stat-title">Total Contracts</div>
                    <div className="stat-note">All time</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{active}</div>
                    <div className="stat-title">Active</div>
                    <div className="stat-note">Currently running</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{pending}</div>
                    <div className="stat-title">Pending</div>
                    <div className="stat-note">Awaiting response</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{completed}</div>
                    <div className="stat-title">Completed</div>
                    <div className="stat-note">Successfully closed</div>
                  </div>
                </div>

                {/* CONTROLS */}
                <div className="users-controls">
                  <input
                    className="txn-search"
                    type="text"
                    placeholder="Search by ID, brand, influencer or campaign..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="txn-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {["All", "Pending", "Active", "Completed", "Rejected"].map((s) => (
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
                    <strong>{total}</strong> contracts
                  </span>
                </div>

                {/* TABLE */}
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>ID</th>
                        <th>Brand</th>
                        <th>Influencer</th>
                        <th>Campaign</th>
                        <th>Value</th>
                        <th>Commission</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="table-empty-cell">
                            No contracts match your filters.
                          </td>
                        </tr>
                      ) : (
                        paginated.map((contract, index) => (
                          <tr key={contract._id}>
                            <td>{(page - 1) * CONTRACTS_PER_PAGE + index + 1}</td>
                            <td className="txn-id">{contract.contractId}</td>
                            <td>{contract.brandName || contract.brand?.name || contract.brandId?.companyName || contract.brandId?.name || "—"}</td>
                            <td>{contract.influencerName || contract.influencer?.name || contract.influencerId?.name || "—"}</td>
                            <td>{contract.campaignName || contract.campaign?.name || contract.campaign?.title || contract.campaignId?.name || contract.campaignId?.title || "—"}</td>
                            <td className="txn-amount">
                              {contract.value || (contract.totalAmount ? `SAR ${contract.totalAmount.toLocaleString()}` : "—")}
                            </td>
                            <td className="txn-date">{contract.commissionRate}%</td>
                            <td className="txn-date">{formatDate(contract.startDate)}</td>
                            <td className="txn-date">{formatDate(contract.endDate)}</td>
                            <td className={contract.transactionStatus === "Completed" ? "status-resolved" : "status-pending"}>
                              {contract.transactionStatus || "Pending"}
                            </td>
                            <td className={statusClass(contract.status)}>
                              {contract.status}
                            </td>
                            <td
                              className="action-cell"
                              ref={openMenu === contract._id ? menuRef : null}
                            >
                              <button
                                className="action-btn"
                                onClick={() =>
                                  setOpenMenu(openMenu === contract._id ? null : contract._id)
                                }
                              >
                                <MoreVertical size={18} />
                              </button>

                              {openMenu === contract._id && (
                                <div className="action-menu">
                                  <div onClick={() => {
                                    navigate(`/admin/contracts/${contract._id}`);
                                    setOpenMenu(null);
                                  }}>
                                    View Details
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
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
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
