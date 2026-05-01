import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/common/Home";
import Brand from "./pages/brand/BrandDashboard";
import AvailableCampaigns from "./pages/influencer/AvailableCampaigns";
import InfluencerSetup from "./pages/influencer/InfluencerSetup";
import InfluencerProfile from "./pages/influencer/InfluencerProfile";
import MyApplications from "./pages/influencer/MyApplications";
import CampaignDetails from "./pages/influencer/CampaignDetails";
import ProposalPage from "./pages/influencer/ProposalPage";
import MessagingPage from "./pages/influencer/MessagingPage";
import CampaignHistory from "./pages/influencer/CampaignHistory";
import ComplaintsPage from "./pages/influencer/ComplaintsPage";
import Admin from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import Contracts from "./pages/admin/Contracts"; 
import Transactions from "./pages/admin/Transactions";
import Disputes from "./pages/admin/Disputes";
import ContentReview from "./pages/admin/ContentReview";
import AdminSettings from "./pages/admin/Settings";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import Verification from "./pages/auth/Verification";
import CreateAccount from "./pages/auth/CreateAccount";
import "./styles/global.css";
import "./styles/variables.css";
import CreateCampaign from "./pages/brand/createCampaign";  
import DeleteCampaign from "./pages/brand/DeleteCampaign";
import ContractPage from "./pages/brand/ContractPage";
import AdminInfluView from "./pages/admin/InfluencerView";

import InfluencerProfilee from "./pages/brand/InfluencerProfile";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/brand" element={<Brand />} />
        <Route path="/influencer" element={<AvailableCampaigns />} />
        <Route path="/influencer/setup" element={<InfluencerSetup />} />
        <Route path="/influencer/profile" element={<InfluencerProfile />} />
        <Route path="/influencer/applications" element={<MyApplications />} />
        <Route path="/influencer/history" element={<CampaignHistory />} />
        <Route path="/influencer/disputes" element={<ComplaintsPage />} />
        <Route path="/influencer/complaints" element={<ComplaintsPage />} />
        <Route path="/influencer/campaign/:id" element={<CampaignDetails />} />
        <Route path="/influencer/campaign/:id/history" element={<CampaignHistory />} />
        <Route path="/influencer/campaign/:id/propose" element={<ProposalPage />} />
        <Route path="/influencer/campaign/:id/message" element={<MessagingPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
        <Route path="/delete-campaign" element={<DeleteCampaign />} />
        <Route path="/contracts" element={<ContractPage />} />
        <Route path="/influencer-profile" element={<InfluencerProfilee />} />
        <Route path="/ManageUsers" element={<ManageUsers />} />
        <Route path="/AdminContracts" element={<Contracts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/ContentReview" element={<ContentReview />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/admin/users/:id" element={<AdminInfluView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
