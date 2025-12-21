export function QuickBooksPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">QuickBooks Integration</h2>

      <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
        Not connected to QuickBooks
      </div>

      <div className="p-4 bg-gray-50 rounded mb-4 text-gray-500 text-center">
        QuickBooks integration coming soon.
      </div>

      <button
        className="px-6 py-3 bg-sky-500 text-white rounded font-medium opacity-50 cursor-not-allowed"
        disabled
      >
        Connect to QuickBooks
      </button>
    </div>
  );
}
