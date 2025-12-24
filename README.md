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

### Auth

| Endpoint                        | Description                |
| ------------------------------- | -------------------------- |
| `GET /auth/xero`                | Start Xero OAuth flow      |
| `GET /auth/callback`            | Xero OAuth callback        |
| `GET /auth/quickbooks`          | Start QuickBooks OAuth     |
| `GET /auth/quickbooks/callback` | QuickBooks OAuth callback  |

### Xero

| Endpoint               | Description                |
| ---------------------- | -------------------------- |
| `GET /api/status`      | Xero connection status     |
| `GET /api/connections` | Get connected Xero tenants |
| `GET /api/token`       | Get Xero access token      |
| `GET /api/xero/*`      | Proxy Xero API calls       |
| `POST /api/disconnect` | Disconnect Xero            |

### QuickBooks

| Endpoint                              | Description                 |
| ------------------------------------- | --------------------------- |
| `GET /api/quickbooks/status`          | QuickBooks connection status|
| `GET /api/quickbooks/token/:realmId`  | Get tokens for a realm      |
| `GET /api/quickbooks/*`               | Proxy QuickBooks API calls  |
| `GET /api/quickbooks-query`           | QuickBooks SQL-like query   |
| `POST /api/quickbooks/disconnect/:id` | Disconnect specific company |
| `POST /api/quickbooks/disconnect-all` | Disconnect all companies    |
