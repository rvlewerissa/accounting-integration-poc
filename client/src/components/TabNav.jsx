import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/xero', label: 'Xero' },
  { path: '/quickbooks', label: 'QuickBooks' },
];

export function TabNav() {
  return (
    <nav className="flex border-b-2 border-gray-200 -mx-8 px-8">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `px-6 py-3 font-medium text-sm transition-colors -mb-0.5 border-b-2 ${
              isActive
                ? 'text-sky-500 border-sky-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
