import { getValidTokens } from '../services/xero.js';

export async function requireXeroAuth(req, res, next) {
  const tokens = await getValidTokens();

  if (!tokens) {
    return res.status(401).json({ error: 'Not connected to Xero' });
  }

  req.xeroTokens = tokens;
  next();
}
