export function TenantSelector({ tenants, selectedTenantId, onSelect }) {
  if (!tenants || tenants.length === 0) return null;

  return (
    <div>
      <label htmlFor="tenant-select" className="block text-sm font-medium text-gray-700 mb-1">
        Organization
      </label>
      <select
        id="tenant-select"
        value={selectedTenantId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      >
        <option value="">Select an organization...</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
