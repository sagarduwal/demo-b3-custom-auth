import React, { useState, useEffect } from 'react';
import { B3Provider, SignInWithB3, useB3, B3DynamicModal } from '@b3dotfun/sdk/global-account/react';
import { getAuthToken } from '@b3dotfun/sdk/shared/utils/auth-token';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletInfo from './components/WalletInfo';
import MessageSigner from './components/MessageSigner';
import { b3Chain } from './constants/b3Chain';
import { Account } from "thirdweb/wallets";
import { authService } from './services/authService';

// Create a client
const queryClient = new QueryClient();

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connectToWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          window.ethereum.on("accountsChanged", (accounts: string[]) => {
            setAccount(accounts[0]);
          });
        } catch (error) {
          console.error("Error connecting to wallet:", error);
        }
      } else {
        console.error("No Ethereum wallet detected in browser");
      }
    };

    connectToWallet();
  }, []);

  if (!account) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Please Connect Your Wallet</h2>
          <p>This demo requires MetaMask or another Ethereum wallet to be connected.</p>
          <p>Please install MetaMask and refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <B3Provider
        theme="light"
        environment="production"
        partnerId={process.env.REACT_APP_B3_PARTNER_ID || "68b6cf34-2699-42f6-8cbc-0d5ea40c6b52"}
        automaticallySetFirstEoa={true}
      >
        <B3DynamicModal />
        <InnerComponent account={account} error={error} setError={setError} />
      </B3Provider>
    </QueryClientProvider>
  );
}

const InnerComponent = ({ account, error, setError }: { account: string; error: string | null; setError: (error: string | null) => void }) => {
  const { account: b3Account } = useB3();

  const handleLoginSuccess = async (globalAccount: Account) => {
    console.log("User authenticated with Global Account!", globalAccount);
    setError(null);
    
    try {
      const b3Jwt = getAuthToken();
      if (b3Jwt) {
        console.log('B3 JWT token received:', b3Jwt.substring(0, 50) + '...');

        const authResult = await authService.verifyB3JWT(b3Jwt);
        
        if (authResult.success) {
          console.log('Backend verification successful!');
          console.log('User data:', authResult.user);
          console.log('B3 claims:', authResult.b3Claims);
          console.log('Wallet info:', authResult.wallet);
        } else {
          console.error('Backend verification failed:', authResult.error);
          setError(authResult.error || 'Backend verification failed');
        }
      } else {
        console.error('No JWT token found in cookies');
        setError('No JWT token found in cookies');
      }
    } catch (error: any) {
      console.error('Error processing B3 authentication:', error);
      setError(error.message || 'Error processing B3 authentication');
    }
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>B3 Authentication Demo</h1>
        <p>Authenticate with B3 using MetaMask wallet</p>
      </header>

      {error && (
        <div className="error">
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <div className="card" style={{ textAlign: 'center' }}>
        <p>Please authenticate with B3 to get started.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <SignInWithB3
              chain={b3Chain}
              partnerId={process.env.REACT_APP_B3_PARTNER_ID || "68b6cf34-2699-42f6-8cbc-0d5ea40c6b52"}
              sessionKeyAddress={account as `0x${string}`}
              onLoginSuccess={handleLoginSuccess}
            />

        </div>
      </div>

      {!!b3Account && (
        <div><div className="card">
          <h2>Successfully Connected to B3!</h2>
          <p>Welcome! You are now authenticated with B3.</p>
          <p><strong>B3 Account Address:</strong> {b3Account.address}</p>
          <p><strong>Session Key Address:</strong> {account}</p>
        </div>
        <div >
          <WalletInfo />
          <MessageSigner />
        </div></div>
      )}
    </div>
  );
}

export default App;
