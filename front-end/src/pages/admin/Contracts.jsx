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
  const [contracts, setContracts] = useState([
    { id: "1005578", brand: "NikeArabia", influencer: "SaraBlogs",  campaign: "Ramadan Collection", value: 4200, start: "Jan 10", end: "Feb 10", status: "Completed" },
    { id: "1063843", brand: "GlowCo",    influencer: "AhmedFit",   campaign: "Summer Glow",        value: 2800, start: "Feb 01", end: "Mar 01", status: "Active"    },
    { id: "1042217", brand: "LuxBrand",  influencer: "LisaStyle",  campaign: "Eid Special Drop",   value: 6500, start: "Mar 15", end: "Apr 15", status: "Pending"   },
    { id: "1049999", brand: "TechStore", influencer: "SaraBlogs",  campaign: "Tech Review 2026",   value: 1900, start: "Mar 20", end: "Apr 20", status: "Active"    },
    { id: "1058888", brand: "FoodHub",   influencer: "AhmedFit",   campaign: "Food Week",          value: 3100, start: "Apr 01", end: "Apr 30", status: "Accepted"  },
    { id: "1067777", brand: "NikeArabia",influencer: "LisaStyle",  campaign: "Spring Drop",        value: 5200, start: "Apr 05", end: "May 05", status: "Active"    },
    { id: "1076666", brand: "GlowCo",    influencer: "SaraBlogs",  campaign: "Glow Up Campaign",   value: 3800, start: "Apr 10", end: "May 10", status: "Rejected"  },
    { id: "1085555", brand: "LuxBrand",  influencer: "AhmedFit",   campaign: "Luxury Fitness",     value: 7100, start: "Apr 15", end: "May 15", status: "Active"    },
    { id: "1094444", brand: "TechStore", influencer: "LisaStyle",  campaign: "Gadget Review",      value: 2400, start: "Apr 20", end: "May 20", status: "Pending"   },
  ]);

  const [search,        setSearch]       = useState("");
  const [statusFilter,  setStatusFilter] = useState("All");
  const [openMenu,      setOpenMenu]     = useState(null);
  const [page,          setPage]         = useState(1);

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
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Filtering ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch =
        c.id.includes(search)                                        ||
        c.brand.toLowerCase().includes(search.toLowerCase())         ||
        c.influencer.toLowerCase().includes(search.toLowerCase())    ||
        c.campaign.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contracts, search, statusFilter]);

  // ── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / CONTRACTS_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * CONTRACTS_PER_PAGE,
    page * CONTRACTS_PER_PAGE
  );

  // ── Stats ──────────────────────────────────────────────
  const total     = contracts.length;
  const active    = contracts.filter((c) => c.status === "Active").length;
  const pending   = contracts.filter((c) => c.status === "Pending").length;
  const completed = contracts.filter((c) => c.status === "Completed").length;

  // ── Helpers ────────────────────────────────────────────
  const statusClass = (status) => {
    switch (status) {
      case "Active":    return "status-active";
      case "Completed": return "status-completed";
      case "Pending":   return "status-pending";
      case "Accepted":  return "status-accepted";
      case "Rejected":  return "status-deleted";
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
              <h1>Contracts</h1>
              <p>Monitor all platform contracts between brands and influencers</p>
            </div>

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
                <div className="stat-note">Awaiting action</div>
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
                {["All", "Active", "Pending", "Accepted", "Completed", "Rejected"].map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
                ))}
              </select>
            </div>

            {/* COUNT */}
            <div className="txn-summary">
              <span>Showing <strong>{filtered.length}</strong> of <strong>{total}</strong> contracts</span>
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
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "28px", color: "#b8c2e4" }}>
                        No contracts match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((contract, index) => (
                      <tr key={contract.id}>
                        <td>{(page - 1) * CONTRACTS_PER_PAGE + index + 1}</td>
                        <td className="txn-id">#{contract.id}</td>
                        <td>{contract.brand}</td>
                        <td>{contract.influencer}</td>
                        <td>{contract.campaign}</td>
                        <td className="txn-amount">SAR {contract.value.toLocaleString()}</td>
                        <td className="txn-date">{contract.start}</td>
                        <td className="txn-date">{contract.end}</td>
                        <td className={statusClass(contract.status)}>{contract.status}</td>
                        <td className="action-cell" ref={openMenu === contract.id ? menuRef : null}>
                          <button
                            className="action-btn"
                            onClick={() => setOpenMenu(openMenu === contract.id ? null : contract.id)}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenu === contract.id && (
                            <div className="action-menu">
                              <div onClick={() => {
                                navigate(`/admin/contracts/${contract.id}`);
                                // TODO: navigate to real contract detail page
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

          </div>
        </div>
      </div>
    </div>
  );
}