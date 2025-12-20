import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

function App() {
  const [connected, setConnected] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Listen for messages from popup
  useEffect(() => {
    function handleMessage(event) {
      if (event.data.type === 'XERO_AUTH_SUCCESS') {
        setConnected(true);
        setTenants(event.data.tenants);
        setError(null);
      } else if (event.data.type === 'XERO_AUTH_ERROR') {
        setError('Authorization failed: ' + event.data.error);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  async function checkStatus() {
    try {
      const res = await fetch(`${API_URL}/api/status`);
      const data = await res.json();

      if (data.connected) {
        setConnected(true);
        setTenants(data.tenants || []);
      } else {
        setConnected(false);
        setTenants([]);
      }
    } catch (err) {
      setError('Failed to check status: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function connectToXero() {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${API_URL}/auth/xero`,
      'xero-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setError('Popup blocked! Please allow popups for this site.');
    }
  }

  async function disconnect() {
    try {
      await fetch(`${API_URL}/api/disconnect`, { method: 'POST' });
      setConnected(false);
      setTenants([]);
    } catch (err) {
      setError('Failed to disconnect: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h1>Xero OAuth PoC</h1>
        <div className="status">Checking connection status...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Xero OAuth PoC</h1>

      <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? 'Connected to Xero' : 'Not connected to Xero'}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="actions">
        {!connected && (
          <button className="btn btn-primary" onClick={connectToXero}>
            Connect to Xero
          </button>
        )}
        {connected && (
          <button className="btn btn-danger" onClick={disconnect}>
            Disconnect
          </button>
        )}
      </div>

      {connected && tenants.length > 0 && (
        <div className="tenants">
          <h3>Connected Organizations:</h3>
          {tenants.map((tenant) => (
            <div key={tenant.id || tenant.tenantId} className="tenant">
              <div className="tenant-name">{tenant.name || tenant.tenantName}</div>
              <div className="tenant-id">{tenant.id || tenant.tenantId}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
