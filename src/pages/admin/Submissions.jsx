import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Inbox, CheckCircle, XCircle, ArrowUpRight, Trash2,
  Phone, Mail, ChevronDown, ChevronUp, Loader2, ChevronLeft, ChevronRight, Home, BedDouble, Bath, BedSingle,
} from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

import { LOCATION_MAP as LOCATION_LABELS } from '../../utils/locations';

function SubmissionCard({ submission, onAction, loading }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(submission.adminNotes || '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4">
        {submission.images?.[0] ? (
          <img src={submission.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-ocean-100 flex items-center justify-center flex-shrink-0"><Home className="w-6 h-6 text-ocean-400" /></div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{submission.title}</h3>
            <span className={`badge text-[11px] ${STATUS_STYLES[submission.status]}`}>
              {submission.status}
            </span>
            <span className={`badge text-[11px] ${submission.type === 'daily' ? 'badge-daily' : 'badge-monthly'}`}>
              {submission.type}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            <span>{submission.ownerName}</span>
            <span>·</span>
            <span>{LOCATION_LABELS[submission.location] || submission.location}</span>
            <span>·</span>
            <span className="font-semibold text-ocean-600">{submission.currency} {submission.price?.toLocaleString()}</span>
            <span>·</span>
            <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-5 py-4 space-y-4">
              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <p className="font-medium text-sm text-gray-900">{submission.ownerName}</p>
                  {submission.ownerEmail && (
                    <a href={`mailto:${submission.ownerEmail}`} className="flex items-center gap-1 text-xs text-ocean-600 mt-0.5 hover:underline">
                      <Mail className="w-3 h-3" /> {submission.ownerEmail}
                    </a>
                  )}
                  {submission.ownerPhone && (
                    <a href={`tel:${submission.ownerPhone}`} className="flex items-center gap-1 text-xs text-ocean-600 mt-0.5 hover:underline">
                      <Phone className="w-3 h-3" /> {submission.ownerPhone}
                    </a>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{submission.description}</p>
                </div>
              </div>

              {/* Amenities */}
              {submission.amenities?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {submission.amenities.map((a) => (
                      <span key={a} className="text-xs bg-ocean-50 text-ocean-700 px-2 py-1 rounded-lg font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room details */}
              {(submission.rooms || submission.beds || submission.bathrooms) && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Room Details</p>
                  <div className="flex flex-wrap gap-3">
                    {submission.rooms && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <BedDouble className="w-4 h-4 text-ocean-500" />
                        {submission.rooms} {submission.rooms === 1 ? 'Room' : 'Rooms'}
                      </span>
                    )}
                    {submission.beds && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <BedSingle className="w-4 h-4 text-ocean-500" />
                        {submission.beds} {submission.beds === 1 ? 'Bed' : 'Beds'}
                        {submission.bedType && (
                          <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-ocean-50 text-ocean-700 capitalize">
                            {submission.bedType.replace('-', ' ')}
                          </span>
                        )}
                      </span>
                    )}
                    {submission.bathrooms && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Bath className="w-4 h-4 text-ocean-500" />
                        {submission.bathrooms} {submission.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                        {submission.bathroomType && (
                          <span className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full ${submission.bathroomType === 'attached' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {submission.bathroomType === 'attached' ? 'Attached' : 'Shared'}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Images */}
              {submission.images?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Photos ({submission.images.length})</p>
                  <div className="flex gap-2 flex-wrap">
                    {submission.images.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-20 h-16 object-cover rounded-xl" />
                    ))}
                  </div>
                </div>
              )}

              {/* Additional info */}
              {submission.additionalInfo && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-amber-600 font-medium mb-1">Additional Notes from Owner</p>
                  <p className="text-sm text-gray-700">{submission.additionalInfo}</p>
                </div>
              )}

              {/* Admin notes */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Admin Notes</label>
                <textarea
                  rows={2}
                  className="textarea text-sm"
                  placeholder="Internal notes about this submission..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {submission.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onAction(submission._id, 'convert', notes)}
                      disabled={loading}
                      className="btn-primary gap-2 text-sm"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => onAction(submission._id, 'reject', notes)}
                      disabled={loading}
                      className="btn-secondary gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                {submission.status === 'rejected' && (
                  <button
                    onClick={() => onAction(submission._id, 'pending', notes)}
                    disabled={loading}
                    className="btn-secondary gap-2 text-sm"
                  >
                    Move to Pending
                  </button>
                )}
                <button
                  onClick={() => onAction(submission._id, 'delete')}
                  disabled={loading}
                  className="btn-danger gap-2 text-sm ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Submissions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const statusFilter = searchParams.get('status') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/submissions?${params}`);
      setSubmissions(data.submissions);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== 'page') p.set('page', '1');
    setSearchParams(p);
  };

  const goToPage = (p) => setFilter('page', String(p));

  const handleAction = async (id, action, notes) => {
    setActionLoading(true);
    try {
      if (action === 'convert') {
        if (notes) await api.patch(`/submissions/${id}/status`, { status: 'pending', adminNotes: notes });
        await api.post(`/submissions/${id}/convert`);
        toast.success('Listing published successfully!');
      } else if (action === 'delete') {
        await api.delete(`/submissions/${id}`);
        toast.success('Submission deleted');
      } else {
        await api.patch(`/submissions/${id}/status`, { status: action === 'reject' ? 'rejected' : action, adminNotes: notes });
        toast.success(`Submission ${action === 'reject' ? 'rejected' : 'updated'}`);
      }
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Submissions" subtitle={`${total} total owner submissions`}>
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter('status', s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === s ? 'bg-ocean-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-ocean-300'
            }`}
          >
            {s || 'All'} {s === 'pending' && total > 0 ? `(${total})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <SubmissionCard
              key={sub._id}
              submission={sub}
              onAction={handleAction}
              loading={actionLoading}
            />
          ))}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-gray-500">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pages}
                  onClick={() => goToPage(page + 1)}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
