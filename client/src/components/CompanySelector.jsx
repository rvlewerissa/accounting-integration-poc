export function CompanySelector({ companies, selectedRealmId, onSelect }) {
  if (!companies || companies.length === 0) return null;

  return (
    <div>
      <label
        htmlFor="company-select"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Company
      </label>
      <select
        id="company-select"
        value={selectedRealmId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        <option value="">Select a company...</option>
        {companies.map((company) => (
          <option key={company.realmId} value={company.realmId}>
            {company.name} {company.expired ? '(expired)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
