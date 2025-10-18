import axios from 'axios';

// Types for B3 user data
export interface B3UserData {
  id: string;
  email?: string;
  name?: string;
  address: string;
  chainId: number;
}

// Types for our custom authentication
export interface AuthTokens {
  accessToken: string;
  identityToken: string;
}

export interface AuthResponse {
  success: boolean;
  tokens?: AuthTokens;
  user?: any;
  wallet?: any;
  b3Claims?: any;
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
   * Authenticate with backend using B3 user data
   */
  async authenticateWithB3User(b3UserData: B3UserData): Promise<AuthResponse> {
    try {
      console.log('Authenticating with backend using B3 user data:', b3UserData);
      
      const response = await authAPI.post('/auth/b3-login', {
        user: {
          id: b3UserData.id,
          email: b3UserData.email,
          name: b3UserData.name
        },
        account: {
          address: b3UserData.address,
          chainId: b3UserData.chainId
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'x-tenant': process.env.REACT_APP_AUTH_TENANT || 'us',
        }
      });

      if (response.status === 200) {
        const responseData = response.data;
        console.log('Backend authentication response:', responseData);
        
        if (responseData.success) {
          // Store the backend access token
          const tokens: AuthTokens = {
            accessToken: responseData.access_token,
            identityToken: responseData.access_token
          };

          this.tokens = tokens;
          return {
            success: true,
            tokens,
            user: responseData.user,
            wallet: responseData.wallet
          };
        } else {
          return {
            success: false,
            error: responseData.error || 'Backend authentication failed'
          };
        }
      } else {
        return {
          success: false,
          error: 'Backend authentication failed'
        };
      }
    } catch (error: any) {
      console.error('Backend authentication error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Backend authentication failed'
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

  /**
   * Verify B3 JWT token with backend
   */
  async verifyB3JWT(b3JWT: string): Promise<AuthResponse> {
    try {
      console.log('Verifying B3 JWT token with backend');
      
      const response = await authAPI.post('/auth/verify-b3-token', {
        token: b3JWT
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'x-tenant': process.env.REACT_APP_AUTH_TENANT || 'us',
        }
      });

      if (response.status === 200) {
        const responseData = response.data;
        console.log('B3 JWT verification response:', responseData);
        
        if (responseData.success) {
          const tokens: AuthTokens = {
            accessToken: responseData.access_token,
            identityToken: responseData.access_token
          };

          this.tokens = tokens;
          return {
            success: true,
            tokens,
            user: responseData.user,
            wallet: responseData.wallet,
            b3Claims: responseData.b3_claims
          };
        } else {
          return {
            success: false,
            error: responseData.error || 'B3 JWT verification failed'
          };
        }
      } else {
        return {
          success: false,
          error: 'B3 JWT verification failed'
        };
      }
    } catch (error: any) {
      console.error('B3 JWT verification error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'B3 JWT verification failed'
      };
    }
  }

  /**
   * Get user information from backend
   */
  async getUserInfo(): Promise<AuthResponse> {
    try {
      if (!this.tokens?.accessToken) {
        return {
          success: false,
          error: 'No access token available'
        };
      }

      console.log('Getting user info from backend');
      
      const response = await authAPI.get('/user/info', {
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
          'Accept': 'application/json, text/plain, */*',
          'x-tenant': process.env.REACT_APP_AUTH_TENANT || 'us',
        }
      });

      if (response.status === 200) {
        const responseData = response.data;
        console.log('User info response:', responseData);
        
        if (responseData.success) {
          return {
            success: true,
            user: responseData.user,
            b3Claims: responseData.b3_info
          };
        } else {
          return {
            success: false,
            error: responseData.error || 'Failed to get user info'
          };
        }
      } else {
        return {
          success: false,
          error: 'Failed to get user info'
        };
      }
    } catch (error: any) {
      console.error('Get user info error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get user info'
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
