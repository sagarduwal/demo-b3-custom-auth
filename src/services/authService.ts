import axios from 'axios';

// Types for our custom authentication
export interface AuthTokens {
  accessToken: string;
  identityToken: string;
}

export interface AuthResponse {
  success: boolean;
  tokens?: AuthTokens;
  error?: string;
}

// Configuration for the custom auth API
const AUTH_CONFIG = {
  baseURL: process.env.REACT_APP_AUTH_BASE_URL || 'https://agscard.com/api/v3',
  timeout: 10000,
};

// Create axios instance for auth API
const authAPI = axios.create(AUTH_CONFIG);

class AuthService {
  private tokens: AuthTokens | null = null;

  /**
   * Authenticate with custom Google OAuth API using real Google access token
   */
  async authenticateWithGoogle(googleAccessToken: string): Promise<AuthResponse> {
    try {
      const response = await authAPI.post('/auth/social-login/google', {
        provider: 'google',
        access_token: googleAccessToken
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'x-tenant': process.env.REACT_APP_AUTH_TENANT || 'us',
          // In production, these would be obtained from your auth flow
          'x-xsrf-token': 'mock-xsrf-token',
        }
      });

      if (response.status === 200) {
        // Extract tokens from the actual AGS Card API response
        const responseData = response.data;
        console.log('AGS Card API Response:', responseData);
        
        if (responseData.access_token) {
          const tokens: AuthTokens = {
            accessToken: responseData.access_token,
            identityToken: responseData.access_token // Using the same token for both for now
          };

          console.log('Generated tokens for B3 SDK:', {
            accessToken: tokens.accessToken.substring(0, 20) + '...',
            identityToken: tokens.identityToken.substring(0, 20) + '...'
          });

          this.tokens = tokens;
          return {
            success: true,
            tokens
          };
        } else {
          console.error('No access token in AGS Card API response:', responseData);
          return {
            success: false,
            error: 'No access token received from AGS Card API'
          };
        }
      } else {
        return {
          success: false,
          error: 'Authentication failed'
        };
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Get current authentication tokens
   */
  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokens !== null;
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.tokens = null;
  }

  /**
   * Get access token for B3 SDK
   */
  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  /**
   * Get identity token for B3 SDK
   */
  getIdentityToken(): string | null {
    return this.tokens?.identityToken || null;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
