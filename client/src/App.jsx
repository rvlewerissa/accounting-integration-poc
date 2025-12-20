import { useXeroStatus } from './hooks/useXeroStatus';
import { useXeroDisconnect } from './hooks/useXeroDisconnect';
import { useXeroAuth } from './hooks/useXeroAuth';
import { StatusIndicator } from './components/StatusIndicator';
import { TenantList } from './components/TenantList';

function App() {
  const { isLoading, error, connected, tenants } = useXeroStatus();
  const disconnectMutation = useXeroDisconnect();
  const { connect, popupError } = useXeroAuth();

  const displayError = popupError || error?.message || disconnectMutation.error?.message;

  if (isLoading) {
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

      <StatusIndicator connected={connected} />

      {displayError && <div className="error">{displayError}</div>}

      <div className="actions">
        {!connected && (
          <button className="btn btn-primary" onClick={connect}>
            Connect to Xero
          </button>
        )}
        {connected && (
          <button
            className="btn btn-danger"
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
          </button>
        )}
      </div>

      {connected && <TenantList tenants={tenants} />}
    </div>
  );
}

export default App;
