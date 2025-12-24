import { useState } from 'react';
import { callXeroApi } from '../api/xero';

export const XERO_API_BASE = 'https://api.xero.com/api.xro/2.0';

export const ENDPOINTS = [
  { label: 'Organisation', path: '/Organisation' },
  { label: 'Invoices', path: '/Invoices' },
  { label: 'Contacts', path: '/Contacts' },
  { label: 'Accounts', path: '/Accounts' },
  { label: 'Bank Transactions', path: '/BankTransactions' },
  { label: 'Items', path: '/Items' },
  { label: 'Payments', path: '/Payments' },
  { label: 'Journals', path: '/Journals' },
];

export function ApiExplorer({ tenantId, selectedEndpoint, onEndpointChange }) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await callXeroApi(selectedEndpoint, tenantId);
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          value={selectedEndpoint}
          onChange={(e) => onEndpointChange(e.target.value)}
          disabled={!tenantId}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {ENDPOINTS.map((ep) => (
            <option key={ep.path} value={ep.path}>
              {ep.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleExecute}
          disabled={!tenantId || loading}
          className="px-4 py-2 bg-sky-500 text-white rounded-md font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Execute'}
        </button>
      </div>

      {!tenantId && (
        <p className="text-sm text-gray-500">
          Select an organization to explore the API.
        </p>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm font-mono whitespace-pre-wrap">
          {error}
        </div>
      )}

      {response && (
        <div className="border border-gray-200 rounded-md">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            Response
          </div>
          <pre className="p-4 text-sm font-mono overflow-auto max-h-96 bg-gray-900 text-green-400">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
