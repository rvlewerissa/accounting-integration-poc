// QuickBooks API URLs
export const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
export const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
export const QB_REVOKE_URL = 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke';
export const QB_USERINFO_URL = 'https://accounts.platform.intuit.com/v1/openid_connect/userinfo';

// API Base URLs (sandbox vs production)
export const QB_SANDBOX_API_URL = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
export const QB_PRODUCTION_API_URL = 'https://quickbooks.api.intuit.com/v3/company';

export const QB_API_BASE_URL = process.env.QB_ENVIRONMENT === 'production'
  ? QB_PRODUCTION_API_URL
  : QB_SANDBOX_API_URL;

// OAuth scopes
export const QB_SCOPES = [
  'com.intuit.quickbooks.accounting',
  'openid',
  'profile',
  'email',
].join(' ');

// Environment config
export const QB_CLIENT_ID = process.env.QB_CLIENT_ID;
export const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET;
export const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI || 'http://localhost:3000/auth/quickbooks/callback';
export const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || 'sandbox';
