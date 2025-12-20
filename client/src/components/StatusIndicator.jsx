export function StatusIndicator({ connected }) {
  return (
    <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
      {connected ? 'Connected to Xero' : 'Not connected to Xero'}
    </div>
  );
}
