import { useState } from 'react';
import { callQBApi, callQBQuery } from '../api/quickbooks';

// QuickBooks uses SQL-like queries, but also has direct endpoints
export const QB_ENDPOINTS = [
  { label: 'Company Info', path: '/companyinfo', isQuery: false },
  { label: 'Invoices', query: 'SELECT * FROM Invoice MAXRESULTS 10', isQuery: true },
  { label: 'Customers', query: 'SELECT * FROM Customer MAXRESULTS 10', isQuery: true },
  { label: 'Vendors', query: 'SELECT * FROM Vendor MAXRESULTS 10', isQuery: true },
  { label: 'Accounts', query: 'SELECT * FROM Account MAXRESULTS 10', isQuery: true },
  { label: 'Items', query: 'SELECT * FROM Item MAXRESULTS 10', isQuery: true },
  { label: 'Payments', query: 'SELECT * FROM Payment MAXRESULTS 10', isQuery: true },
  { label: 'Bills', query: 'SELECT * FROM Bill MAXRESULTS 10', isQuery: true },
  { label: 'Purchases', query: 'SELECT * FROM Purchase MAXRESULTS 10', isQuery: true },
];

export function QBApiExplorer({ realmId }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedEndpoint = QB_ENDPOINTS[selectedIndex];

  const handleExecute = async () => {
    if (!realmId) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let data;
      if (selectedEndpoint.isQuery) {
        data = await callQBQuery(selectedEndpoint.query, realmId);
      } else {
        // For companyinfo, we need to append the realmId
        const endpoint = selectedEndpoint.path === '/companyinfo'
          ? `/companyinfo/${realmId}`
          : selectedEndpoint.path;
        data = await callQBApi(endpoint, realmId);
      }
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
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          disabled={!realmId}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {QB_ENDPOINTS.map((ep, idx) => (
            <option key={idx} value={idx}>
              {ep.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleExecute}
          disabled={!realmId || loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Execute'}
        </button>
      </div>

      {selectedEndpoint.isQuery && (
        <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
          Query: {selectedEndpoint.query}
        </div>
      )}

      {!realmId && (
        <p className="text-sm text-gray-500">Connect to QuickBooks to explore the API.</p>
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
