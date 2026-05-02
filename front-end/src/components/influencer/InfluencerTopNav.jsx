import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingContractCount } from '../../api/contracts';

export default function InfluencerTopNav({ active }) {
  const navigate = useNavigate();
  const [pendingContracts, setPendingContracts] = useState(0);

  useEffect(() => {
    let isMounted = true;

    getPendingContractCount()
      .then((count) => {
        if (isMounted) {
          setPendingContracts(count);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPendingContracts(0);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
