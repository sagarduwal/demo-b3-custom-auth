import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'mock-jwt';

interface MockUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

const mockUsers: Record<string, MockUser> = {
  'ya29.a0AQQ_BDSSMB9BQSVwAVbw4bcYEVCVwzDtx0gX9KjKWSfnjJMvMJYfm-f8NeMxCgfNiI64rM9gIhoSm5JPfoHm8W9aV__TcJDt6pFG8EM7fNGVeuacNVUWE5ZiLr3Sz8H-Z42ylBtP-IqRPLkmsHcBCPMBlfD4lRCA6pE7eNPxnSmnwq-rIlJNHwe3WgkxBtpuSuIhMOi0aCgYKASESARESFQHGX2Mir7FOcGB9vXuYhpKHWTDVxQ0207': {
    id: '49574',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'placeholder'
  }
};

app.post('/api/v3/auth/social-login/google', (req, res) => {
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  const { provider, access_token } = req.body;

  if (provider !== 'google') {
    return res.status(400).json({
      error: 'Invalid provider',
      message: 'Only Google provider is supported'
    });
  }

  if (!access_token) {
    return res.status(400).json({
      error: 'Missing access token',
      message: 'Google access_token is required'
    });
  }

  let userData = mockUsers[access_token];
  
  if (!userData) {
    const newUserId = Math.floor(Math.random() * 100000).toString();
    const newUser: MockUser = {
      id: newUserId,
      email: `user${newUserId}@example.com`,
      name: `Mock User ${newUserId}`,
      picture: 'placeholder'
    };
    
    mockUsers[access_token] = newUser;
    userData = newUser;
  }

  const jwtPayload = {
    iss: 'https://agscard.com/api/v3/auth/social-login/google',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (6 * 60 * 60),
    nbf: Math.floor(Date.now() / 1000),
    jti: Math.random().toString(36).substring(2, 15),
    sub: userData.id,
    prv: '23bd5c8949f600adb39e701c400872db7a5976f7'
  };

  const accessToken = jwt.sign(jwtPayload, JWT_SECRET);

  res.status(200).json({
    access_token: accessToken,
    type: 'bearer',
    expiry: 21600
  });
});

app.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
