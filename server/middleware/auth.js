import { getValidTokens } from '../services/xero.js';
import { getValidTokens as getValidQBTokens } from '../services/quickbooks.js';

export async function requireXeroAuth(req, res, next) {
  const tokens = await getValidTokens();

  if (!tokens) {
    return res.status(401).json({ error: 'Not connected to Xero' });
  }

  req.xeroTokens = tokens;
  next();
}

export async function requireQBAuth(req, res, next) {
  const tokens = await getValidQBTokens();

  if (!tokens) {
    return res.status(401).json({ error: 'Not connected to QuickBooks' });
  }

  req.qbTokens = tokens;
  next();
}
