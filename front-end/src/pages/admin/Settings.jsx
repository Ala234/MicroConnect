import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Pencil, Trash2, Plus, Check } from "lucide-react";

let nextId = 4;

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
  const [policies, setPolicies] = useState([
    { id: 1, text: "All users must verify their accounts before accessing platform features." },
    { id: 2, text: "Payments are processed within 3-5 business days after contract completion." },
    { id: 3, text: "Contracts must be approved by both parties before any work begins." },
  ]);

  const [editingId,    setEditingId]    = useState(null); // null = adding new
  const [formText,     setFormText]     = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [successMsg,   setSuccessMsg]   = useState("");

  // ── Commission State ───────────────────────────────────
  const [commission,       setCommission]      = useState(10);
  const [editCommission,   setEditCommission]  = useState(false);
  const [tempCommission,   setTempCommission]  = useState(10);

  // ── Helpers ────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ── Policy Handlers ────────────────────────────────────
  const handleAddClick = () => {
    setEditingId(null);
    setFormText("");
    setShowForm(true);
  };

  const handleEditClick = (policy) => {
    setEditingId(policy.id);
    setFormText(policy.text);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formText.trim()) return;

    if (editingId === null) {
      // Add new
      setPolicies((prev) => [...prev, { id: nextId++, text: formText.trim() }]);
      showSuccess("Policy added successfully.");
      // TODO: await api.post('/policies', { text: formText })
    } else {
      // Update existing
      setPolicies((prev) =>
        prev.map((p) => p.id === editingId ? { ...p, text: formText.trim() } : p)
      );
      showSuccess("Policy updated successfully.");
      // TODO: await api.put(`/policies/${editingId}`, { text: formText })
    }

    setShowForm(false);
    setFormText("");
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    setConfirmDel(null);
    if (showForm && editingId === id) {
      setShowForm(false);
      setEditingId(null);
    }
    showSuccess("Policy deleted.");
    // TODO: await api.delete(`/policies/${id}`)
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormText("");
    setEditingId(null);
  };

  // ── Commission Handlers ────────────────────────────────
  const handleCommissionSave = () => {
    const val = parseFloat(tempCommission);
    if (isNaN(val) || val < 0 || val > 100) return;
    setCommission(val);
    setEditCommission(false);
    showSuccess(`Commission rate updated to ${val}%.`);
    // TODO: await api.put('/settings/commission', { rate: val })
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
                {policies.map((p, index) => (
                  <>
                    <div key={p.id} className="policy-item">
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
                          onClick={() => setConfirmDel(p.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* INLINE DELETE CONFIRM */}
                    {confirmDel === p.id && (
                      <div key={`confirm-${p.id}`} className="confirm-row">
                        <span>Delete policy <strong>{index + 1}</strong>?</span>
                        <button
                          className="confirm-yes"
                          onClick={() => handleDelete(p.id)}
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
                ))}
              </div>

              {/* ADD / EDIT FORM */}
              {showForm && (
                <div className="policy-form">
                  <div className="policy-input">
                    <label>
                      {editingId === null ? "New Policy" : `Editing Policy ${policies.findIndex((p) => p.id === editingId) + 1}`}
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

          </div>
        </div>
      </div>
    </div>
  );
}