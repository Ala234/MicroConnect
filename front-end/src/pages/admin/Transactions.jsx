import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export default function Transactions() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [monthFilter, setMonth]   = useState("All");

  const allTransactions = useMemo(() => [
    { id: "#TXN001", brand: "NikeArabia", influencer: "SaraBlogs",  campaign: "Ramadan Collection", amount: 4200,  commission: 10, date: "Apr 28", month: "Apr", status: "Completed" },
    { id: "#TXN002", brand: "GlowCo",    influencer: "AhmedFit",   campaign: "Summer Glow",        amount: 2800,  commission: 10, date: "Apr 27", month: "Apr", status: "Completed" },
    { id: "#TXN003", brand: "LuxBrand",  influencer: "LisaStyle",  campaign: "Eid Special Drop",   amount: 6500,  commission: 12, date: "Apr 26", month: "Apr", status: "Pending"   },
    { id: "#TXN004", brand: "TechStore", influencer: "SaraBlogs",  campaign: "Tech Review 2026",   amount: 1900,  commission: 10, date: "Apr 25", month: "Apr", status: "Completed" },
    { id: "#TXN005", brand: "FoodHub",   influencer: "AhmedFit",   campaign: "Food Week",          amount: 3100,  commission: 10, date: "Apr 24", month: "Apr", status: "Pending"   },
    { id: "#TXN006", brand: "NikeArabia",influencer: "LisaStyle",  campaign: "Spring Drop",        amount: 5200,  commission: 12, date: "Mar 30", month: "Mar", status: "Completed" },
    { id: "#TXN007", brand: "GlowCo",    influencer: "SaraBlogs",  campaign: "Glow Up Campaign",   amount: 3800,  commission: 10, date: "Mar 22", month: "Mar", status: "Completed" },
    { id: "#TXN008", brand: "LuxBrand",  influencer: "AhmedFit",   campaign: "Luxury Fitness",     amount: 7100,  commission: 12, date: "Mar 15", month: "Mar", status: "Failed"    },
    { id: "#TXN009", brand: "TechStore", influencer: "LisaStyle",  campaign: "Gadget Review",      amount: 2400,  commission: 10, date: "Feb 28", month: "Feb", status: "Completed" },
    { id: "#TXN010", brand: "FoodHub",   influencer: "SaraBlogs",  campaign: "Recipe Series",      amount: 1600,  commission: 10, date: "Feb 20", month: "Feb", status: "Completed" },
  ], []);

  const chartData = useMemo(() => [
    { month: "Feb", volume: 4000,  commission: 400  },
    { month: "Mar", volume: 16100, commission: 1788 },
    { month: "Apr", volume: 18500, commission: 1870 },
  ], []);

  const months = useMemo(() => {
  const unique = [...new Set(allTransactions.map((tx) => tx.month))];
  return ["All", ...unique];
}, [allTransactions]);

  const statuses = ["All", "Completed", "Pending", "Failed"];

  const filtered = useMemo(() => {
    return allTransactions.filter((tx) => {
      const matchSearch =
        tx.brand.toLowerCase().includes(search.toLowerCase())      ||
        tx.influencer.toLowerCase().includes(search.toLowerCase()) ||
        tx.campaign.toLowerCase().includes(search.toLowerCase())   ||
        tx.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || tx.status === statusFilter;
      const matchMonth  = monthFilter  === "All" || tx.month  === monthFilter;
      return matchSearch && matchStatus && matchMonth;
    });
  }, [allTransactions, search, statusFilter, monthFilter]);

  const totalVolume     = filtered.reduce((s, t) => s + t.amount, 0);
  const totalCommission = filtered.reduce((s, t) => s + Math.round(t.amount * t.commission / 100), 0);
  const completed       = filtered.filter((t) => t.status === "Completed").length;
  const pending         = filtered.filter((t) => t.status === "Pending").length;

  const tooltipStyle = {
    background: "#1e1e2f",
    border: "none",
    borderRadius: 10,
    color: "white",
  };

  const statusClass = (s) => {
    if (s === "Completed") return "status-resolved";
    if (s === "Pending")   return "status-pending";
    return "status-deleted";
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

        {/* MAIN LAYOUT */}
        <div className="admin-layout">
          <Sidebar onCollapse={setCollapsed} />

          <div className="admin-content">

            {/* HERO */}
            <div className="dashboard-hero">
              <h1>Transactions & Commission</h1>
              <p>Full ledger of platform deals and MicroConnect earnings</p>
            </div>

            {/* STATS */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">SAR {totalVolume.toLocaleString()}</div>
                <div className="stat-title">Total Volume</div>
                <div className="stat-note">Filtered results</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">SAR {totalCommission.toLocaleString()}</div>
                <div className="stat-title">Commission Earned</div>
                <div className="stat-note">MicroConnect's cut</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{completed}</div>
                <div className="stat-title">Completed</div>
                <div className="stat-note">Filtered results</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{pending}</div>
                <div className="stat-title">Pending</div>
                <div className="stat-note">Awaiting settlement</div>
              </div>
            </div>

            {/* CHART */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <div>
                  <h2>Volume vs Commission</h2>
                  <p>Monthly deal volume and MicroConnect earnings</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="#b8c2e4" />
                  <YAxis stroke="#b8c2e4" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="volume"     fill="#4aa8ff" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="commission" fill="#6d5dfc" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* FILTERS */}
            <div className="dashboard-section">
              <div className="users-controls">
                <input
                  className="txn-search"
                  placeholder="Search by brand, influencer, campaign or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="tabs">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      className={statusFilter === s ? "active" : ""}
                      onClick={() => setStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <select className="txn-select"
                    value={monthFilter}
                    onChange={(e) => setMonth(e.target.value)}>
                    {months.map((m) => (
                    <option key={m} value={m}>{m === "All" ? "All Months" : m}</option>
                  ))}
                </select>
              </div>

              {/* TABLE */}
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Brand</th>
                      <th>Influencer</th>
                      <th>Campaign</th>
                      <th>Deal Amount</th>
                      <th>Commission %</th>
                      <th>Commission Earned</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "28px", color: "#b8c2e4" }}>
                          No transactions match your filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((tx) => (
                        <tr key={tx.id}>
                          <td className="txn-id">{tx.id}</td>
                          <td>{tx.brand}</td>
                          <td>{tx.influencer}</td>
                          <td>{tx.campaign}</td>
                          <td className="txn-amount">SAR {tx.amount.toLocaleString()}</td>
                          <td className="txn-date">{tx.commission}%</td>
                          <td className="txn-amount">
                            SAR {Math.round(tx.amount * tx.commission / 100).toLocaleString()}
                          </td>
                          <td className="txn-date">{tx.date}</td>
                          <td className={statusClass(tx.status)}>{tx.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY FOOTER */}
              <div className="txn-summary">
                <span>{filtered.length} transactions</span>
                <span>·</span>
                <span>Volume: <strong>SAR {totalVolume.toLocaleString()}</strong></span>
                <span>·</span>
                <span>Commission: <strong>SAR {totalCommission.toLocaleString()}</strong></span>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}