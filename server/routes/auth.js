import { Router } from 'express';
import {
  XERO_AUTH_URL,
  XERO_CLIENT_ID,
  REDIRECT_URI,
  SCOPES,
} from '../config/xero.js';
import {
  QB_AUTH_URL,
  QB_CLIENT_ID,
  QB_REDIRECT_URI,
  QB_SCOPES,
} from '../config/quickbooks.js';
import { saveTokens } from '../utils/xero-tokens.js';
import { saveRealmTokens } from '../utils/qb-tokens.js';
import { exchangeCodeForTokens, getConnections } from '../services/xero.js';
import {
  exchangeCodeForTokens as exchangeQBCode,
  getCompanyInfo,
} from '../services/quickbooks.js';

const router = Router();

// Store state for CSRF protection (in production, use session/redis)
let oauthState = null;
let qbOAuthState = null;

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

// ==================== QuickBooks OAuth ====================

// Start QuickBooks OAuth flow
router.get('/quickbooks', (req, res) => {
  qbOAuthState = Math.random().toString(36).substring(7);

  const authUrl = new URL(QB_AUTH_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', QB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', QB_REDIRECT_URI);
  authUrl.searchParams.set('scope', QB_SCOPES);
  authUrl.searchParams.set('state', qbOAuthState);

  res.redirect(authUrl.toString());
});

// QuickBooks OAuth callback
// Key difference: QuickBooks returns realmId in query params
router.get('/quickbooks/callback', async (req, res) => {
  const { code, state, realmId, error } = req.query;

  if (error) {
    return res.send(`
      <html>
        <body>
          <h1>Authorization Failed</h1>
          <p>Error: ${error}</p>
          <script>
            window.opener.postMessage({ type: 'QB_AUTH_ERROR', error: '${error}' }, '*');
          </script>
        </body>
      </html>
    `);
  }

  if (state !== qbOAuthState) {
    return res.status(400).send('Invalid state parameter');
  }

  if (!realmId) {
    return res.status(400).send('Missing realmId parameter');
  }

  try {
    // Exchange code for tokens (also saves tokens with realmId)
    const tokenData = await exchangeQBCode(code, realmId);

    // Fetch company info
    const companyResponse = await getCompanyInfo(
      tokenData.access_token,
      realmId
    );
    const company = companyResponse.CompanyInfo;

    // Update tokens with company info
    const updatedTokenData = {
      ...tokenData,
      company: {
        id: company.Id,
        name: company.CompanyName,
        country: company.Country,
      },
    };
    saveRealmTokens(realmId, updatedTokenData);

    res.send(`
      <html>
        <body>
          <h1>Connected to QuickBooks!</h1>
          <p>Company: ${company.CompanyName}</p>
          <p>You can close this window.</p>
          <script>
            window.opener.postMessage({
              type: 'QB_AUTH_SUCCESS',
              company: ${JSON.stringify({
                id: company.Id,
                name: company.CompanyName,
                country: company.Country,
              })}
            }, '*');
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('QuickBooks callback error:', err);
    res.send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>${err.message}</p>
          <script>
            window.opener.postMessage({ type: 'QB_AUTH_ERROR', error: '${err.message}' }, '*');
          </script>
        </body>
      </html>
    `);
  }
});

export default router;
