import { API_URL } from '../config/constants';

export async function fetchXeroStatus() {
  const res = await fetch(`${API_URL}/api/xero/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function disconnectXero() {
  const res = await fetch(`${API_URL}/api/xero/disconnect`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to disconnect');
  return res.json();
}

export function getXeroAuthUrl() {
  return `${API_URL}/auth/xero`;
}

export async function callXeroApi(endpoint, tenantId) {
  const res = await fetch(
    `${API_URL}/api/xero${endpoint}?tenantId=${tenantId}`
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || `Xero API error: ${res.status}`);
  }

  return res.json();
}
