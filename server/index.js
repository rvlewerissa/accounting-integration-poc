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
  console.log('Endpoints:');
  console.log('  GET  /auth/xero       - Start OAuth flow');
  console.log('  GET  /auth/callback   - OAuth callback');
  console.log('  GET  /api/connections - Get connected tenants');
  console.log('  GET  /api/status      - Get connection status');
  console.log('  GET  /api/xero/*      - Proxy Xero API calls');
  console.log('  POST /api/disconnect  - Clear tokens');
});
