import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/common/Home";
import Brand from "./pages/brand/BrandDashboard";
import Influencer from "./pages/influencer/InfluencerDashboard";
import Admin from "./pages/admin/AdminDashboard";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import Verification from "./pages/auth/Verification";
import CreateAccount from "./pages/auth/CreateAccount";
import "./styles/responsive.css";
import "./styles/global.css";
import "./styles/variables.css";
import CreateCampaign from "./pages/brand/createCampaign";  
function App() {
  return (
    <BrowserRouter>
  
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/brand" element={<Brand />} />
        <Route path="/influencer" element={<Influencer />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;