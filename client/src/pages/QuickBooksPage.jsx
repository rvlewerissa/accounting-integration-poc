import { useState } from 'react';
import { useQBStatus } from '../hooks/useQBStatus';
import { useQBDisconnect, useQBDisconnectAll } from '../hooks/useQBDisconnect';
import { useQBAuth } from '../hooks/useQBAuth';
import { StatusIndicator } from '../components/StatusIndicator';
import { CompanySelector } from '../components/CompanySelector';
import { QBApiExplorer } from '../components/QBApiExplorer';

const QB_API_BASE = 'https://sandbox-quickbooks.api.intuit.com/v3/company';

export function QuickBooksPage() {
  const { isLoading, error, connected, companies, scopes } = useQBStatus();
  const disconnectMutation = useQBDisconnect();
  const disconnectAllMutation = useQBDisconnectAll();
  const { connect, popupError } = useQBAuth();
  const [selectedRealmId, setSelectedRealmId] = useState(null);

  // Auto-select first company if none selected
  const effectiveRealmId = selectedRealmId || companies[0]?.realmId;
  const selectedCompany = companies.find((c) => c.realmId === effectiveRealmId);

  const displayError =
    popupError || error?.message || disconnectMutation.error?.message;

  if (isLoading) {
    return (
      <div className="flex gap-6 w-full justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md flex-2 max-w-4xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            QuickBooks Integration
          </h2>
          <div className="p-4 bg-gray-50 rounded text-gray-600">
            Checking connection status...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 w-full justify-center">
      {/* Left: Main Panel */}
      <div className="bg-white p-8 rounded-lg shadow-md flex-2 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            QuickBooks Integration
          </h2>
          <StatusIndicator connected={connected} />
        </div>

        {displayError && (
          <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
            {displayError}
          </div>
        )}

        {!connected && (
          <button
            className="px-6 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors"
            onClick={connect}
          >
            Connect to QuickBooks
          </button>
        )}

        {connected && (
          <div className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <CompanySelector
                  companies={companies}
                  selectedRealmId={effectiveRealmId}
                  onSelect={setSelectedRealmId}
                />
              </div>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors"
                onClick={connect}
              >
                Add Company
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (effectiveRealmId) {
                    disconnectMutation.mutate(effectiveRealmId);
                    setSelectedRealmId(null);
                  }
                }}
                disabled={disconnectMutation.isPending || !effectiveRealmId}
              >
                {disconnectMutation.isPending
                  ? 'Disconnecting...'
                  : 'Disconnect'}
              </button>
            </div>

            {companies.length > 1 && (
              <div className="text-sm text-gray-500">
                {companies.length} companies connected.{' '}
                <button
                  className="text-red-600 hover:text-red-700 underline"
                  onClick={() => {
                    disconnectAllMutation.mutate();
                    setSelectedRealmId(null);
                  }}
                  disabled={disconnectAllMutation.isPending}
                >
                  Disconnect all
                </button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                API Explorer
              </h3>
              <QBApiExplorer realmId={effectiveRealmId} />
            </div>
          </div>
        )}
      </div>

      {/* Right: Request Info Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md flex-1 max-w-sm overflow-hidden">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Request Info</h3>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Base URL
            </div>
            <code className="block text-sm bg-gray-100 p-2 rounded break-all">
              {QB_API_BASE}/{effectiveRealmId || '<realm_id>'}
            </code>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Headers
            </div>
            <div className="text-sm bg-gray-100 p-2 rounded font-mono space-y-1">
              <div>
                <span className="text-purple-600">Authorization:</span>
                <br />
                <span className="text-gray-600">Bearer {'<access_token>'}</span>
              </div>
              <div>
                <span className="text-purple-600">Accept:</span>
                <br />
                <span className="text-gray-600">application/json</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Company
            </div>
            <div className="text-sm bg-gray-100 p-2 rounded">
              <div className="text-gray-600">
                {selectedCompany?.name || '<not selected>'}
              </div>
              {selectedCompany?.country && (
                <div className="text-xs text-gray-500">
                  {selectedCompany.country}
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Realm ID
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all text-gray-600">
              {effectiveRealmId || '<not selected>'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Scopes
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all text-gray-600">
              {scopes || '<not connected>'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Connected Companies
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded text-gray-600">
              {companies.length > 0 ? (
                <ul className="space-y-1">
                  {companies.map((c) => (
                    <li
                      key={c.realmId}
                      className={
                        c.realmId === effectiveRealmId ? 'font-medium' : ''
                      }
                    >
                      {c.name}{' '}
                      {c.expired && (
                        <span className="text-red-500">(expired)</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                '<none>'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
