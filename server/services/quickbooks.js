import {
  QB_TOKEN_URL,
  QB_REVOKE_URL,
  QB_API_BASE_URL,
  QB_CLIENT_ID,
  QB_CLIENT_SECRET,
  QB_REDIRECT_URI,
} from '../config/quickbooks.js';
import {
  saveRealmTokens,
  loadRealmTokens,
  loadAllRealms,
} from '../utils/qb-tokens.js';

const QB_BASIC_AUTH = Buffer.from(
  `${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`
).toString('base64');

export async function exchangeCodeForTokens(code, realmId) {
  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${QB_BASIC_AUTH}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: QB_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokens = await response.json();

  // Store tokens with realmId (company ID)
  const tokenData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    realmId: realmId,
    token_type: tokens.token_type,
  };

  saveRealmTokens(realmId, tokenData);
  return tokenData;
}

export async function getCompanyInfo(accessToken, realmId) {
  const response = await fetch(
    `${QB_API_BASE_URL}/${realmId}/companyinfo/${realmId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get company info: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${QB_BASIC_AUTH}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
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

export async function revokeToken(token) {
  const response = await fetch(QB_REVOKE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${QB_BASIC_AUTH}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      token: token,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token revocation failed:', error);
    // Don't throw - we still want to delete local tokens
  }

  return response.ok;
}

// Get valid tokens for a specific realm (with auto-refresh)
export async function getValidTokensForRealm(realmId) {
  const tokens = loadRealmTokens(realmId);

  if (!tokens) {
    return null;
  }

  // Check if token is expired (with 5 minute buffer)
  if (Date.now() >= tokens.expires_at - 5 * 60 * 1000) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);

      const tokenData = {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: Date.now() + newTokens.expires_in * 1000,
        realmId: tokens.realmId,
        token_type: newTokens.token_type,
        company: tokens.company, // Preserve company info
      };
      saveRealmTokens(realmId, tokenData);

      return tokenData;
    } catch (err) {
      console.error('Token refresh failed for realm', realmId, ':', err);
      return null;
    }
  }

  return tokens;
}

// Get all connected realms
export function getAllRealms() {
  return loadAllRealms();
}

// Legacy: get first available valid tokens
export async function getValidTokens() {
  const realms = loadAllRealms();
  if (realms.length === 0) return null;
  return getValidTokensForRealm(realms[0].realmId);
}
