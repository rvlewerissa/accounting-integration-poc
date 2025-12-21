import { Router } from 'express';
import { XERO_API_BASE_URL, SCOPES } from '../config/xero.js';
import { loadTokens, deleteTokens } from '../utils/tokens.js';
import { requireXeroAuth } from '../middleware/auth.js';

const router = Router();

// Get current connections
router.get('/connections', requireXeroAuth, async (req, res) => {
  res.json({ tenants: req.xeroTokens.tenants });
});

// Get token status (for debugging)
router.get('/status', (req, res) => {
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

// Proxy Xero API calls
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

// Get access token (for frontend direct API calls)
router.get('/token', requireXeroAuth, async (req, res) => {
  res.json({
    access_token: req.xeroTokens.access_token,
    expires_at: req.xeroTokens.expires_at,
  });
});

// Disconnect (clear tokens)
router.post('/disconnect', (req, res) => {
  deleteTokens();
  res.json({ success: true });
});

export default router;
