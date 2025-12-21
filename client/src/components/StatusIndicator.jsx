export function StatusIndicator({ connected }) {
  return (
    <div
      className={`p-4 rounded mb-4 ${
        connected
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {connected ? 'Connected to Xero' : 'Not connected to Xero'}
    </div>
  );
}
