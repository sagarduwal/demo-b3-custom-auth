import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { b3Service } from '../services/b3Service';

interface GoogleLoginButtonProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess, onLoginError }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('Google OAuth success, credential received:', {
      hasCredential: !!credentialResponse.credential,
      credentialLength: credentialResponse.credential?.length || 0
    });

    if (!credentialResponse.credential) {
      onLoginError?.('No credential received from Google');
      return;
    }

    try {
      setIsLoading(true);
      
      // For this POC, we'll use the credential as the access token
      // In production, you might need to exchange this for an access token
      console.log('Starting B3 authentication with Google credential...');
      const success = await b3Service.authenticate(credentialResponse.credential);
      
      if (success) {
        console.log('B3 authentication successful!');
        onLoginSuccess?.();
      } else {
        const state = b3Service.getState();
        console.error('B3 authentication failed:', state.error);
        onLoginError?.(state.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      onLoginError?.(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    onLoginError?.('Google authentication failed');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      {isLoading ? (
        <div className="loading">
          <p>Authenticating...</p>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          width="250"
        />
      )}
    </div>
  );
};

export default GoogleLoginButton;

