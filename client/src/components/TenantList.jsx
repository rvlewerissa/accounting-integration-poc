export function TenantList({ tenants }) {
  if (tenants.length === 0) return null;

  return (
    <div className="tenants">
      <h3>Connected Organizations:</h3>
      {tenants.map((tenant) => (
        <div key={tenant.id || tenant.tenantId} className="tenant">
          <div className="tenant-name">{tenant.name || tenant.tenantName}</div>
          <div className="tenant-id">{tenant.id || tenant.tenantId}</div>
        </div>
      ))}
    </div>
  );
}
