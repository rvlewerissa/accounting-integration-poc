import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Config
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback';

const XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize';
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const XERO_CONNECTIONS_URL = 'https://api.xero.com/connections';

// Scopes we need
const SCOPES = [
  'openid',
  'profile',
  'email',
  'accounting.transactions.read',
  'accounting.contacts.read',
  'accounting.settings.read',
  'offline_access' // Required for refresh tokens
].join(' ');

// Token storage file
const TOKENS_FILE = path.join(__dirname, 'tokens.json');

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Helper: Save tokens to file
function saveTokens(data) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(data, null, 2));
}

// Helper: Load tokens from file
function loadTokens() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading tokens:', err);
  }
  return null;
}

// Helper: Exchange code for tokens
async function exchangeCodeForTokens(code) {
  const credentials = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

// Helper: Get connections (tenants)
async function getConnections(accessToken) {
  const response = await fetch(XERO_CONNECTIONS_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get connections: ${error}`);
  }

  return response.json();
}

// Helper: Refresh access token
async function refreshAccessToken(refreshToken) {
  const credentials = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return response.json();
}

// Store state for CSRF protection (in production, use session/redis)
let oauthState = null;

// Route: Start OAuth flow
app.get('/auth/xero', (req, res) => {
  // Generate random state for CSRF protection
  oauthState = Math.random().toString(36).substring(7);

  const authUrl = new URL(XERO_AUTH_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', XERO_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('state', oauthState);

  console.log('Redirecting to Xero:', authUrl.toString());
  res.redirect(authUrl.toString());
});

// Route: OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { code, state, error } = req.query;

  // Handle errors from Xero
  if (error) {
    return res.send(`
      <html>
        <body>
          <h1>Authorization Failed</h1>
          <p>Error: ${error}</p>
          <script>
            window.opener.postMessage({ type: 'XERO_AUTH_ERROR', error: '${error}' }, '*');
          </script>
        </body>
      </html>
    `);
  }

  // Validate state
  if (state !== oauthState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    const tokens = await exchangeCodeForTokens(code);
    console.log('Tokens received!');

    // Get connected tenants
    console.log('Fetching connections...');
    const tenants = await getConnections(tokens.access_token);
    console.log('Connections:', tenants);

    // Save tokens and tenants
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
      id_token: tokens.id_token,
      tenants: tenants,
    };
    saveTokens(tokenData);

    // Return HTML that notifies parent window
    res.send(`
      <html>
        <body>
          <h1>Connected to Xero!</h1>
          <p>You can close this window.</p>
          <script>
            window.opener.postMessage({
              type: 'XERO_AUTH_SUCCESS',
              tenants: ${JSON.stringify(tenants)}
            }, '*');
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Callback error:', err);
    res.send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>${err.message}</p>
          <script>
            window.opener.postMessage({ type: 'XERO_AUTH_ERROR', error: '${err.message}' }, '*');
          </script>
        </body>
      </html>
    `);
  }
});

// Route: Get current connections
app.get('/api/connections', async (req, res) => {
  const tokens = loadTokens();

  if (!tokens) {
    return res.status(401).json({ error: 'Not connected to Xero' });
  }

  // Check if token is expired
  if (Date.now() >= tokens.expires_at) {
    try {
      console.log('Token expired, refreshing...');
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      const tenants = await getConnections(newTokens.access_token);

      const tokenData = {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: Date.now() + (newTokens.expires_in * 1000),
        id_token: newTokens.id_token,
        tenants: tenants,
      };
      saveTokens(tokenData);

      return res.json({ tenants });
    } catch (err) {
      console.error('Refresh failed:', err);
      return res.status(401).json({ error: 'Token refresh failed' });
    }
  }

  res.json({ tenants: tokens.tenants });
});

// Route: Get token status (for debugging)
app.get('/api/status', (req, res) => {
  const tokens = loadTokens();

  if (!tokens) {
    return res.json({ connected: false });
  }

  res.json({
    connected: true,
    expires_at: new Date(tokens.expires_at).toISOString(),
    expired: Date.now() >= tokens.expires_at,
    tenants: tokens.tenants?.map(t => ({ id: t.tenantId, name: t.tenantName })),
  });
});

// Route: Disconnect (clear tokens)
app.post('/api/disconnect', (req, res) => {
  if (fs.existsSync(TOKENS_FILE)) {
    fs.unlinkSync(TOKENS_FILE);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /auth/xero      - Start OAuth flow');
  console.log('  GET  /auth/callback  - OAuth callback');
  console.log('  GET  /api/connections - Get connected tenants');
  console.log('  GET  /api/status     - Get connection status');
  console.log('  POST /api/disconnect - Clear tokens');
});
