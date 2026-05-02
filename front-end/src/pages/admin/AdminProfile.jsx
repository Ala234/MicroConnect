import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Pencil, Check, X } from "lucide-react";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ── State ──────────────────────────────────────────────
  const [profile,     setProfile]    = useState(null);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState("");
  const [successMsg,  setSuccessMsg] = useState("");

  // ── Edit Name ──────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [newName,     setNewName]     = useState("");

  // ── Edit Password ──────────────────────────────────────
  const [editingPass, setEditingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setError("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setSuccessMsg("");
    setTimeout(() => setError(""), 4000);
  };

  // ── Fetch Profile ──────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await fetch("/api/admin/profile", { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProfile(data);
        setNewName(data.name);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Update Name ────────────────────────────────────────
  const handleNameSave = async () => {
    if (!newName.trim()) return;
    try {
      const res  = await fetch("/api/admin/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile(data.user);
      setEditingName(false);
      showSuccess("Name updated successfully.");
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: data.user.name }));
    } catch (err) {
      showError(err.message || "Failed to update name");
    }
  };

  // ── Update Password ────────────────────────────────────
  const handlePasswordSave = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      return showError("All password fields are required.");
    }
    if (newPass !== confirmPass) {
      return showError("New passwords do not match.");
    }
    if (newPass.length < 6) {
      return showError("New password must be at least 6 characters.");
    }
    try {
      const res  = await fetch("/api/admin/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword:     newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEditingPass(false);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      showSuccess("Password updated successfully.");
    } catch (err) {
      showError(err.message || "Failed to update password");
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
              <h1>My Profile</h1>
              <p>View and update your admin account information</p>
            </div>

            {/* SUCCESS */}
            {successMsg && (
              <div className="settings-success">
                <Check size={16} /> {successMsg}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="confirm-row">
                <span style={{ color: "#ef4444" }}>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="txn-summary">
                <span style={{ color: "#b8c2e4" }}>Loading profile...</span>
              </div>
            ) : (
              <>
                {/* PROFILE CARD */}
                <div className="dashboard-section">
                  <div className="profile-hero">
                    <div className="admin-user-avatar">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-hero-copy">
                      <span className="profile-role-pill">{profile?.role}</span>
                      <h1 style={{ color: "white", margin: "12px 0 4px" }}>{profile?.name}</h1>
                      <p style={{ color: "#b8c2e4" }}>{profile?.email}</p>
                    </div>
                  </div>
                </div>

                {/* ACCOUNT INFO */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h2>Account Information</h2>
                      <p>Your admin account details</p>
                    </div>
                  </div>

                  <div className="profile-content-grid">

                    {/* NAME */}
                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Full Name</span>
                      {editingName ? (
                        <div className="commission-row" style={{ marginTop: 8 }}>
                          <input
                            className="txn-search"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter new name"
                            style={{ flex: 1 }}
                          />
                          <button
                            className="settings-icon-btn"
                            onClick={handleNameSave}
                            title="Save"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            className="settings-icon-btn danger"
                            onClick={() => {
                              setEditingName(false);
                              setNewName(profile?.name);
                            }}
                            title="Cancel"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="commission-row" style={{ marginTop: 8 }}>
                          <p style={{ color: "white", flex: 1, margin: 0 }}>{profile?.name}</p>
                          <button
                            className="settings-edit-btn"
                            onClick={() => setEditingName(true)}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                        </div>
                      )}
                    </div>

                    {/* EMAIL */}
                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Email Address</span>
                      <p style={{ color: "white", marginTop: 8 }}>{profile?.email}</p>
                    </div>

                    {/* ROLE */}
                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Role</span>
                      <p style={{ color: "white", marginTop: 8 }}>{profile?.role}</p>
                    </div>

                    {/* MEMBER SINCE */}
                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Member Since</span>
                      <p style={{ color: "white", marginTop: 8 }}>
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "long", year: "numeric",
                            })
                          : "—"
                        }
                      </p>
                    </div>

                  </div>
                </div>

                {/* CHANGE PASSWORD */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h2>Change Password</h2>
                      <p>Update your login password</p>
                    </div>
                    {!editingPass && (
                      <button
                        className="settings-edit-btn"
                        onClick={() => setEditingPass(true)}
                      >
                        <Pencil size={14} /> Change Password
                      </button>
                    )}
                  </div>

                  {editingPass ? (
                    <div className="policy-form">
                      <div className="policy-input">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="policy-input">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="policy-input">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="settings-form-actions">
                        <button
                          className="dashboard-primary-btn"
                          onClick={handlePasswordSave}
                        >
                          Save Password
                        </button>
                        <button
                          className="settings-cancel-btn"
                          onClick={() => {
                            setEditingPass(false);
                            setCurrentPass("");
                            setNewPass("");
                            setConfirmPass("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#b8c2e4", fontSize: 14 }}>
                      Click "Change Password" to update your login credentials.
                    </p>
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