import React, { useState } from 'react';
import { useAuthentication, useGlobalAccount } from '@b3dotfun/sdk/global-account/react';

const WalletInfo: React.FC = () => {
  const partnerId = process.env.REACT_APP_B3_PARTNER_ID || "68b6cf34-2699-42f6-8cbc-0d5ea40c6b52";
  const { isAuthenticated, logout, user } = useAuthentication(partnerId);
  const { account, address } = useGlobalAccount();
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const handleGetBalance = async () => {
    setLoadingBalance(true);
    try {
      // Mock balance for now - in real implementation, this would use B3 SDK
      const mockBalance = '1.2345 ETH';
      setBalance(mockBalance);
    } catch (error: any) {
      console.error('Error getting balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  if (!isAuthenticated || !address) {
    return null;
  }

  return (
    <div className="wallet-info">
      <h3>Wallet Information</h3>
      <div>
        <strong>Address:</strong>
        <div className="address">{address}</div>
      </div>
      
      {user?.username && (
        <div>
          <strong>Username:</strong> {user.username}
        </div>
      )}
      
      {user?.email && (
        <div>
          <strong>Email:</strong> {user.email}
        </div>
      )}

      <div style={{ marginTop: '15px' }}>
        <button 
          className="button danger" 
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default WalletInfo;
