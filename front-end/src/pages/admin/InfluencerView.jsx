import "../../styles/dashboard.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
    ArrowLeft, Mail, ShieldOff, Shield,
    MapPin, Users, Star, Globe,
} from "lucide-react";

export default function InfluencerView() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [collapsed, setCollapsed] = useState(localStorage.getItem("sidebar") === "true");
    const [user, setUser] = useState(null);
    const [influencer, setInfluencer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmSuspend, setConfirmSuspend] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    // ── Fetch user + influencer profile ───────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                };

                const [userRes, influencerRes] = await Promise.all([
                    fetch(`/api/admin/users/${id}`, { headers }),
                    fetch(`/api/admin/users/${id}/influencer-profile`, { headers }),
                ]);

                const userData = await userRes.json();
                if (!userRes.ok) throw new Error(userData.message);
                setUser(userData);

                // Influencer profile is optional — brand users won't have one
                if (influencerRes.ok) {
                    const influencerData = await influencerRes.json();
                    setInfluencer(influencerData);
                }
            } catch (err) {
                setError(err.message || "Failed to load user");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // ── Suspend / Unsuspend ────────────────────────────────
    const handleSuspend = async () => {
        try {
            const res = await fetch(`/api/admin/users/${id}/suspend`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUser((prev) => ({ ...prev, isActive: data.isActive }));
            setConfirmSuspend(false);
            setSuccessMsg(data.message);
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            setError(err.message || "Failed to update user status");
        }
    };

    // ── Loading ────────────────────────────────────────────
    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-shell">
                    <div className="dashboard-section" style={{ textAlign: "center", padding: "40px" }}>
                        <p style={{ color: "#b8c2e4" }}>Loading user...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────
    if (error || !user) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-shell">
                    <div className="dashboard-section">
                        <div className="campaign-review-empty">
                            <h1 style={{ color: "white" }}>User Not Found</h1>
                            <p style={{ color: "#b8c2e4" }}>{error || "This user does not exist."}</p>
                            <button className="dashboard-primary-btn" onClick={() => navigate("/ManageUsers")}>
                                Back to Manage Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`dashboard-page ${collapsed ? "collapsed" : ""}`}>
            <div className="dashboard-shell">

                {/* TOP BAR */}
                <div className="dashboard-topbar">
                    <div className="dashboard-logo">
                        <div className="dashboard-logo-icon">M</div>
                        <span>MicroConnect</span>
                    </div>
                    <div className="dashboard-topbar-actions">
                        <div className="profile-actions">
                            <button className="dashboard-primary-btn" onClick={() => navigate("/ManageUsers")}>
                                <ArrowLeft size={16} /> Back to Users
                            </button>
                            <button
                                className={`campaign-status-btn ${user.isActive ? "decline" : "accept"}`}
                                onClick={() => setConfirmSuspend(true)}
                            >
                                {user.isActive
                                    ? <><ShieldOff size={15} /> Suspend User</>
                                    : <><Shield size={15} /> Unsuspend User</>
                                }
                            </button>
                            <button className="dashboard-logout" onClick={handleLogout}>Log out</button>
                        </div>
                    </div>
                </div>

                {/* INLINE CONFIRM */}
                {confirmSuspend && (
                    <div className="confirm-row" style={{ margin: "12px 24px" }}>
                        <span>
                            {user.isActive
                                ? <>Are you sure you want to <strong>suspend</strong> {user.name}?</>
                                : <>Are you sure you want to <strong>unsuspend</strong> {user.name}?</>
                            }
                        </span>
                        <button className="confirm-yes" onClick={handleSuspend}>
                            Yes, {user.isActive ? "Suspend" : "Unsuspend"}
                        </button>
                        <button className="confirm-no" onClick={() => setConfirmSuspend(false)}>
                            Cancel
                        </button>
                    </div>
                )}

                {/* MAIN LAYOUT */}
                <div className="admin-layout">
                    <Sidebar onCollapse={setCollapsed} />

                    <div className="admin-content">

                        {/* SUCCESS MESSAGE */}
                        {successMsg && (
                            <div className="settings-success">{successMsg}</div>
                        )}

                        {/* PROFILE HERO */}
                        <div className="dashboard-section">
                            <div className="profile-hero">

                                {/* Avatar or image */}
                                {influencer?.profileImage ? (
                                    <img
                                        src={influencer.profileImage}
                                        alt={user.name}
                                        className="profile-hero-image"
                                    />
                                ) : (
                                    <div className="admin-user-avatar">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div className="profile-hero-copy">
                                    <span className="profile-role-pill">{user.role}</span>
                                    <h1 style={{ color: "white", margin: "12px 0 8px" }}>{user.name}</h1>

                                    {influencer?.bio && (
                                        <p style={{ color: "#b8c2e4", lineHeight: 1.7, marginBottom: 12 }}>
                                            {influencer.bio}
                                        </p>
                                    )}

                                    <div className="profile-meta-row">
                                        <span><Mail size={14} /> {user.email}</span>
                                        {influencer?.location && <span><MapPin size={14} /> {influencer.location}</span>}
                                        {influencer?.followers && <span><Users size={14} /> {influencer.followers} followers</span>}
                                        {influencer?.engagement && <span><Star size={14} /> {influencer.engagement} engagement</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PROFILE DETAILS */}
                        <div className="dashboard-section">
                            <div className="dashboard-section-header">
                                <div>
                                    <h2>Account Details</h2>
                                    <p>Full information about this user</p>
                                </div>
                            </div>
                            <div className="profile-content-grid">

                                <div className="campaign-review-card">
                                    <span className="campaign-card-label">Full Name</span>
                                    <p style={{ color: "white" }}>{user.name}</p>
                                </div>

                                <div className="campaign-review-card">
                                    <span className="campaign-card-label">Email Address</span>
                                    <p style={{ color: "white" }}>{user.email}</p>
                                </div>

                                <div className="campaign-review-card">
                                    <span className="campaign-card-label">Account Type</span>
                                    <p style={{ color: "white" }}>{user.role}</p>
                                </div>

                                <div className="campaign-review-card">
                                    <span className="campaign-card-label">Account Status</span>
                                    <p className={user.isActive ? "status-active" : "status-suspended"}>
                                        {user.isActive ? "Active" : "Suspended"}
                                    </p>
                                </div>

                                <div className="campaign-review-card">
                                    <span className="campaign-card-label">Member Since</span>
                                    <p style={{ color: "white" }}>
                                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "long", year: "numeric"
                                        })}
                                    </p>
                                </div>

                                <div className="campaign-review-card">
                                    <span className="campaign-card-label">Last Updated</span>
                                    <p style={{ color: "white" }}>
                                        {new Date(user.updatedAt).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "long", year: "numeric"
                                        })}
                                    </p>
                                </div>

                                {influencer?.followers && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Followers</span>
                                        <p style={{ color: "white" }}>{influencer.followers}</p>
                                    </div>
                                )}

                                {influencer?.engagement && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Engagement Rate</span>
                                        <p style={{ color: "white" }}>{influencer.engagement}</p>
                                    </div>
                                )}

                                {influencer?.niche && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Niche</span>
                                        <p style={{ color: "white" }}>{influencer.niche}</p>
                                    </div>
                                )}

                                {influencer?.location && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Location</span>
                                        <p style={{ color: "white" }}>{influencer.location}</p>
                                    </div>
                                )}

                                {influencer?.categories?.length > 0 && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Categories</span>
                                        <p style={{ color: "white" }}>{influencer.categories.join(", ")}</p>
                                    </div>
                                )}

                                {influencer?.website && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Website</span>
                                        <p style={{ color: "#4aa8ff" }}>{influencer.website}</p>
                                    </div>
                                )}

                                {influencer?.audience?.age && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Audience Age Range</span>
                                        <p style={{ color: "white" }}>{influencer.audience.age}</p>
                                    </div>
                                )}

                                {influencer?.audience?.gender && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Audience Gender</span>
                                        <p style={{ color: "white" }}>{influencer.audience.gender}</p>
                                    </div>
                                )}

                                {influencer?.audience?.location && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Audience Location</span>
                                        <p style={{ color: "white" }}>{influencer.audience.location}</p>
                                    </div>
                                )}

                                {influencer?.rates?.post && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Rate — Post</span>
                                        <p style={{ color: "white" }}>{influencer.rates.post}</p>
                                    </div>
                                )}

                                {influencer?.rates?.story && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Rate — Story</span>
                                        <p style={{ color: "white" }}>{influencer.rates.story}</p>
                                    </div>
                                )}

                                {influencer?.rates?.video && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Rate — Video</span>
                                        <p style={{ color: "white" }}>{influencer.rates.video}</p>
                                    </div>
                                )}

                                {influencer?.socialLinks?.instagram && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Instagram</span>
                                        <p style={{ color: "#4aa8ff" }}>{influencer.socialLinks.instagram}</p>
                                    </div>
                                )}

                                {influencer?.socialLinks?.tiktok && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">TikTok</span>
                                        <p style={{ color: "#4aa8ff" }}>{influencer.socialLinks.tiktok}</p>
                                    </div>
                                )}

                                {influencer?.socialLinks?.youtube && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">YouTube</span>
                                        <p style={{ color: "#4aa8ff" }}>{influencer.socialLinks.youtube}</p>
                                    </div>
                                )}

                                {influencer?.socialLinks?.website && (
                                    <div className="campaign-review-card">
                                        <span className="campaign-card-label">Social Website</span>
                                        <p style={{ color: "#4aa8ff" }}>{influencer.socialLinks.website}</p>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}