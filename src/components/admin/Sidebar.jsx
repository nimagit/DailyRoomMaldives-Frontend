import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, List, PlusCircle, Inbox, LogOut, Waves, X, Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/listings', label: 'All Listings', icon: List },
  { to: '/admin/listings/new', label: 'Add Listing', icon: PlusCircle },
  { to: '/admin/submissions', label: 'Submissions', icon: Inbox },
  { to: '/admin/hero-ad', label: 'Hero Ad', icon: Megaphone },
];

export default function Sidebar({ isOpen, onClose }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-ocean-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center">
            <Waves className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="leading-none">
            <span className="block text-white font-bold text-sm">Daily Room</span>
            <span className="block text-ocean-400 text-[10px] uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden text-ocean-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-ocean-600 text-white shadow-md'
                  : 'text-ocean-300 hover:bg-ocean-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Admin info + Logout */}
      <div className="p-4 border-t border-ocean-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-ocean-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {admin?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
            <p className="text-ocean-400 text-xs truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-ocean-300 hover:bg-red-900/40 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-ocean-950 flex-col fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-64 bg-ocean-950 flex flex-col z-50"
          >
            <SidebarContent />
          </motion.aside>
        </div>
      )}
    </>
  );
}
