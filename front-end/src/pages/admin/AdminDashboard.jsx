import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import Sidebar from "./Sidebar";

import SaraBImage from "../../assets/images/SaraBlogs-Profile.jpg";
import AhmedFImage from "../../assets/images/AhmedFit-Profile.jpg";
import LisaSImage from "../../assets/images/Lisa-Profile.jpg";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const earningsData = useMemo(() => [
    { month: "Jan", revenue: 20000, commission: 8000  },
    { month: "Feb", revenue: 30000, commission: 12500 },
    { month: "Mar", revenue: 25000, commission: 10200 },
    { month: "Apr", revenue: 40000, commission: 15800 },
    { month: "May", revenue: 48000, commission: 18900 },
  ], []);

  const newUsersData = useMemo(() => [
    { month: "Jan", brands: 12, influencers: 30 },
    { month: "Feb", brands: 18, influencers: 45 },
    { month: "Mar", brands: 14, influencers: 38 },
    { month: "Apr", brands: 22, influencers: 60 },
    { month: "May", brands: 28, influencers: 72 },
  ], []);

  const disputesData = useMemo(() => [
    { month: "Jan", opened: 4, resolved: 3 },
    { month: "Feb", opened: 7, resolved: 5 },
    { month: "Mar", opened: 5, resolved: 6 },
    { month: "Apr", opened: 9, resolved: 7 },
    { month: "May", opened: 6, resolved: 8 },
  ], []);

  const campaignStatusData = useMemo(() => [
    { name: "Active",    value: 42 },
    { name: "Completed", value: 31 },
    { name: "Pending",   value: 13 },
  ], []);

  const PIE_COLORS = ["#4aa8ff", "#6d5dfc", "#a78bfa"];

  const recentTransactions = useMemo(() => [
    { id: "#TXN001", from: "NikeArabia", to: "SaraBlogs", amount: "SAR 4,200", date: "Apr 28", status: "Completed" },
    { id: "#TXN002", from: "GlowCo",    to: "AhmedFit",  amount: "SAR 2,800", date: "Apr 27", status: "Completed" },
    { id: "#TXN003", from: "LuxBrand",  to: "LisaStyle", amount: "SAR 6,500", date: "Apr 26", status: "Pending"   },
    { id: "#TXN004", from: "TechStore", to: "SaraBlogs", amount: "SAR 1,900", date: "Apr 25", status: "Completed" },
    { id: "#TXN005", from: "FoodHub",   to: "AhmedFit",  amount: "SAR 3,100", date: "Apr 24", status: "Pending"   },
  ], []);

  const activityFeed = useMemo(() => [
    { type: "user",     text: "New brand registered: NikeArabia",            time: "2 hrs ago"  },
    { type: "campaign", text: "Campaign launched: Ramadan Collection 2026",  time: "4 hrs ago"  },
    { type: "dispute",  text: "Dispute opened between SaraBlogs & LuxBrand", time: "6 hrs ago"  },
    { type: "campaign", text: "Campaign completed: Eid Special Drop",        time: "Yesterday"  },
    { type: "payment",  text: "Commission earned: SAR 3,200 from GlowCo",    time: "Yesterday"  },
    { type: "content",  text: "Content flagged for review: AhmedFit post",   time: "2 days ago" },
  ], []);

  const topBrands = useMemo(() => [
    { name: "NikeArabia", spend: "SAR 18,400" },
    { name: "GlowCo",     spend: "SAR 12,300" },
    { name: "LuxBrand",   spend: "SAR 9,800"  },
  ], []);

  const topCampaigns = useMemo(() => [
    { name: "Ramadan Collection", engagement: "94%", brand: "NikeArabia" },
    { name: "Eid Special Drop",   engagement: "88%", brand: "GlowCo"     },
    { name: "Summer Glow",        engagement: "81%", brand: "LuxBrand"   },
  ], []);

  const tooltipStyle = {
    background: "#1e1e2f",
    border: "none",
    borderRadius: 10,
    color: "white",
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
              <h1>Admin Dashboard</h1>
              <p>Monitor platform activity and manage the system</p>
            </div>

            {/* STATS */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-number">1,500</div>
                <div className="stat-title">Total Users</div>
                <div className="stat-note">620 Brands · 880 Influencers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">86</div>
                <div className="stat-title">Active Campaigns</div>
                <div className="stat-note">13 pending · 31 completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">11</div>
                <div className="stat-title">Open Disputes</div>
                <div className="stat-note">3 high priority</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">SAR 125K</div>
                <div className="stat-title">Total Revenue</div>
                <div className="stat-note">Commission: SAR 48K</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">7</div>
                <div className="stat-title">Content Flagged</div>
                <div className="stat-note">Awaiting review</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">54</div>
                <div className="stat-title">Active Contracts</div>
                <div className="stat-note">8 expiring this week</div>
              </div>
            </div>

            {/* REVENUE + DONUT */}
            <div className="charts-row-main">
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h2>Revenue vs Commission</h2>
                    <p>Monthly breakdown</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#b8c2e4" />
                    <YAxis stroke="#b8c2e4" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue"    stroke="#4aa8ff" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="commission" stroke="#6d5dfc" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="dashboard-section donut-section">
                <div className="dashboard-section-header">
                  <div>
                    <h2>Campaigns</h2>
                    <p>Status breakdown</p>
                  </div>
                </div>
                <PieChart width={200} height={200}>
                  <Pie data={campaignStatusData} cx={95} cy={95} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={4}>
                    {campaignStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
                <div className="donut-legend">
                  {campaignStatusData.map((d, i) => (
                    <div key={i} className="donut-legend-item">
                      <div className="donut-legend-dot" style={{ background: PIE_COLORS[i] }} />
                      <span className="donut-legend-label">{d.name}</span>
                      <span className="donut-legend-value">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NEW USERS + DISPUTES */}
            <div className="charts-row-half">
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h2>New Users</h2>
                    <p>Brands vs Influencers per month</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={newUsersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#b8c2e4" />
                    <YAxis stroke="#b8c2e4" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="brands"      fill="#4aa8ff" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="influencers" fill="#6d5dfc" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <div>
                    <h2>Disputes</h2>
                    <p>Opened vs Resolved per month</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={disputesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" stroke="#b8c2e4" />
                    <YAxis stroke="#b8c2e4" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="opened"   fill="#ef4444" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="resolved" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RECENT TRANSACTIONS */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <div>
                  <h2>Recent Transactions</h2>
                  <p>Last 5 platform transactions</p>
                </div>
                <button className="dashboard-primary-btn" onClick={() => navigate("/transactions")}>
                  View All
                </button>
              </div>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="txn-id">{tx.id}</td>
                        <td>{tx.from}</td>
                        <td>{tx.to}</td>
                        <td className="txn-amount">{tx.amount}</td>
                        <td className="txn-date">{tx.date}</td>
                        <td className={tx.status === "Completed" ? "status-resolved" : "status-pending"}>
                          {tx.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOP PERFORMERS */}
            <div className="top-performers-row">

              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <div><h2>Top Influencers</h2></div>
                </div>
                <div className="dashboard-campaign-list">
                  {[
                    { name: "SaraBlogs", img: SaraBImage  },
                    { name: "AhmedFit",  img: AhmedFImage },
                    { name: "LisaStyle", img: LisaSImage  },
                  ].map((inf) => (
                    <div className="dashboard-campaign-item" key={inf.name}>
                      <img src={inf.img} alt={inf.name} className="influencer-img" />
                      <div className="performer-name">{inf.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <div><h2>Top Brands</h2></div>
                </div>
                <div className="dashboard-campaign-list">
                  {topBrands.map((b) => (
                    <div className="dashboard-campaign-item" key={b.name}>
                      <div className="performer-avatar">{b.name[0]}</div>
                      <div>
                        <div className="performer-name">{b.name}</div>
                        <div className="performer-note">{b.spend} spent</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <div><h2>Top Campaigns</h2></div>
                </div>
                <div className="dashboard-campaign-list">
                  {topCampaigns.map((c) => (
                    <div className="dashboard-campaign-item" key={c.name}>
                      <div className="performer-avatar performer-avatar--purple">#</div>
                      <div>
                        <div className="performer-name">{c.name}</div>
                        <div className="performer-note">{c.engagement} engagement · {c.brand}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ACTIVITY FEED */}
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest actions across the platform</p>
                </div>
              </div>
              <div className="dashboard-campaign-list">
                {activityFeed.map((item, i) => (
                  <div className="dashboard-campaign-item activity-item" key={i}>
                    <div className={`activity-dot activity-dot--${item.type}`} />
                    <p className="activity-text">{item.text}</p>
                    <span className="activity-time">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}