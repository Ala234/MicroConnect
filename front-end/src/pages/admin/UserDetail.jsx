import "../../styles/dashboard.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  ArrowLeft, Mail, ShieldOff, Shield,
  MapPin, Users, Star, Globe, Building2, Flag,
} from "lucide-react";

export default function UserDetail() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [collapsed,      setCollapsed]      = useState(localStorage.getItem("sidebar") === "true");
  const [user,           setUser]           = useState(null);
  const [influencer,     setInfluencer]     = useState(null);
  const [brand,          setBrand]          = useState(null);
  const [campaigns,      setCampaigns]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [successMsg,     setSuccessMsg]     = useState("");
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmFlag,    setConfirmFlag]    = useState(false);

  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // ── Fetch user + role-specific profile ────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authHeaders = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const userRes  = await fetch(`/api/admin/users/${id}`, { headers: authHeaders });
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.message);
        setUser(userData);

        if (userData.role === "influencer") {
          const infRes = await fetch(`/api/admin/users/${id}/influencer-profile`, { headers: authHeaders });
          if (infRes.ok) {
            const infData = await infRes.json();
            setInfluencer(infData);
          }
        } else if (userData.role === "brand") {
          const brandRes = await fetch(`/api/admin/users/${id}/brand-profile`, { headers: authHeaders });
          if (brandRes.ok) {
            const brandData = await brandRes.json();
            setBrand(brandData);

            // Fetch brand's campaigns using the Brand document _id
            const campRes = await fetch(`/api/admin/campaigns?brandId=${brandData._id}`, { headers: authHeaders });
            if (campRes.ok) {
              const campData = await campRes.json();
              setCampaigns(campData);
            }
          }
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
      const res  = await fetch(`/api/admin/users/${id}/suspend`, {
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

  // ── Flag / Approve Bio ─────────────────────────────────
  const handleFlag = async (bioStatus) => {
    try {
      const res  = await fetch(`/api/admin/influencers/${influencer._id}/bio-status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ bioStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInfluencer((prev) => ({ ...prev, bioStatus }));
      setConfirmFlag(false);
      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update bio status");
    }
  };

  // ── Helpers ────────────────────────────────────────────
  const campaignStatusClass = (status) => {
    switch (status) {
      case "open":   return "status-active";
      case "closed": return "status-resolved";
      case "draft":  return "status-pending";
      default:       return "";
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
          <div className="dashboard-topbar-actions">
            <div className="profile-actions">

              <button
                className="dashboard-primary-btn"
                onClick={() => navigate(from === "content-review" ? "/ContentReview" : "/ManageUsers")}
              >
                <ArrowLeft size={16} />
                {from === "content-review" ? "Back to Content Review" : "Back to Users"}
              </button>

              {!loading && user && from !== "content-review" && (
                <button
                  className={`campaign-status-btn ${user.isActive ? "decline" : "accept"}`}
                  onClick={() => setConfirmSuspend(true)}
                >
                  {user.isActive
                    ? <><ShieldOff size={15} /> Suspend User</>
                    : <><Shield size={15} /> Unsuspend User</>
                  }
                </button>
              )}

              {!loading && user && from === "content-review" && influencer && (
                <button
                  className={`campaign-status-btn ${influencer?.bioStatus === "flagged" ? "accept" : "decline"}`}
                  onClick={() => setConfirmFlag(true)}
                >
                  {influencer?.bioStatus === "flagged"
                    ? <><Shield size={15} /> Approve Bio</>
                    : <><Flag size={15} /> Flag Bio</>
                  }
                </button>
              )}

              <button className="dashboard-logout" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </div>

        {/* INLINE SUSPEND CONFIRM */}
        {confirmSuspend && (
          <div className="confirm-row">
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

        {/* INLINE FLAG CONFIRM */}
        {confirmFlag && (
          <div className="confirm-row">
            <span>
              {influencer?.bioStatus === "flagged"
                ? <>Are you sure you want to <strong>approve</strong> the bio of <strong>{user.name}</strong>?</>
                : <>Are you sure you want to <strong>flag</strong> the bio of <strong>{user.name}</strong>?</>
              }
            </span>
            <button
              className="confirm-yes"
              onClick={() => handleFlag(
                influencer?.bioStatus === "flagged" ? "approved" : "flagged"
              )}
            >
              Yes, {influencer?.bioStatus === "flagged" ? "Approve" : "Flag"}
            </button>
            <button className="confirm-no" onClick={() => setConfirmFlag(false)}>
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

            {loading ? (
              <div className="txn-summary">
                <span className="loading-text">Loading user...</span>
              </div>
            ) : !user ? (
              <div className="dashboard-section">
                <div className="campaign-review-empty">
                  <h1 className="loading-text">User Not Found</h1>
                  <p className="loading-text">{error || "This user does not exist."}</p>
                  <button
                    className="dashboard-primary-btn"
                    onClick={() => navigate(from === "content-review" ? "/ContentReview" : "/ManageUsers")}
                  >
                    <ArrowLeft size={16} />
                    {from === "content-review" ? "Back to Content Review" : "Back to Users"}
                  </button>
                </div>
              </div>
            ) : (
              <>

                {/* PROFILE HERO */}
                <div className="dashboard-section">
                  <div className="profile-hero">

                    {brand?.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.companyName}
                        className="profile-hero-image"
                      />
                    ) : (
                      <div className="admin-user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="profile-hero-copy">
                      <span className="profile-role-pill">{user.role}</span>
                      <h1 style={{ color: "white", margin: "12px 0 8px" }}>
                        {brand?.companyName || user.name}
                      </h1>

                      {influencer?.bio && (
                        <p style={{ color: "#b8c2e4", lineHeight: 1.7, marginBottom: 12 }}>
                          {influencer.bio}
                        </p>
                      )}

                      {brand?.description && (
                        <p style={{ color: "#b8c2e4", lineHeight: 1.7, marginBottom: 12 }}>
                          {brand.description}
                        </p>
                      )}

                      <div className="profile-meta-row">
                        <span><Mail size={14} /> {user.email}</span>
                        {influencer?.location   && <span><MapPin    size={14} /> {influencer.location}</span>}
                        {influencer?.followers  && <span><Users     size={14} /> {influencer.followers} followers</span>}
                        {influencer?.engagement && <span><Star      size={14} /> {influencer.engagement} engagement</span>}
                        {brand?.industry        && <span><Building2 size={14} /> {brand.industry}</span>}
                        {brand?.website         && <span><Globe     size={14} /> {brand.website}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCOUNT DETAILS */}
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
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Last Updated</span>
                      <p style={{ color: "white" }}>
                        {new Date(user.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* ── INFLUENCER SPECIFIC ── */}
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

                    {/* ── BRAND SPECIFIC ── */}
                    {brand?.companyName && (
                      <div className="campaign-review-card">
                        <span className="campaign-card-label">Company Name</span>
                        <p style={{ color: "white" }}>{brand.companyName}</p>
                      </div>
                    )}
                    {brand?.industry && (
                      <div className="campaign-review-card">
                        <span className="campaign-card-label">Industry</span>
                        <p style={{ color: "white" }}>{brand.industry}</p>
                      </div>
                    )}
                    {brand?.website && (
                      <div className="campaign-review-card">
                        <span className="campaign-card-label">Website</span>
                        <p style={{ color: "#4aa8ff" }}>{brand.website}</p>
                      </div>
                    )}
                    {brand?.description && (
                      <div className="campaign-review-card">
                        <span className="campaign-card-label">Description</span>
                        <p style={{ color: "white" }}>{brand.description}</p>
                      </div>
                    )}

                  </div>
                </div>

                {/* BRAND CAMPAIGNS */}
                {brand && (
                  <div className="dashboard-section">
                    <div className="dashboard-section-header">
                      <div>
                        <h2>Campaigns</h2>
                        <p>
                          {campaigns.length > 0
                            ? `${campaigns.length} campaign${campaigns.length > 1 ? "s" : ""} by ${brand.companyName}`
                            : `No campaigns yet by ${brand.companyName}`
                          }
                        </p>
                      </div>
                    </div>

                    {campaigns.length === 0 ? (
                      <p className="loading-text">No campaigns found for this brand.</p>
                    ) : (
                      <div className="users-table">
                        <table>
                          <thead>
                            <tr>
                              <th>No.</th>
                              <th>Title</th>
                              <th>Budget</th>
                              <th>Niche</th>
                              <th>Deadline</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaigns.map((c, index) => (
                              <tr key={c._id}>
                                <td>{index + 1}</td>
                                <td>{c.title}</td>
                                <td className="txn-amount">
                                  SAR {c.budget?.toLocaleString() || "—"}
                                </td>
                                <td className="txn-date">{c.targetNiche || "—"}</td>
                                <td className="txn-date">
                                  {c.deadline
                                    ? new Date(c.deadline).toLocaleDateString("en-GB", {
                                        day: "numeric", month: "short", year: "numeric",
                                      })
                                    : "—"
                                  }
                                </td>
                                <td className={campaignStatusClass(c.status)}>
                                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}