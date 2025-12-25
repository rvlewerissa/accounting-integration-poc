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

## OAuth Flow

Both Xero and QuickBooks use the standard OAuth 2.0 Authorization Code flow:

```
┌──────────┐      1. User clicks "Connect"       ┌──────────┐
│          │ ──────────────────────────────────> │          │
│  Client  │                                     │  Server  │
│ (React)  │ <────────────────────────────────── │(Express) │
└──────────┘   2. Redirect to provider auth URL  └──────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Xero/QuickBooks │
                   │   Login Page     │
                   └─────────────────┘
                            │
        3. User authorizes, provider redirects
           with authorization code
                            │
                            ▼
┌──────────┐      4. Exchange code for tokens    ┌──────────┐
│          │                                     │          │
│  Server  │ ──────────────────────────────────> │  Xero/QB │
│          │ <────────────────────────────────── │   API    │
└──────────┘      5. Return access + refresh     └──────────┘
                     tokens
```

**Steps:**

1. **User initiates connection** - User clicks "Connect to Xero" or "Connect to QuickBooks" button in the React client. The client redirects to the server's auth endpoint (`/auth/xero` or `/auth/quickbooks`).

2. **Server redirects to provider** - The server constructs an authorization URL with the client ID, redirect URI, requested scopes, and a state parameter for security. The user's browser is redirected to Xero or QuickBooks login page.

3. **User authorizes access** - User logs into their Xero/QuickBooks account and reviews the permissions requested. They can choose which organization (tenant) to connect and grant access.

4. **Provider redirects with authorization code** - After approval, the provider redirects back to the server's callback URL (`/auth/callback` or `/auth/quickbooks/callback`) with a short-lived authorization code and the state parameter.

5. **Server exchanges code for tokens** - The server makes a backend request to the provider's token endpoint, sending the authorization code along with the client ID and secret. This exchange happens server-side to keep credentials secure.

6. **Tokens received and stored** - The provider returns an access token (short-lived, ~30 min) and refresh token (long-lived). These are stored server-side in memory. The access token is used for API calls; the refresh token is used to obtain new access tokens when they expire.
