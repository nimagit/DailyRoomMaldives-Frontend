import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PlusCircle, Search, Edit3, Trash2, Star, ShieldCheck, Zap,
  Eye, ChevronLeft, ChevronRight, MoreVertical, X, Home,
} from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const STATUS_STYLES = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-600',
};

import { LOCATION_MAP as LOCATION_LABELS } from '../../utils/locations';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
      >
        <h3 className="font-bold text-gray-900 mb-2">Confirm Action</h3>
        <p className="text-gray-500 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn-danger flex-1">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ManageListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const statusFilter = searchParams.get('status') || '';
  const typeFilter = searchParams.get('type') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const { data } = await api.get(`/listings/admin/all?${params}`);
      setListings(data.listings);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
  };

  const withLoading = (id, fn) => async () => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try { await fn(); } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(null);
    try {
      await api.delete(`/listings/admin/${id}`);
      toast.success('Listing deleted');
      fetchListings();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleTogglePremium = (listing) => withLoading(listing._id + '_premium', async () => {
    const isPremium = !listing.isPremium;
    await api.patch(`/listings/admin/${listing._id}/premium`, { isPremium, days: 30 });
    toast.success(isPremium ? 'Set as Premium (30 days)' : 'Removed from Premium');
    fetchListings();
  })();

  const handleToggleVerified = (listing) => withLoading(listing._id + '_verified', async () => {
    await api.patch(`/listings/admin/${listing._id}/verified`, { isVerified: !listing.isVerified });
    toast.success(listing.isVerified ? 'Verification removed' : 'Listing verified');
    fetchListings();
  })();

  const handleToggleUrgent = (listing) => withLoading(listing._id + '_urgent', async () => {
    const isUrgent = !listing.isUrgent;
    await api.patch(`/listings/admin/${listing._id}/urgent`, { isUrgent });
    toast.success(isUrgent ? 'Marked as Hot Deal (24h)' : 'Hot Deal removed');
    fetchListings();
  })();

  const isPremiumActive = (l) => l.isPremium && l.premiumExpiry && new Date(l.premiumExpiry) > new Date();
  const isUrgentActive = (l) => l.isUrgent && l.urgentExpiry && new Date(l.urgentExpiry) > new Date();

  return (
    <AdminLayout title="Manage Listings" subtitle={`${total} total listings`}>
      {deleteTarget && (
        <ConfirmModal
          message="Are you sure you want to delete this listing? This action cannot be undone."
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          {['', 'published', 'draft', 'expired'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter('status', s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s ? 'bg-ocean-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-ocean-300'
              }`}
            >
              {s || 'All Status'}
            </button>
          ))}
          <span className="w-px bg-gray-200" />
          {/* Type filter */}
          {['', 'daily', 'monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter('type', t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === t ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              {t || 'All Types'}
            </button>
          ))}
        </div>

        <Link to="/admin/listings/new" className="btn-primary gap-2 ml-auto text-sm">
          <PlusCircle className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No listings found</p>
            <Link to="/admin/listings/new" className="btn-primary mt-4 inline-flex">Add First Listing</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Listing</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Location</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Badges</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Views</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {listings.map((listing, i) => (
                    <motion.tr
                      key={listing._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 max-w-[220px]">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-ocean-100 flex-shrink-0">
                            {listing.images?.[0] ? (
                              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Home className="w-5 h-5 text-ocean-300" /></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 truncate text-xs">{listing.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[11px] ${listing.type === 'daily' ? 'badge-daily' : 'badge-monthly'}`}>
                          {listing.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {LOCATION_LABELS[listing.location] || listing.location}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ocean-700 whitespace-nowrap text-xs">
                        {listing.currency} {listing.price?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[11px] ${STATUS_STYLES[listing.status]}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePremium(listing)}
                            disabled={actionLoading[listing._id + '_premium']}
                            title="Toggle Premium"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              isPremiumActive(listing)
                                ? 'bg-amber-400 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleVerified(listing)}
                            disabled={actionLoading[listing._id + '_verified']}
                            title="Toggle Verified"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              listing.isVerified
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleUrgent(listing)}
                            disabled={actionLoading[listing._id + '_urgent']}
                            title="Toggle Hot Deal"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              isUrgentActive(listing)
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {listing.views}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/listings/${listing._id}/edit`}
                            className="w-8 h-8 rounded-lg bg-ocean-50 hover:bg-ocean-100 flex items-center justify-center text-ocean-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(listing._id)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {page} of {pages} · {total} listings
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= pages}
                    onClick={() => setPage(page + 1)}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
