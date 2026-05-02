import "../../styles/dashboard.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiFileText,
  FiLogOut,
  FiMessageCircle,
  FiPlus,
  FiSend,
  FiX,
} from "react-icons/fi";
import { fetchCampaignById } from "../../data/mockCampaigns";
import { getApplicationById } from "../../api/applications";
import { createContract, getContractById } from "../../api/contracts";
import BrandChatModal from "./BrandChatModal";

const COMMISSION_RATE = 10;

const CONTRACT_STATUSES = ["Completed", "Active", "Pending", "Rejected"];

const normalizeContractState = (status) => {
  if (!status) {
    return "draft";
  }

  const value = String(status).trim();
  if (value.toLowerCase() === "draft") {
    return "draft";
  }

  const canonical = CONTRACT_STATUSES.find(
    (item) => item.toLowerCase() === value.toLowerCase()
  );
  return canonical || "Pending";
};

const contractStateTone = {
  Active: "accepted",
  Completed: "accepted",
  Pending: "pending",
  Rejected: "rejected",
  draft: "pending",
};

const toInputDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(date).slice(0, 10);
  }

  return parsedDate.toISOString().slice(0, 10);
};

const splitContractDetails = (details) =>
  String(details || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ContractPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId") || "spring-collection";
  const influencerId = searchParams.get("influencer") || "sarah-johnson";
  const applicationId = searchParams.get("applicationId");
  const existingContractId = searchParams.get("contractId");
  const influencerNameParam = searchParams.get("influencerName");
  const influencerEmailParam = searchParams.get("influencerEmail");
  const initialState = searchParams.get("state") || "draft";

  const [campaign, setCampaign] = useState(null);
  const [application, setApplication] = useState(null);
  const [profile, setProfile] = useState({
    name: "Influencer",
    email: "",
    imageSrc: "",
  });

  const brandProfile = useMemo(() => {
    const stored = localStorage.getItem("brandProfile");
    return stored ? JSON.parse(stored) : { companyName: "Brand" };
  }, []);

  const [contractId, setContractId] = useState(searchParams.get("contractId") || "Assigned after send");

  const [contractState, setContractState] = useState(normalizeContractState(initialState));
  const [bannerMessage, setBannerMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [contractValue, setContractValue] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deliverables, setDeliverables] = useState([""]);
  const [customTerms, setCustomTerms] = useState([""]);
  const [paymentTiming, setPaymentTiming] = useState("before");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshingContract, setIsRefreshingContract] = useState(false);

  const normalizedContractState = normalizeContractState(contractState);
  const isDraft = normalizedContractState === "draft";

  const totalAmount = parseFloat(String(contractValue).replace(/[^0-9.]/g, "")) || 0;
  const adminCut = (totalAmount * COMMISSION_RATE) / 100;
  const influencerCut = totalAmount - adminCut;

  const applyContractToState = useCallback((contract, fallbackContractId) => {
    const contractCampaign =
      contract.campaign && typeof contract.campaign === "object"
        ? contract.campaign
        : contract.campaignId && typeof contract.campaignId === "object"
          ? contract.campaignId
          : null;

    setApplication(contract.application || null);
    setCampaign(contractCampaign || { name: contract.campaignName || "Campaign" });
    setProfile({
      name: contract.influencerName || "Influencer",
      email: contract.influencerEmail || "",
      imageSrc: contract.influencerImage || "",
    });
    setContractId(contract.contractId || contract._id || fallbackContractId);
    setContractState(normalizeContractState(contract.status));
    setContractValue(contract.value || (contract.totalAmount ? String(contract.totalAmount) : ""));
    setDuration(contract.duration || "");
    setStartDate(toInputDate(contract.startDate));
    setEndDate(toInputDate(contract.endDate));
    setDeliverables(
      Array.isArray(contract.deliverables) && contract.deliverables.length
        ? contract.deliverables
        : [""]
    );
    setCustomTerms(
      Array.isArray(contract.terms) && contract.terms.length
        ? contract.terms
        : splitContractDetails(contract.details).length
          ? splitContractDetails(contract.details)
          : [""]
    );
    setPaymentTiming(contract.paymentTiming || "before");
  }, []);

  const refreshContractStatus = useCallback(async ({ showLoading = false } = {}) => {
    if (!existingContractId || existingContractId === "Assigned after send") {
      return null;
    }

    if (showLoading) {
      setIsRefreshingContract(true);
    }

    const contractResult = await getContractById(existingContractId);
    if (contractResult.success && contractResult.contract) {
      applyContractToState(contractResult.contract, existingContractId);
      setErrorMessage("");
    } else {
      setErrorMessage(contractResult.message || "Contract could not be loaded");
    }

    if (showLoading) {
      setIsRefreshingContract(false);
    }

    return contractResult.contract || null;
  }, [applyContractToState, existingContractId]);

  useEffect(() => {
    let isMounted = true;

    const loadContractContext = async () => {
      try {
        if (existingContractId && existingContractId !== "Assigned after send") {
          const contractResult = await getContractById(existingContractId);
          if (!contractResult.success) {
            throw new Error(contractResult.message || "Contract could not be loaded");
          }

          if (isMounted) {
            applyContractToState(contractResult.contract, existingContractId);
          }
          return;
        }

        if (applicationId) {
          const applicationResult = await getApplicationById(applicationId);
          if (!applicationResult.success) {
            throw new Error(applicationResult.message || "Application could not be loaded");
          }

          const nextApplication = applicationResult.application;
          const appCampaign = nextApplication.campaignId && typeof nextApplication.campaignId === "object"
            ? nextApplication.campaignId
            : nextApplication.campaign && typeof nextApplication.campaign === "object"
              ? nextApplication.campaign
              : null;

          if (isMounted) {
            setApplication(nextApplication);
            setCampaign(appCampaign || null);
            setProfile({
              name: nextApplication.influencerName || "Influencer",
              email: nextApplication.influencerEmail || "",
              imageSrc: nextApplication.influencerImage || "",
            });
          }

          if (!appCampaign && nextApplication.campaignId) {
            const loadedCampaign = await fetchCampaignById(nextApplication.campaignId);
            if (isMounted) {
              setCampaign(loadedCampaign);
            }
          }
        } else {
          const loadedCampaign = await fetchCampaignById(campaignId);
          if (isMounted) {
            setCampaign(loadedCampaign);
            setProfile({
              name: influencerNameParam || "Influencer",
              email: influencerEmailParam || "",
              imageSrc: "",
            });
          }
        }

      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || "Contract context could not be loaded");
        }
      }
    };

    loadContractContext();

    const handleFocus = () => {
      if (existingContractId && existingContractId !== "Assigned after send") {
        refreshContractStatus();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [applicationId, campaignId, existingContractId, influencerNameParam, influencerEmailParam, applyContractToState, refreshContractStatus]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeliverableChange = (index, value) => {
    setDeliverables((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const handleAddDeliverable = () => setDeliverables((prev) => [...prev, ""]);
  const handleRemoveDeliverable = (index) =>
    setDeliverables((prev) => prev.filter((_, i) => i !== index));

  const handleTermChange = (index, value) => {
    setCustomTerms((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const handleAddTerm = () => setCustomTerms((prev) => [...prev, ""]);
  const handleRemoveTerm = (index) =>
    setCustomTerms((prev) => prev.filter((_, i) => i !== index));

  const validateContract = () => {
    if (!totalAmount || totalAmount <= 0)
      return "Please enter a valid contract value (e.g. 5000)";
    if (!duration.trim()) return "Please enter campaign duration";
    if (!startDate) return "Please select a start date";
    if (!endDate) return "Please select an end date";
    if (endDate < startDate) return "End date must be after start date";
    const validDeliverables = deliverables.filter((d) => d.trim());
    if (validDeliverables.length === 0) return "Please add at least one deliverable";
    const validTerms = customTerms.filter((t) => t.trim());
    if (validTerms.length === 0) return "Please add at least one term";
    return null;
  };

  const handleRequestContract = async () => {
    const validationError = validateContract();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setErrorMessage("");

    const result = await createContract({
      applicationId: application?._id || applicationId,
      campaignId: campaign?._id || campaign?.id || campaignId,
      influencerId,
      value: `SAR ${totalAmount}`,
      totalAmount,
      startDate,
      endDate,
      duration,
      details: customTerms.filter((item) => item.trim()).join('\n'),
      deliverables: deliverables.filter((item) => item.trim()),
      terms: customTerms.filter((item) => item.trim()),
      paymentTiming,
      transactionStatus: "Pending",
    });

    if (!result.success && !result.contract) {
      setErrorMessage(result.message || "Contract could not be sent");
      return;
    }

    const savedContract = result.contract;
    if (savedContract?.contractId) {
      setContractId(savedContract.contractId);
    }
    setContractState(normalizeContractState(savedContract?.status || "Pending"));
    setBannerMessage({
      type: "success",
      title: result.success ? "Contract request sent!" : "Contract already exists",
      text: result.success
        ? `Waiting for ${profile.name}'s approval`
        : result.message || `Waiting for ${profile.name}'s approval`,
    });

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("state", savedContract?.status || "Pending");
    if (savedContract?.contractId) {
      nextParams.set("contractId", savedContract.contractId);
    }
    setSearchParams(nextParams);
  };

  const handleDownload = () => {
    setBannerMessage({
      type: "success",
      title: "Downloading contract!",
      text: "Your contract PDF is being prepared",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const stateBadge = {
    label: isDraft ? "Draft" : normalizedContractState,
    className: contractStateTone[normalizedContractState] || "pending",
  };
  const actionSummaryTitle = isDraft
    ? "Draft contract"
    : normalizedContractState === "Pending"
      ? `Waiting for ${profile.name}'s approval`
      : `Contract ${normalizedContractState}`;
  const actionSummaryText = isDraft
    ? "Fill in the contract details and send it to the influencer."
    : normalizedContractState === "Pending"
      ? "The digital contract has been sent. The influencer will review and respond."
      : `The latest saved contract status is ${normalizedContractState}.`;

  return (
    <div className="dashboard-page campaign-review-page">
      <div className="dashboard-shell contract-page-shell">
        <div className="dashboard-topbar">
          <button className="back-btn-large" onClick={() => navigate(-1)} aria-label="Back" type="button">
            ←
          </button>
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>
          <div className="dashboard-topbar-actions">
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
              <span className="contract-id-badge">ID: {contractId}</span>
            </div>
            <div className={`contract-state-pill ${stateBadge.className}`}>
              <span>{stateBadge.label}</span>
            </div>
          </div>

          {bannerMessage ? (
            <div className={`contract-banner ${bannerMessage.type}`}>
              <strong>{bannerMessage.title}</strong>
              <span>{bannerMessage.text}</span>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="contract-banner danger">
              <strong>Please complete the contract</strong>
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="contract-party-grid">
            <div className="contract-party-card">
              <span>Brand</span>
              <strong>{brandProfile.companyName || "Brand"}</strong>
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
            <div className="campaign-review-metric blue">
              <div className="campaign-review-metric-icon"><FiClock /></div>
              <span>Duration</span>
              {isDraft ? (
                <>
                  <input type="text" className="contract-metric-input"
                    placeholder="2 Months" value={duration}
                    onChange={(e) => setDuration(e.target.value)} />
                  <small className="contract-hint">e.g. 2 Months</small>
                </>
              ) : (<strong>{duration || "—"}</strong>)}
            </div>

            <div className="campaign-review-metric peach">
              <div className="campaign-review-metric-icon"><FiCalendar /></div>
              <span>Start date</span>
              {isDraft ? (
                <>
                  <input type="date" className="contract-metric-input"
                    value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <small className="contract-hint">Pick start date</small>
                </>
              ) : (<strong>{formatDate(startDate)}</strong>)}
            </div>

            <div className="campaign-review-metric mint">
              <div className="campaign-review-metric-icon"><FiCalendar /></div>
              <span>End date</span>
              {isDraft ? (
                <>
                  <input type="date" className="contract-metric-input"
                    value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  <small className="contract-hint">Pick end date</small>
                </>
              ) : (<strong>{formatDate(endDate)}</strong>)}
            </div>
          </div>

          <div className="contract-copy-block">
            <h3>Campaign</h3>
            <p>{campaign?.name || "—"}</p>
          </div>

          <div className="contract-copy-block">
            <h3>Deliverables</h3>
            {isDraft && (<p className="contract-section-hint">Add what you expect from the influencer</p>)}
            <div className="contract-list">
              {deliverables.map((item, index) => (
                <div className="contract-list-item editable" key={index}>
                  <FiCheckCircle />
                  {isDraft ? (
                    <>
                      <input type="text" className="contract-inline-input"
                        placeholder="4 Instagram posts (feed)" value={item}
                        onChange={(e) => handleDeliverableChange(index, e.target.value)} />
                      {deliverables.length > 1 && (
                        <button type="button" className="contract-remove-btn"
                          onClick={() => handleRemoveDeliverable(index)} aria-label="Remove">
                          <FiX />
                        </button>
                      )}
                    </>
                  ) : (<span>{item}</span>)}
                </div>
              ))}
              {isDraft && (
                <button type="button" className="contract-add-btn" onClick={handleAddDeliverable}>
                  <FiPlus /><span>Add deliverable</span>
                </button>
              )}
            </div>
          </div>

          <div className="contract-copy-block">
            <h3>Terms & Conditions</h3>
            {isDraft && (<p className="contract-section-hint">Add the agreement terms</p>)}
            <div className="contract-list">
              {customTerms.map((item, index) => (
                <div className="contract-list-item editable muted" key={index}>
                  <FiCheckCircle />
                  {isDraft ? (
                    <>
                      <input type="text" className="contract-inline-input"
                        placeholder="Payment will be processed within 30 days" value={item}
                        onChange={(e) => handleTermChange(index, e.target.value)} />
                      {customTerms.length > 1 && (
                        <button type="button" className="contract-remove-btn"
                          onClick={() => handleRemoveTerm(index)} aria-label="Remove">
                          <FiX />
                        </button>
                      )}
                    </>
                  ) : (<span>{item}</span>)}
                </div>
              ))}
              {isDraft && (
                <button type="button" className="contract-add-btn" onClick={handleAddTerm}>
                  <FiPlus /><span>Add term</span>
                </button>
              )}
            </div>
          </div>

          {/* PAYMENT BREAKDOWN WIDGET */}
          <div className="contract-copy-block">
            <h3>Payment Breakdown</h3>
            <p className="contract-section-hint">
              Enter the total contract value to see the payment split.
            </p>

            <div className="payment-breakdown-widget">
              <label className="payment-input-label">Total Contract Value (SAR)</label>
              {isDraft ? (
                <div className="payment-input-wrapper">
                  <FiDollarSign className="payment-input-icon" />
                  <input
                    type="number"
                    className="payment-input"
                    placeholder="5000"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    min="0"
                  />
                </div>
              ) : (
                <div className="payment-readonly-value">
                  SAR {totalAmount.toLocaleString()}
                </div>
              )}

              {totalAmount > 0 && (
                <>
                  <div className="payment-breakdown-grid">
                    <div className="payment-breakdown-card admin-rate">
                      <p className="payment-label">Commission Rate</p>
                      <p className="payment-value">{COMMISSION_RATE}%</p>
                      <p className="payment-sublabel">Platform fee</p>
                    </div>

                    <div className="payment-breakdown-card admin">
                      <p className="payment-label">Admin Earnings</p>
                      <p className="payment-value">
                        SAR {adminCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="payment-sublabel">MicroConnect cut</p>
                    </div>

                    <div className="payment-breakdown-card influencer">
                      <p className="payment-label">Influencer Earnings</p>
                      <p className="payment-value">
                        SAR {influencerCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="payment-sublabel">After platform fee</p>
                    </div>
                  </div>

                  <p className="payment-formula">
                    SAR {totalAmount.toLocaleString()} × {COMMISSION_RATE}% = SAR {adminCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (admin) + SAR {influencerCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (influencer)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* PAYMENT TIMING */}
          <div className="contract-copy-block">
            <h3>Payment Timing</h3>
            <p className="contract-section-hint">
              {isDraft
                ? "Choose when you'd like to pay the influencer."
                : "When the brand will pay the influencer."}
            </p>

            {isDraft ? (
              <div className="payment-timing-options">
                <button
                  type="button"
                  className={`payment-timing-option ${paymentTiming === "before" ? "active" : ""}`}
                  onClick={() => setPaymentTiming("before")}
                >
                  <div className="payment-timing-icon">💰</div>
                  <div>
                    <strong>Pay before campaign</strong>
                    <p>Pay the full amount upfront when the influencer accepts the contract.</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`payment-timing-option ${paymentTiming === "after" ? "active" : ""}`}
                  onClick={() => setPaymentTiming("after")}
                >
                  <div className="payment-timing-icon">📅</div>
                  <div>
                    <strong>Pay after campaign</strong>
                    <p>Pay after the influencer completes the deliverables. You can pay from your Contracts page.</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="payment-timing-display">
                <span className="payment-timing-icon">
                  {paymentTiming === "before" ? "💰" : "📅"}
                </span>
                <strong>
                  {paymentTiming === "before" ? "Pay before campaign" : "Pay after campaign"}
                </strong>
              </div>
            )}
          </div>

          <div className="contract-copy-block">
            <h3>Contract Actions</h3>
          </div>

          <div className="contract-actions-panel">
            <div className="contract-actions-summary">
              {isDraft ? <FiFileText /> : <FiSend />}
              <strong>{actionSummaryTitle}</strong>
              <p>{actionSummaryText}</p>
            </div>

            <div className="contract-actions-row">
              <button className="dashboard-primary-btn" onClick={() => setIsChatOpen(true)}>
                <FiMessageCircle /><span>Message influencer</span>
              </button>

              {!isDraft ? (
                <>
                  <button className="contract-secondary-btn" onClick={() => refreshContractStatus({ showLoading: true })}>
                    <FiClock /><span>{isRefreshingContract ? "Refreshing..." : "Refresh status"}</span>
                  </button>
                  <button className="contract-secondary-btn" onClick={handleDownload}>
                    <FiDownload /><span>Download contract</span>
                  </button>
                </>
              ) : (
                <button className="dashboard-primary-btn request-contract-btn" onClick={handleRequestContract}>
                  <FiSend /><span>Request contract</span>
                </button>
              )}
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
