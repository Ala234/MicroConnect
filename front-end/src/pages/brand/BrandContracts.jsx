import "../../styles/dashboard.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiLogOut, FiRefreshCcw } from "react-icons/fi";
import { getMyContracts } from "../../api/contracts";

const getContractKey = (contract) => contract.contractId || contract._id || contract.id;

const getRecordId = (record) => {
  if (!record) return "";
  if (typeof record === "object") return record._id || record.id || "";
  return record;
};

const statusClass = (status) => {
  switch (status) {
    case "Active":
    case "Completed":
      return "status-accepted";
    case "Rejected":
      return "status-deleted";
    case "Pending":
      return "status-pending";
    default:
      return "status-pending";
  }
};

const formatDate = (date) => {
  if (!date) return "Not set";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not set";
  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function BrandContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const contractStats = useMemo(() => ({
    total: contracts.length,
    pending: contracts.filter((contract) => contract.status === "Pending").length,
    active: contracts.filter((contract) => contract.status === "Active").length,
    rejected: contracts.filter((contract) => contract.status === "Rejected").length,
  }), [contracts]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;

    if (!user || user.role !== "brand") {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadContracts = async () => {
      const result = await getMyContracts();
      if (!isMounted) return;

      if (result.success) {
        setContracts(result.contracts || []);
        setErrorMessage("");
      } else {
        setErrorMessage(result.message || "Contracts could not be loaded");
      }
      setLoading(false);
      setRefreshing(false);
    };

    loadContracts();

    const handleFocus = () => {
      loadContracts();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getMyContracts();
    if (result.success) {
      setContracts(result.contracts || []);
      setErrorMessage("");
    } else {
      setErrorMessage(result.message || "Contracts could not be loaded");
    }
    setRefreshing(false);
    setLoading(false);
  };

  const openContract = (contract) => {
    const params = new URLSearchParams({
      contractId: getContractKey(contract),
      state: contract.status || "Pending",
    });
    const campaignId = getRecordId(contract.campaignId || contract.campaign);
    const applicationId = getRecordId(contract.application);
    const influencerId = getRecordId(contract.influencerId || contract.influencer);

    if (campaignId) params.set("campaignId", campaignId);
    if (applicationId) params.set("applicationId", applicationId);
    if (influencerId) params.set("influencer", influencerId);

    navigate(`/contracts?${params.toString()}`);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <div>
              <p className="brand-name">MicroConnect</p>
              <p className="brand-subtitle">Brand Portal</p>
            </div>
          </div>

          <nav className="influencer-top-nav">
            <button className="influencer-nav-link" onClick={() => navigate("/brand")}>
              Campaigns
            </button>
            <button className="influencer-nav-link" onClick={() => navigate("/brand/profile")}>
              Profile
            </button>
            <button className="influencer-nav-link active" onClick={() => navigate("/brand/contracts")}>
              Contracts
            </button>
          </nav>

          <button className="dashboard-logout ghost" onClick={handleLogout}>
            <FiLogOut />
            <span>Log out</span>
          </button>
        </div>

        <div className="dashboard-body">
          <div className="dashboard-hero">
            <h1>Contracts</h1>
            <p>Track contract status directly from MongoDB.</p>
          </div>

          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <h3>{contractStats.total}</h3>
              <p>Total Contracts</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{contractStats.pending}</h3>
              <p>Pending</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{contractStats.active}</h3>
              <p>Active</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{contractStats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Brand Contracts</h2>
                <p>Statuses update from the backend contract records.</p>
              </div>
              <button className="dashboard-primary-btn" onClick={handleRefresh} disabled={refreshing}>
                <FiRefreshCcw />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>

            {errorMessage ? (
              <div className="campaign-filter-empty">{errorMessage}</div>
            ) : loading ? (
              <div className="campaign-filter-empty">Loading contracts...</div>
            ) : contracts.length === 0 ? (
              <div className="campaign-filter-empty">No contracts have been generated yet.</div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Influencer</th>
                      <th>Campaign</th>
                      <th>Value</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Transaction</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={getContractKey(contract)}>
                        <td className="txn-id">{contract.contractId || "Not set"}</td>
                        <td>{contract.influencerName || "Influencer"}</td>
                        <td>{contract.campaignName || "Campaign"}</td>
                        <td className="txn-amount">{contract.value || "Not set"}</td>
                        <td className="txn-date">{formatDate(contract.startDate)}</td>
                        <td className="txn-date">{formatDate(contract.endDate)}</td>
                        <td className={contract.transactionStatus === "Completed" ? "status-resolved" : "status-pending"}>
                          {contract.transactionStatus || "Pending"}
                        </td>
                        <td className={statusClass(contract.status)}>
                          {contract.status || "Pending"}
                        </td>
                        <td>
                          <button className="campaign-view-btn" onClick={() => openContract(contract)}>
                            <FiFileText />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
