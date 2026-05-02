import "../../styles/dashboard.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiLogOut,
  FiMessageCircle,
  FiSend,
  FiXCircle,
} from "react-icons/fi";
import homeImage from "../../assets/images/home.png";
import SaraBImage from "../../assets/images/SaraBlogs-Profile.jpg";
import LisaSImage from "../../assets/images/Lisa-Profile.jpg";
import { getCampaignById } from "../../data/mockCampaigns";
import { sendContractFromBrand, updateContractStatus } from "../../data/contracts";
import BrandChatModal from "./BrandChatModal";

const contractProfiles = {
  "sarah-johnson": {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    imageSrc: SaraBImage,
    company: "FashionForward Inc.",
    compensation: "$500 + Products",
    duration: "2 Months",
    startDate: "March 1, 2026",
    endDate: "April 30, 2026",
    deliverables: [
      "4 Instagram posts (feed)",
      "8 Instagram Story (feed)",
      "2 TikTok Videos",
      "1 YouTube integration (optional)",
    ],
  },
  "mia-carter": {
    name: "Mia Carter",
    email: "mia.carter@email.com",
    imageSrc: LisaSImage,
    company: "FashionForward Inc.",
    compensation: "$650 + Products",
    duration: "6 Weeks",
    startDate: "March 10, 2026",
    endDate: "April 21, 2026",
    deliverables: [
      "3 Instagram reels",
      "6 Instagram Stories",
      "2 TikTok videos",
      "1 styling livestream",
    ],
  },
};

const terms = [
  "Content must align with the brand guidelines provided.",
  "All posts require brand approval before publishing.",
  "Influencer retains full rights to content.",
  "Payment will be processed within 30 days of campaign completion.",
  "Exclusive partnership for the duration of the campaign.",
];

const statusMeta = {
  requested: {
    badgeLabel: "Pending",
    badgeClass: "pending",
    title: "Contract request sent",
    description:
      "The digital contract was sent to the influencer and is waiting for confirmation.",
  },
  accepted: {
    badgeLabel: "Active",
    badgeClass: "accepted",
    title: "Contract confirmed",
    description:
      "Both parties have confirmed the digital contract. The campaign can now proceed.",
  },
  rejected: {
    badgeLabel: "Rejected",
    badgeClass: "rejected",
    title: "Contract rejected",
    description:
      "The influencer declined the current agreement. Review the terms and send a new request.",
  },
};

const bannerMeta = {
  download: {
    title: "Downloading contract!",
    text: "Your contract PDF is being prepared",
    className: "contract-banner success",
  },
  accepted: {
    title: "Contract confirmed!",
    text: "The influencer has accepted the digital contract",
    className: "contract-banner success",
  },
  rejected: {
    title: "Contract rejected!",
    text: "The influencer has declined the current contract request",
    className: "contract-banner danger",
  },
  requested: {
    title: "Contract request sent!",
    text: "The influencer has been notified to review the digital contract",
    className: "contract-banner success",
  },
  message: {
    title: "Chat opened",
    text: "A conversation with the influencer is ready to continue",
    className: "contract-banner info",
  },
};

export default function ContractPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId") || "spring-collection";
  const influencerId = searchParams.get("influencer") || "sarah-johnson";
  const initialState = searchParams.get("state") || "requested";
  const initialBannerKey =
    initialState === "accepted" || initialState === "rejected"
      ? initialState
      : initialState === "downloaded"
        ? "download"
        : initialState === "requested"
          ? "requested"
          : null;
  const [contractState, setContractState] = useState(initialState);
  const [bannerKey, setBannerKey] = useState(initialBannerKey);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const campaign = getCampaignById(campaignId) || getCampaignById("spring-collection");
  const profile = contractProfiles[influencerId] || contractProfiles["sarah-johnson"];
  const contractInfo = statusMeta[contractState] || statusMeta.requested;

  useEffect(() => {
    if (contractState === "requested") {
      sendContractFromBrand({
        campaign,
        influencer: {
          id: influencerId,
          name: profile.name,
          email: profile.email,
        },
      });
    }
  }, [campaignId, influencerId, contractState]);

  const contractMetrics = useMemo(
    () => [
      {
        icon: <FiFileText />,
        label: "Compensation",
        value: profile.compensation,
        tone: "lavender",
      },
      {
        icon: <FiClock />,
        label: "Duration",
        value: profile.duration,
        tone: "blue",
      },
      {
        icon: <FiCalendar />,
        label: "Start date",
        value: profile.startDate,
        tone: "peach",
      },
      {
        icon: <FiCalendar />,
        label: "End date",
        value: profile.endDate,
        tone: "mint",
      },
    ],
    [profile]
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const updateSearchState = (nextState) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("campaignId", campaignId);
    nextParams.set("influencer", influencerId);
    nextParams.set("state", nextState);
    setSearchParams(nextParams);
  };

  const handleContractAction = (action) => {
    if (action === "accept") {
      const savedContract = sendContractFromBrand({
        campaign,
        influencer: {
          id: influencerId,
          name: profile.name,
          email: profile.email,
        },
      });
      updateContractStatus(savedContract.contractId, "Active");
      setContractState("accepted");
      setBannerKey("accepted");
      updateSearchState("accepted");
      return;
    }

    if (action === "reject") {
      const savedContract = sendContractFromBrand({
        campaign,
        influencer: {
          id: influencerId,
          name: profile.name,
          email: profile.email,
        },
      });
      updateContractStatus(savedContract.contractId, "Rejected");
      setContractState("rejected");
      setBannerKey("rejected");
      updateSearchState("rejected");
      return;
    }

    if (action === "request") {
      sendContractFromBrand({
        campaign,
        influencer: {
          id: influencerId,
          name: profile.name,
          email: profile.email,
        },
      });
      setContractState("requested");
      setBannerKey("requested");
      updateSearchState("requested");
      return;
    }

    if (action === "download") {
      setBannerKey("download");
      return;
    }

    if (action === "message") {
      setBannerKey("message");
      setIsChatOpen(true);
      return;
    }

    setBannerKey("message");
  };

  const contractBanner = bannerKey ? bannerMeta[bannerKey] : null;

  return (
    <div className="dashboard-page campaign-review-page">
      <div className="dashboard-shell contract-page-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>

          <div className="dashboard-topbar-actions">
            <button
              className="dashboard-logout ghost"
              onClick={() => navigate(`/delete-campaign?id=${campaignId}`)}
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>

            <button className="dashboard-logout ghost" onClick={handleLogout}>
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>
        </div>

        <div className={`dashboard-section contract-page ${isChatOpen ? "dimmed" : ""}`}>
          <div className="contract-page-header">
            <div className="contract-page-title">
              <span className="contract-page-badge">
                <FiFileText />
                <span>Digital contract</span>
              </span>
            </div>

            <div className={`contract-state-pill ${contractInfo.badgeClass}`}>
              <span>{contractInfo.badgeLabel}</span>
            </div>
          </div>

          {contractBanner ? (
            <div className={contractBanner.className}>
              <strong>{contractBanner.title}</strong>
              <span>{contractBanner.text}</span>
            </div>
          ) : null}

          <img
            className="contract-hero-image"
            src={homeImage}
            alt="Digital contract"
          />

          <div className="contract-party-grid">
            <div className="contract-party-card">
              <span>Brand</span>
              <strong>{profile.company}</strong>
            </div>
            <div className="contract-party-card influencer">
              <span>Influencer</span>
              <div className="contract-party-profile">
                <img src={profile.imageSrc} alt={profile.name} />
                <strong>{profile.name}</strong>
              </div>
            </div>
          </div>

          <div className="contract-copy-block">
            <h3>Contract details</h3>
          </div>

          <div className="campaign-review-metrics contract-metrics">
            {contractMetrics.map((metric) => (
              <div
                key={metric.label}
                className={`campaign-review-metric ${metric.tone}`}
              >
                <div className="campaign-review-metric-icon">{metric.icon}</div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>

          <div className="contract-copy-block">
            <h3>Campaign</h3>
            <p>{campaign?.name || "Spring Collection Launch"}</p>
          </div>

          <div className="contract-copy-block">
            <h3>Deliverables</h3>
            <div className="contract-list">
              {profile.deliverables.map((item) => (
                <div className="contract-list-item" key={item}>
                  <FiCheckCircle />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="contract-copy-block">
            <h3>Terms & Conditions</h3>
            <div className="contract-list">
              {terms.map((item) => (
                <div className="contract-list-item muted" key={item}>
                  <FiCheckCircle />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="contract-copy-block">
            <h3>Contracts Actions</h3>
          </div>

          <div className="contract-actions-panel">
            <div className="contract-actions-summary">
              {contractState === "accepted" ? <FiCheckCircle /> : null}
              {contractState === "rejected" ? <FiXCircle /> : null}
              {contractState === "requested" ? <FiSend /> : null}
              <strong>{contractInfo.title}</strong>
              <p>{contractInfo.description}</p>
            </div>

            <div className="contract-actions-row">
              <button
                className="dashboard-primary-btn"
                onClick={() => handleContractAction("message")}
              >
                <FiMessageCircle />
                <span>Message influencer</span>
              </button>

              <button
                className="contract-secondary-btn"
                onClick={() => handleContractAction("download")}
              >
                <FiDownload />
                <span>Download contract</span>
              </button>

              <button
                className="contract-outline-btn"
                onClick={() => handleContractAction("accept")}
              >
                Simulate accept
              </button>

              <button
                className="contract-outline-btn danger"
                onClick={() => handleContractAction("reject")}
              >
                Simulate reject
              </button>

              <button
                className="contract-outline-btn"
                onClick={() => handleContractAction("request")}
              >
                Request contract
              </button>
            </div>
          </div>

          {isChatOpen ? (
            <BrandChatModal
              influencerName={profile.name}
              influencerImage={profile.imageSrc}
              onClose={() => setIsChatOpen(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
