import {
  XERO_TOKEN_URL,
  XERO_CONNECTIONS_URL,
  XERO_CLIENT_ID,
  XERO_CLIENT_SECRET,
  REDIRECT_URI,
} from '../config/xero.js';
import { saveTokens, loadTokens } from '../utils/xero-tokens.js';

const XERO_BASIC_AUTH = Buffer.from(
  `${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`
).toString('base64');

export async function exchangeCodeForTokens(code) {
  const response = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${XERO_BASIC_AUTH}`,
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

export async function getConnections(accessToken) {
  const response = await fetch(XERO_CONNECTIONS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get connections: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch(XERO_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${XERO_BASIC_AUTH}`,
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

export async function getValidTokens() {
  const tokens = loadTokens();

  if (!tokens) {
    return null;
  }

  if (Date.now() >= tokens.expires_at) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      const tenants = await getConnections(newTokens.access_token);

      const tokenData = {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: Date.now() + newTokens.expires_in * 1000,
        id_token: newTokens.id_token,
        tenants: tenants,
      };
      saveTokens(tokenData);

      return tokenData;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return null;
    }
  }

  return tokens;
}
