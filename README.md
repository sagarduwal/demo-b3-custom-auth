# B3 Custom Authentication Demo

## Architecture

### Authentication Flow
#### For existing user with Google Login
1. User clicks "Login with Google" (Google OAuth button)
2. Google OAuth flow provides access token/credential
3. App calls custom authentication API (`/api/v3/auth/social-login/google`) with Google token
4. AGS Card API returns authentication tokens
5. App uses tokens with B3 SDK's `authenticate` function
6. User is now authenticated for B3 chain interactions


## Mock API Server

For development and testing, you can use a local mock API server instead of the real AGS Card API:

### Quick Setup
```bash

cd mock-api && npm start

```

### Using Mock API
1. Start the mock server: `cd mock-api && npm start`
2. Update `.env` file: `REACT_APP_AUTH_BASE_URL=http://localhost:3001`
3. Restart your React app: `npm start`

The mock API will:
- Accept any Google access token
- Return valid JWT tokens
- Create mock users for unknown tokens

## API Integration

### Custom Auth API Request
```bash
curl 'https://agscard.com/api/v3/auth/social-login/google' \
  -H 'content-type: application/json' \
  -H 'x-tenant: us' \
  --data-raw '{"provider":"google","access_token":"----"}'
```

### Expected Response
- **Status**: 200 (success)
- **Headers**: Updated with authentication cookies (XSRF-TOKEN, robograding_session)
- **Body**: 
  ```json
  {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "type": "bearer",
    "expiry": 21600
  }
  ```

The `access_token` is a JWT token that gets passed to the B3 SDK for authentication.

## B3 SDK Integration

The app uses the B3 SDK's headless authentication approach:

```typescript
import { authenticate } from '@b3dotfun/sdk/global-account/app';

const result = await authenticate(accessToken, identityToken, {
  // Additional configuration
});
```
