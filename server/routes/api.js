import { Router } from 'express';
import { XERO_API_BASE_URL, SCOPES } from '../config/xero.js';
import { QB_API_BASE_URL, QB_SCOPES } from '../config/quickbooks.js';
import { loadTokens, deleteTokens } from '../utils/xero-tokens.js';
import {
  loadAllRealms,
  loadRealmTokens,
  deleteRealmTokens,
  deleteAllQBTokens,
} from '../utils/qb-tokens.js';
import { requireXeroAuth } from '../middleware/auth.js';
import { revokeToken, getValidTokensForRealm } from '../services/quickbooks.js';

const router = Router();

// Get current connections
router.get('/xero/connections', requireXeroAuth, async (req, res) => {
  res.json({ tenants: req.xeroTokens.tenants });
});

// Get token status (for debugging)
router.get('/xero/status', (req, res) => {
  const tokens = loadTokens();

  if (!tokens) {
    return res.json({ connected: false });
  }

  res.json({
    connected: true,
    expires_at: new Date(tokens.expires_at).toISOString(),
    expired: Date.now() >= tokens.expires_at,
    tenants: tokens.tenants?.map((t) => ({
      id: t.tenantId,
      name: t.tenantName,
    })),
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    scopes: SCOPES,
  });
});

// Get access token (for frontend direct API calls)
router.get('/xero/token', requireXeroAuth, async (req, res) => {
  res.json({
    access_token: req.xeroTokens.access_token,
    expires_at: req.xeroTokens.expires_at,
  });
});

// Disconnect (clear tokens)
router.post('/xero/disconnect', (req, res) => {
  deleteTokens();
  res.json({ success: true });
});

// Proxy Xero API calls (must be after specific routes)
router.get('/xero/*', requireXeroAuth, async (req, res) => {
  const endpoint = '/' + req.params[0];
  const tenantId = req.query.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId query param required' });
  }

  try {
    const xeroRes = await fetch(`${XERO_API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${req.xeroTokens.access_token}`,
        'Xero-Tenant-Id': tenantId,
        Accept: 'application/json',
      },
    });

    const data = await xeroRes.json();

    if (!xeroRes.ok) {
      return res.status(xeroRes.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Xero API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== QuickBooks API ====================

// Get QuickBooks connection status (returns all connected companies)
router.get('/quickbooks/status', (req, res) => {
  const realms = loadAllRealms();

  if (realms.length === 0) {
    return res.json({ connected: false, companies: [] });
  }

  res.json({
    connected: true,
    companies: realms.map((r) => ({
      realmId: r.realmId,
      name: r.company?.name,
      country: r.company?.country,
      expires_at: new Date(r.expires_at).toISOString(),
      expired: Date.now() >= r.expires_at,
    })),
    scopes: QB_SCOPES,
  });
});

// Get tokens for a specific realm (for debugging)
router.get('/quickbooks/token/:realmId', async (req, res) => {
  const { realmId } = req.params;
  const tokens = await getValidTokensForRealm(realmId);

  if (!tokens) {
    return res.status(404).json({ error: 'Realm not found or token invalid' });
  }

  res.json({
    realmId: tokens.realmId,
    company: tokens.company,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(tokens.expires_at).toISOString(),
  });
});

// Proxy QuickBooks API calls
// Requires realmId query param to specify which company
router.get('/quickbooks/*', async (req, res) => {
  const endpoint = '/' + req.params[0];
  const { realmId } = req.query;

  if (!realmId) {
    return res.status(400).json({ error: 'realmId query param required' });
  }

  const tokens = await getValidTokensForRealm(realmId);
  if (!tokens) {
    return res
      .status(401)
      .json({ error: 'Not connected to this QuickBooks company' });
  }

  try {
    const qbRes = await fetch(`${QB_API_BASE_URL}/${realmId}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/json',
      },
    });

    const data = await qbRes.json();

    if (!qbRes.ok) {
      return res.status(qbRes.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('QuickBooks API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// QuickBooks query endpoint (for SQL-like queries)
router.get('/quickbooks-query', async (req, res) => {
  const { query, realmId } = req.query;

  if (!realmId) {
    return res.status(400).json({ error: 'realmId query param required' });
  }

  if (!query) {
    return res.status(400).json({ error: 'query param required' });
  }

  const tokens = await getValidTokensForRealm(realmId);
  if (!tokens) {
    return res
      .status(401)
      .json({ error: 'Not connected to this QuickBooks company' });
  }

  try {
    const qbRes = await fetch(
      `${QB_API_BASE_URL}/${realmId}/query?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: 'application/json',
        },
      }
    );

    const data = await qbRes.json();

    if (!qbRes.ok) {
      return res.status(qbRes.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('QuickBooks query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Disconnect a specific QuickBooks company
router.post('/quickbooks/disconnect/:realmId', async (req, res) => {
  const { realmId } = req.params;
  const tokens = loadRealmTokens(realmId);

  if (tokens) {
    // Revoke token at Intuit
    await revokeToken(tokens.access_token);
  }

  deleteRealmTokens(realmId);
  res.json({ success: true });
});

// Disconnect all QuickBooks companies
router.post('/quickbooks/disconnect-all', async (req, res) => {
  const realms = loadAllRealms();

  // Revoke all tokens
  for (const realm of realms) {
    await revokeToken(realm.access_token);
  }

  deleteAllQBTokens();
  res.json({ success: true });
});

export default router;
