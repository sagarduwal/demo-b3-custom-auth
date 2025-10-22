import express from 'express';
import cors from 'cors';
import { authenticateWithRest } from '@b3dotfun/sdk/global-account/server';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Mock API server is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v3/auth/verify-b3-token', async (req, res) => {
  console.log('B3 JWT verification request');
  
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Missing token',
      message: 'B3 JWT token is required'
    });
  }

  try {
    console.log('Authenticating with B3 API');
    
    const b3Response = await authenticateWithRest(token);
    
    if (!b3Response.ok) {
      console.error('B3 API authentication failed:', b3Response.status, b3Response.statusText);
      return res.status(401).json({
        success: false,
        error: 'B3 authentication failed',
        message: `B3 API returned ${b3Response.status}: ${b3Response.statusText}`
      });
    }

    const b3Data = await b3Response.json();
    const { user } = b3Data;
    
    const privyAccounts = user?.privyLinkedAccounts || [];
    const googleAccount = privyAccounts.find((a: any) => a.type === 'google_oauth');
    const ethereumWallet = privyAccounts.find((a: any) => a.type === 'wallet' && a.chain_type === 'ethereum');
    const solanaWallet = privyAccounts.find((a: any) => a.type === 'wallet' && a.chain_type === 'solana');
    const googleProfile = user?.twProfiles?.find((p: any) => p.type === 'google');
    
    const email = googleAccount?.email || googleProfile?.details?.email || user?.email;
    const name = googleAccount?.name || googleProfile?.details?.name || user?.name || user?.displayName;
    const picture = googleProfile?.details?.picture || user?.picture;
    
    if (ethereumWallet?.address && (!ethereumWallet.address.startsWith('0x') || ethereumWallet.address.length !== 42)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum wallet address format',
        message: 'Ethereum wallet address must be a valid Ethereum address'
      });
    }

    console.log('B3 API verification successful for user:', name);
    console.log('Email:', email);
    console.log('Smart Account Address:', user?.smartAccountAddress);
    console.log('Ethereum Wallet:', ethereumWallet?.address);
    console.log('Solana Wallet:', solanaWallet?.address);

    res.status(200).json({
      success: true,
      verified: true,
      user: {
        id: user?.userId || user?._id,
        email,
        name,
        picture,
        smart_account_address: user?.smartAccountAddress,
        ethereum_wallet: ethereumWallet?.address,
        solana_wallet: solanaWallet?.address,
        created_at: user?.createdAt
      }
    });

  } catch (error) {
    console.error('B3 API authentication failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'B3 API authentication failed',
      message: error instanceof Error ? error.message : 'An error occurred while authenticating with B3 API'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
  
});
