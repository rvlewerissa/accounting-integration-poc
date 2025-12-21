export function TenantList({ tenants }) {
  if (tenants.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-gray-800 font-medium mb-2">Connected Organizations:</h3>
      {tenants.map((tenant) => (
        <div key={tenant.id || tenant.tenantId} className="p-3 bg-gray-50 rounded mb-2">
          <div className="font-semibold text-gray-800">{tenant.name || tenant.tenantName}</div>
          <div className="text-xs text-gray-500 font-mono">{tenant.id || tenant.tenantId}</div>
        </div>
      ))}
    </div>
  );
}
