import { API_URL } from '../config/constants';

export async function fetchXeroStatus() {
  const res = await fetch(`${API_URL}/api/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function disconnectXero() {
  const res = await fetch(`${API_URL}/api/disconnect`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to disconnect');
  return res.json();
}

export function getXeroAuthUrl() {
  return `${API_URL}/auth/xero`;
}
