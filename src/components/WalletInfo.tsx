import React, { useState, useEffect } from 'react';
import { b3Service, B3ServiceState } from '../services/b3Service';

const WalletInfo: React.FC = () => {
  const [state, setState] = useState<B3ServiceState>(b3Service.getState());
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const unsubscribe = b3Service.subscribe(setState);
    return unsubscribe;
  }, []);

  const handleGetBalance = async () => {
    setLoadingBalance(true);
    try {
      const balanceResult = await b3Service.getBalance();
      setBalance(balanceResult);
    } catch (error: any) {
      console.error('Error getting balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSignOut = async () => {
    await b3Service.signOut();
  };

  if (!state.isAuthenticated || !state.account) {
    return null;
  }

  return (
    <div className="wallet-info">
      <h3>Wallet Information</h3>
      <div>
        <strong>Address:</strong>
        <div className="address">{state.account.address}</div>
      </div>
      
      {state.account.displayName && (
        <div>
          <strong>Display Name:</strong> {state.account.displayName}
        </div>
      )}

      <div style={{ marginTop: '15px' }}>
        <button 
          className="button" 
          onClick={handleGetBalance}
          disabled={loadingBalance}
        >
          {loadingBalance ? 'Loading...' : 'Get Balance'}
        </button>
        
        {balance && (
          <div style={{ marginTop: '10px' }}>
            <strong>Balance:</strong> {balance}
          </div>
        )}
      </div>

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
