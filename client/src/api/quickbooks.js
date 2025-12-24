import { API_URL } from '../config/constants';

export async function fetchQBStatus() {
  const res = await fetch(`${API_URL}/api/quickbooks/status`);
  if (!res.ok) throw new Error('Failed to fetch QuickBooks status');
  return res.json();
}

export async function disconnectQB(realmId) {
  const res = await fetch(`${API_URL}/api/quickbooks/disconnect/${realmId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to disconnect');
  return res.json();
}

export async function disconnectAllQB() {
  const res = await fetch(`${API_URL}/api/quickbooks/disconnect-all`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to disconnect all');
  return res.json();
}

export function getQBAuthUrl() {
  return `${API_URL}/auth/quickbooks`;
}

export async function callQBApi(endpoint, realmId) {
  const res = await fetch(
    `${API_URL}/api/quickbooks${endpoint}?realmId=${realmId}`
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || `QuickBooks API error: ${res.status}`);
  }

  return res.json();
}

export async function callQBQuery(query, realmId) {
  const res = await fetch(
    `${API_URL}/api/quickbooks-query?realmId=${realmId}&query=${encodeURIComponent(
      query
    )}`
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || `QuickBooks query error: ${res.status}`);
  }

  return res.json();
}

export async function fetchQBToken(realmId) {
  const res = await fetch(`${API_URL}/api/quickbooks/token/${realmId}`);
  if (!res.ok) throw new Error('Failed to fetch token');
  return res.json();
}
