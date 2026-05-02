import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../data/influencerAccounts';
import { getPendingContractCountForInfluencer } from '../../data/contracts';

export default function InfluencerTopNav({ active }) {
  const navigate = useNavigate();
  const pendingContracts = getPendingContractCountForInfluencer(getCurrentUser());
  const contractsLabel = pendingContracts > 0
    ? `Contracts (${pendingContracts})`
    : 'Contracts';

  return (
    <nav className="topnav">
      <button className={active === 'campaigns' ? 'active' : undefined} onClick={() => navigate('/influencer')}>Campaigns</button>
      <button className={active === 'profile' ? 'active' : undefined} onClick={() => navigate('/influencer/profile')}>Profile</button>
      <button className={active === 'applications' ? 'active' : undefined} onClick={() => navigate('/influencer/applications')}>Applications</button>
      <button className={active === 'contracts' ? 'active' : undefined} onClick={() => navigate('/influencer/contracts')}>{contractsLabel}</button>
    </nav>
  );
}
