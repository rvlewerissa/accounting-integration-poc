import { Router } from 'express';
import {
  XERO_AUTH_URL,
  XERO_CLIENT_ID,
  REDIRECT_URI,
  SCOPES,
} from '../config/xero.js';
import { saveTokens } from '../utils/tokens.js';
import { exchangeCodeForTokens, getConnections } from '../services/xero.js';

const router = Router();

// Store state for CSRF protection (in production, use session/redis)
let oauthState = null;

// Start OAuth flow
router.get('/xero', (req, res) => {
  oauthState = Math.random().toString(36).substring(7);

  const authUrl = new URL(XERO_AUTH_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', XERO_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('state', oauthState);

  res.redirect(authUrl.toString());
});

// OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

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

  if (state !== oauthState) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const tenants = await getConnections(tokens.access_token);

    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
      id_token: tokens.id_token,
      tenants: tenants,
    };
    saveTokens(tokenData);

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

export default router;
