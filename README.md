# Accounting Integration POC

A proof-of-concept demonstrating OAuth integration with Xero and QuickBooks accounting platforms.

## Structure

```
├── client/          # React frontend (Vite + TailwindCSS)
└── server/          # Express backend
```

## Prerequisites

- Node.js 18+
- Xero and/or QuickBooks developer accounts

## Setup

### Server

```bash
cd server
npm install
```

Create `.env` file with your credentials:

```env
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
```

### Client

```bash
cd client
npm install
```

## Running

Start both server and client:

```bash
# Terminal 1 - Server (port 3000)
cd server
npm run dev

# Terminal 2 - Client (port 5173)
cd client
npm run dev
```

## API Endpoints

| Endpoint               | Description                 |
| ---------------------- | --------------------------- |
| `GET /auth/xero`       | Start Xero OAuth flow       |
| `GET /auth/quickbooks` | Start QuickBooks OAuth flow |
| `GET /api/status`      | Get connection status       |
| `GET /api/connections` | Get connected tenants       |
| `POST /api/disconnect` | Clear tokens                |
