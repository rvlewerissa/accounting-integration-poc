import { Outlet } from 'react-router-dom';
import { TabNav } from './TabNav';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-8 pt-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Integration Hub
        </h1>
        <TabNav />
      </header>
      <main className="flex-1 p-8 flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}
