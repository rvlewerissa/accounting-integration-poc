// Xero API URLs
export const XERO_AUTH_URL =
  'https://login.xero.com/identity/connect/authorize';
export const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
export const XERO_CONNECTIONS_URL = 'https://api.xero.com/connections';
export const XERO_API_BASE_URL = 'https://api.xero.com/api.xro/2.0';

// OAuth scopes
export const SCOPES = [
  'openid',
  'profile',
  'email',
  'accounting.transactions.read',
  'accounting.contacts.read',
  'accounting.settings.read',
  'accounting.journals.read',
  'offline_access',
].join(' ');

// Environment config
export const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID;
export const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;
export const REDIRECT_URI =
  process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback';
