import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Auth Endpoints:');
  console.log('  GET  /auth/xero                - Start Xero OAuth flow');
  console.log('  GET  /auth/callback            - Xero OAuth callback');
  console.log('  GET  /auth/quickbooks          - Start QuickBooks OAuth flow');
  console.log('  GET  /auth/quickbooks/callback - QuickBooks OAuth callback');
  console.log('');
  console.log('Xero API:');
  console.log('  GET  /api/xero/status          - Xero connection status');
  console.log('  GET  /api/xero/connections     - Get connected Xero tenants');
  console.log('  GET  /api/xero/token           - Get Xero access token');
  console.log('  GET  /api/xero/*               - Proxy Xero API calls');
  console.log('  POST /api/xero/disconnect      - Disconnect Xero');
  console.log('');
  console.log('QuickBooks API:');
  console.log(
    '  GET  /api/quickbooks/status           - QuickBooks connection status'
  );
  console.log('  GET  /api/quickbooks/token/:realmId   - Get tokens for realm');
  console.log(
    '  GET  /api/quickbooks/*                - Proxy QuickBooks API calls'
  );
  console.log('  GET  /api/quickbooks-query            - QuickBooks SQL query');
  console.log('  POST /api/quickbooks/disconnect/:id   - Disconnect company');
  console.log(
    '  POST /api/quickbooks/disconnect-all   - Disconnect all companies'
  );
});
