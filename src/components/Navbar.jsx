import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Menu, X, PlusCircle, Home } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setIsOpen(false), [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Browse Rooms', icon: Home },
    { to: '/list-property', label: 'List Your Room', icon: PlusCircle },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white border-b border-ocean-100'
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-ocean-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="block font-bold text-ocean-900 text-[17px]">Daily Room</span>
              <span className="block text-[11px] text-ocean-500 font-semibold tracking-wide uppercase">Maldives</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-ocean-100 text-ocean-700'
                    : 'text-gray-600 hover:text-ocean-700 hover:bg-ocean-50'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link to="/list-property" className="btn-coral text-sm ml-3 py-2 px-4">
              + Post a Room
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-ocean-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-ocean-100 bg-white overflow-hidden"
          >
            <div className="page-container py-3 flex flex-col gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === to
                      ? 'bg-ocean-100 text-ocean-700'
                      : 'text-gray-600 hover:bg-ocean-50 hover:text-ocean-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <Link
                to="/list-property"
                className="btn-coral text-sm mt-1 w-full justify-center"
              >
                + Post a Room
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
