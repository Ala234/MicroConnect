import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Pencil, Trash2, Plus, Check } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── Policies State ─────────────────────────────────────
  const [policies,    setPolicies]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [editingId,   setEditingId]  = useState(null);
  const [formText,    setFormText]   = useState("");
  const [showForm,    setShowForm]   = useState(false);
  const [confirmDel,  setConfirmDel] = useState(null);
  const [successMsg,  setSuccessMsg] = useState("");
  const [error,       setError]      = useState("");

  // ── Commission State ───────────────────────────────────
  const [commission,      setCommission]     = useState(10);
  const [editCommission,  setEditCommission] = useState(false);
  const [tempCommission,  setTempCommission] = useState(10);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // ── Helpers ────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ── Fetch Policies ─────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes, commissionRes] = await Promise.all([
          fetch("/api/admin/policies",   { headers }),
          fetch("/api/admin/commission", { headers }),
        ]);

        const policiesData   = await policiesRes.json();
        const commissionData = await commissionRes.json();

        if (!policiesRes.ok)   throw new Error(policiesData.message);
        if (!commissionRes.ok) throw new Error(commissionData.message);

        setPolicies(policiesData);
        setCommission(commissionData.rate);
        setTempCommission(commissionData.rate);
      } catch (err) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Policy Handlers ────────────────────────────────────
  const handleAddClick = () => {
    setEditingId(null);
    setFormText("");
    setShowForm(true);
  };

  const handleEditClick = (policy) => {
    setEditingId(policy._id);
    setFormText(policy.text);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formText.trim()) return;

    try {
      if (editingId === null) {
        // Add new
        const res  = await fetch("/api/admin/policies", {
          method: "POST",
          headers,
          body: JSON.stringify({ text: formText.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setPolicies((prev) => [...prev, data.policy]);
        showSuccess("Policy added successfully.");
      } else {
        // Update existing
        const res  = await fetch(`/api/admin/policies/${editingId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ text: formText.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setPolicies((prev) =>
          prev.map((p) => p._id === editingId ? data.policy : p)
        );
        showSuccess("Policy updated successfully.");
      }

      setShowForm(false);
      setFormText("");
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Failed to save policy");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`/api/admin/policies/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPolicies((prev) => prev.filter((p) => p._id !== id));
      setConfirmDel(null);
      if (showForm && editingId === id) {
        setShowForm(false);
        setEditingId(null);
      }
      showSuccess("Policy deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete policy");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormText("");
    setEditingId(null);
  };

  // ── Commission Handlers ────────────────────────────────
  const handleCommissionSave = async () => {
    const val = parseFloat(tempCommission);
    if (isNaN(val) || val < 0 || val > 100) return;

    try {
      const res  = await fetch("/api/admin/commission", {
        method: "PUT",
        headers,
        body: JSON.stringify({ rate: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCommission(val);
      setEditCommission(false);
      showSuccess(`Commission rate updated to ${val}%.`);
    } catch (err) {
      setError(err.message || "Failed to update commission rate");
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
              <h1>Settings</h1>
              <p>Manage platform policies and configuration</p>
            </div>

            {/* SUCCESS MESSAGE */}
            {successMsg && (
              <div className="settings-success">
                <Check size={16} />
                {successMsg}
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="confirm-row">
                <span style={{ color: "#ef4444" }}>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="txn-summary">
                <span style={{ color: "#b8c2e4" }}>Loading settings...</span>
              </div>
            ) : (
              <>
                {/* COMMISSION SECTION */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h2>Commission Rate</h2>
                      <p>Platform-wide default commission on all deals</p>
                    </div>
                  </div>

                  <div className="commission-row">
                    {editCommission ? (
                      <>
                        <input
                          className="commission-input"
                          type="number"
                          min="0"
                          max="100"
                          value={tempCommission}
                          onChange={(e) => setTempCommission(e.target.value)}
                        />
                        <span className="commission-pct">%</span>
                        <button
                          className="dashboard-primary-btn"
                          onClick={handleCommissionSave}
                        >
                          Save
                        </button>
                        <button
                          className="settings-cancel-btn"
                          onClick={() => {
                            setEditCommission(false);
                            setTempCommission(commission);
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="commission-value">{commission}%</span>
                        <button
                          className="settings-edit-btn"
                          onClick={() => {
                            setTempCommission(commission);
                            setEditCommission(true);
                          }}
                        >
                          <Pencil size={15} /> Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* POLICIES SECTION */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h2>Platform Policies</h2>
                      <p>{policies.length} active policies</p>
                    </div>
                    <button
                      className="dashboard-primary-btn"
                      onClick={handleAddClick}
                    >
                      <Plus size={16} /> Add Policy
                    </button>
                  </div>

                  {/* POLICY LIST */}
                  <div className="policies-list">
                    {policies.length === 0 ? (
                      <p style={{ color: "#b8c2e4", fontSize: 14 }}>
                        No policies yet. Add one above.
                      </p>
                    ) : (
                      policies.map((p, index) => (
                        <>
                          <div key={p._id} className="policy-item">
                            <span className="policy-number">{index + 1}.</span>
                            <p style={{ flex: 1 }}>{p.text}</p>
                            <div className="policy-actions">
                              <button
                                className="settings-icon-btn"
                                onClick={() => handleEditClick(p)}
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className="settings-icon-btn danger"
                                onClick={() => setConfirmDel(p._id)}
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* INLINE DELETE CONFIRM */}
                          {confirmDel === p._id && (
                            <div key={`confirm-${p._id}`} className="confirm-row">
                              <span>Delete policy <strong>{index + 1}</strong>?</span>
                              <button
                                className="confirm-yes"
                                onClick={() => handleDelete(p._id)}
                              >
                                Yes, Delete
                              </button>
                              <button
                                className="confirm-no"
                                onClick={() => setConfirmDel(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </>
                      ))
                    )}
                  </div>

                  {/* ADD / EDIT FORM */}
                  {showForm && (
                    <div className="policy-form">
                      <div className="policy-input">
                        <label>
                          {editingId === null
                            ? "New Policy"
                            : `Editing Policy ${policies.findIndex((p) => p._id === editingId) + 1}`
                          }
                        </label>
                        <textarea
                          value={formText}
                          onChange={(e) => setFormText(e.target.value)}
                          placeholder="Enter policy text..."
                          rows={3}
                        />
                      </div>
                      <div className="settings-form-actions">
                        <button
                          className="dashboard-primary-btn"
                          onClick={handleSave}
                          disabled={!formText.trim()}
                        >
                          {editingId === null ? "Add Policy" : "Save Changes"}
                        </button>
                        <button
                          className="settings-cancel-btn"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}