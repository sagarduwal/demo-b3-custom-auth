import { authenticate } from '@b3dotfun/sdk/global-account/app';
import { authService } from './authService';

// B3 Chain configuration
export const B3_CHAIN = {
  id: parseInt(process.env.REACT_APP_B3_CHAIN_ID || '8333'),
  name: "B3",
  nativeCurrency: { 
    name: "Ether", 
    symbol: "ETH", 
    decimals: 18 
  },
  rpc: process.env.REACT_APP_B3_RPC_URL || "https://mainnet-rpc.b3.fun",
};

export interface B3Account {
  address: string;
  displayName?: string;
  isAuthenticated: boolean;
}

export interface B3ServiceState {
  account: B3Account | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class B3Service {
  private state: B3ServiceState = {
    account: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private listeners: ((state: B3ServiceState) => void)[] = [];

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: B3ServiceState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<B3ServiceState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState(): B3ServiceState {
    return { ...this.state };
  }

  /**
   * Authenticate with B3 using custom auth tokens
   */
  async authenticate(googleAccessToken: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });

      // First authenticate with our custom service using Google access token
      const authResult = await authService.authenticateWithGoogle(googleAccessToken);
      
      if (!authResult.success || !authResult.tokens) {
        this.setState({ 
          isLoading: false, 
          error: authResult.error || 'Custom authentication failed' 
        });
        return false;
      }

      // Now authenticate with B3 SDK using the tokens
      console.log('Attempting B3 SDK authentication with tokens...');
      const b3AuthResult = await authenticate(
        authResult.tokens.accessToken,
        authResult.tokens.identityToken,
        
      );

      console.log('B3 SDK authentication result:', b3AuthResult);

      if (b3AuthResult) {
        // Create account object from B3 result
        const account: B3Account = {
          address: b3AuthResult.address || '0x...',
          displayName: b3AuthResult.displayName || 'B3 User',
          isAuthenticated: true,
        };

        console.log('B3 authentication successful, account created:', account);

        this.setState({
          account,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } else {
        console.error('B3 authentication failed - no result returned');
        this.setState({
          isLoading: false,
          error: 'B3 authentication failed - no result returned',
        });
        return false;
      }
    } catch (error: any) {
      console.error('B3 authentication error:', error);
      this.setState({
        isLoading: false,
        error: error.message || 'Authentication failed',
      });
      return false;
    }
  }

  /**
   * Sign out from B3
   */
  async signOut(): Promise<void> {
    try {
      // Clear custom auth
      authService.logout();

      // Clear B3 state
      this.setState({
        account: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      this.setState({
        error: error.message || 'Sign out failed',
      });
    }
  }

  /**
   * Sign a message (placeholder implementation)
   */
  async signMessage(message: string): Promise<string | null> {
    try {
      if (!this.state.isAuthenticated || !this.state.account) {
        throw new Error('Not authenticated');
      }

      // This would be implemented with actual B3 SDK message signing
      // For now, return a mock signature
      const mockSignature = `0x${Buffer.from(`signed:${message}`).toString('hex')}`;
      
      return mockSignature;
    } catch (error: any) {
      console.error('Message signing error:', error);
      this.setState({
        error: error.message || 'Message signing failed',
      });
      return null;
    }
  }

  /**
   * Get wallet balance (placeholder implementation)
   */
  async getBalance(): Promise<string | null> {
    try {
      if (!this.state.isAuthenticated || !this.state.account) {
        throw new Error('Not authenticated');
      }

      // This would be implemented with actual B3 SDK balance checking
      // For now, return a mock balance
      return '1.2345 ETH';
    } catch (error: any) {
      console.error('Balance check error:', error);
      this.setState({
        error: error.message || 'Balance check failed',
      });
      return null;
    }
  }

  /**
   * Interact with a contract (placeholder implementation)
   */
  async interactWithContract(contractAddress: string, method: string, params: any[]): Promise<string | null> {
    try {
      if (!this.state.isAuthenticated || !this.state.account) {
        throw new Error('Not authenticated');
      }

      // This would be implemented with actual B3 SDK contract interaction
      // For now, return a mock transaction hash
      const mockTxHash = `0x${Buffer.from(`tx:${contractAddress}:${method}`).toString('hex').substring(0, 64)}`;
      
      return mockTxHash;
    } catch (error: any) {
      console.error('Contract interaction error:', error);
      this.setState({
        error: error.message || 'Contract interaction failed',
      });
      return null;
    }
  }
}

// Export singleton instance
export const b3Service = new B3Service();
export default b3Service;
