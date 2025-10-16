import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { b3Service, B3ServiceState } from './services/b3Service';
import GoogleLoginButton from './components/GoogleLoginButton';
import WalletInfo from './components/WalletInfo';
import MessageSigner from './components/MessageSigner';
import ContractInteraction from './components/ContractInteraction';

function App() {
  const [state, setState] = useState<B3ServiceState>(b3Service.getState());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = b3Service.subscribe(setState);
    return unsubscribe;
  }, []);

  const handleLoginSuccess = () => {
    setError(null);
    console.log('Login successful');
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleErrorDismiss = () => {
    setError(null);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <div className="container">
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>B3 Custom Authentication Demo</h1>
          <p>Demonstrating B3 chain interactions with custom authentication system</p>
        </header>

        {error && (
          <div className="error">
            {error}
            <button 
              onClick={handleErrorDismiss}
              style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {state.isLoading && (
          <div className="loading">
            <p>Loading...</p>
          </div>
        )}

        {!state.isAuthenticated ? (
          <div className="card" style={{ textAlign: 'center' }}>
            
            <p>Please login with your Google account to access B3 chain features.</p>
            
            <GoogleLoginButton 
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
          </div>
        ) : (
          <div>
            <div className="card">
              <h2>Successfully Connected!</h2>
              <p>You are now authenticated and can interact with the B3 chain.</p>
            </div>

            <WalletInfo />

            <MessageSigner />

            <ContractInteraction />

            <div className="card">
              <h3>B3 Chain Information</h3>
              <div>
                <strong>Chain ID:</strong> 8333
              </div>
              <div>
                <strong>Chain Name:</strong> B3
              </div>
              <div>
                <strong>RPC URL:</strong> https://mainnet-rpc.b3.fun
              </div>
              <div>
                <strong>Native Currency:</strong> ETH
              </div>
            </div>
          </div>
        )}

        {state.error && (
          <div className="error">
            <strong>B3 Service Error:</strong> {state.error}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
