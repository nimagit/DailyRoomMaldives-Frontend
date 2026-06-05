import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Waves, Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import CompareModal from './components/CompareModal';
import CompareBar from './components/CompareBar';

import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import ListProperty from './pages/ListProperty';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageListings from './pages/admin/ManageListings';
import Submissions from './pages/admin/Submissions';
import ListingForm from './pages/admin/ListingForm';
import HeroAdManager from './pages/admin/HeroAdManager';

/* ── Full-screen verifying state ─────────────────────────────── */
function AuthVerifying() {
  return (
    <div className="min-h-screen bg-ocean-gradient flex flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Waves className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg">Daily Room Maldives</span>
      </div>
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      <p className="text-white/60 text-sm font-medium">Verifying session…</p>
    </div>
  );
}

/* ── Admin route guard using Outlet (layout route pattern) ───── */
function AdminGuard() {
  const { admin, loading } = useAuth();

  if (loading) return <AuthVerifying />;

  if (!admin) {
    // Not authenticated — always show login
    return (
      <motion.div
        key="redirect"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Navigate to="/admin/login" replace />
      </motion.div>
    );
  }

  // Authenticated — render the matched child route
  return <Outlet />;
}

/* ── Login page guard — redirect to dashboard if already in ──── */
function LoginGuard() {
  const { admin, loading } = useAuth();
  if (loading) return <AuthVerifying />;
  if (admin) return <Navigate to="/admin" replace />;
  return <AdminLogin />;
}

export default function App() {
  return (
    <AuthProvider>
      <CompareProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
            error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
          }}
        />
        <Routes>
          {/* ── Public routes ──────────────────────────── */}
          <Route path="/"               element={<Home />} />
          <Route path="/listing/:id"    element={<ListingDetail />} />
          <Route path="/list-property"  element={<ListProperty />} />

          {/* ── Admin login (redirects away if already logged in) */}
          <Route path="/admin/login" element={<LoginGuard />} />

          {/* ── Protected admin routes — ALL guarded by AdminGuard */}
          <Route element={<AdminGuard />}>
            <Route path="/admin"                      element={<AdminDashboard />} />
            <Route path="/admin/listings"             element={<ManageListings />} />
            <Route path="/admin/listings/new"         element={<ListingForm />} />
            <Route path="/admin/listings/:id/edit"    element={<ListingForm />} />
            <Route path="/admin/submissions"          element={<Submissions />} />
            <Route path="/admin/hero-ad"              element={<HeroAdManager />} />
          </Route>

          {/* ── Fallback ───────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CompareBar />
        <CompareModal />
      </BrowserRouter>
      </CompareProvider>
    </AuthProvider>
  );
}
