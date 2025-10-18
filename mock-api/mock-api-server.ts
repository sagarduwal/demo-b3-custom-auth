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
    console.log('B3 API authentication successful', {status: b3Response.status, data: b3Data});

    const userId = b3Data.user?.id || b3Data.account?.address;
    const b3Address = b3Data.account?.address;
    const b3ChainId = b3Data.account?.chainId;
    const email = b3Data.user?.email;
    const name = b3Data.user?.name || b3Data.user?.displayName;

    if (b3Address && (!b3Address.startsWith('0x') || b3Address.length !== 42)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format',
        message: 'B3 account address must be a valid Ethereum address'
      });
    }

    console.log('B3 API verification successful for user:', name);
    console.log('B3 Address:', b3Address);
    console.log('B3 Chain ID:', b3ChainId);

    res.status(200).json({
      success: true,
      verified: true,
      user_info: {
        id: userId,
        email: email,
        name: name,
        picture: b3Data.user?.picture,
        b3_address: b3Address,
        b3_chain_id: b3ChainId
      },
      b3_api_response: {
        user: b3Data.user,
        account: b3Data.account,
        authenticated_at: new Date().toISOString()
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
