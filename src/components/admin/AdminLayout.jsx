import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AdminLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            {title && (
              <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
