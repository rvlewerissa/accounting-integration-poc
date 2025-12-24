import { useState } from 'react';
import { useXeroStatus } from '../hooks/useXeroStatus';
import { useXeroDisconnect } from '../hooks/useXeroDisconnect';
import { useXeroAuth } from '../hooks/useXeroAuth';
import { StatusIndicator } from '../components/StatusIndicator';
import { TenantSelector } from '../components/TenantSelector';
import {
  ApiExplorer,
  ENDPOINTS,
  XERO_API_BASE,
} from '../components/ApiExplorer';

export function XeroPage() {
  const {
    isLoading,
    error,
    connected,
    tenants,
    accessToken,
    refreshToken,
    scopes,
  } = useXeroStatus();
  const disconnectMutation = useXeroDisconnect();
  const { connect, popupError } = useXeroAuth();
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0].path);

  const displayError =
    popupError || error?.message || disconnectMutation.error?.message;

  if (isLoading) {
    return (
      <div className="flex gap-6 w-full justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md flex-2 max-w-4xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Xero Integration
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
            Xero Integration
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
            className="px-6 py-3 bg-sky-500 text-white rounded font-medium hover:bg-sky-600 transition-colors"
            onClick={connect}
          >
            Connect to Xero
          </button>
        )}

        {connected && (
          <div className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <TenantSelector
                  tenants={tenants}
                  selectedTenantId={selectedTenantId}
                  onSelect={setSelectedTenantId}
                />
              </div>
              <button
                className="px-4 py-2 bg-sky-500 text-white rounded font-medium hover:bg-sky-600 transition-colors"
                onClick={connect}
              >
                Manage Organizations
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  disconnectMutation.mutate();
                  setSelectedTenantId(null);
                }}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending
                  ? 'Disconnecting...'
                  : 'Disconnect'}
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                API Explorer
              </h3>
              <ApiExplorer
                tenantId={selectedTenantId}
                selectedEndpoint={selectedEndpoint}
                onEndpointChange={setSelectedEndpoint}
              />
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
              URL
            </div>
            <code className="block text-sm bg-gray-100 p-2 rounded break-all">
              {XERO_API_BASE}
              {selectedEndpoint}
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
                <span className="text-gray-600">
                  Bearer{' '}
                  {accessToken
                    ? `${accessToken.slice(0, 20)}...`
                    : '<access_token>'}
                </span>
              </div>
              <div>
                <span className="text-purple-600">Xero-Tenant-Id:</span>
                <br />
                <span className="text-gray-600 break-all">
                  {selectedTenantId || '<select tenant>'}
                </span>
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
              Scopes
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all text-gray-600">
              {scopes || '<not connected>'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Access Token
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all text-gray-600 max-h-20 overflow-auto">
              {accessToken || '<not connected>'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Refresh Token
            </div>
            <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all text-gray-600 max-h-20 overflow-auto">
              {refreshToken || '<not connected>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
