import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Megaphone, Plus, Camera, X, Loader2, Play, Pause,
  Trash2, Edit3, Clock, CheckCircle, AlertCircle, Save, Home,
} from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

function daysLeft(expiresAt) {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function AdPreviewCard({ ad }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-52 shadow-2xl">
      <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-ocean-200">
        {ad.image ? (
          <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ocean-400 text-xs">No Image</div>
        )}
      </div>
      <p className="text-white font-semibold text-sm leading-tight mb-1">
        {ad.title} · {ad.location}
      </p>
      <p className="text-teal-300 font-bold text-sm">
        {ad.currency} {Number(ad.price).toLocaleString()}
        <span className="text-white/50 font-normal text-xs"> /night</span>
      </p>
      <div className="flex items-center gap-1 mt-2">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white/60 text-xs">Available now</span>
      </div>
    </div>
  );
}

export default function HeroAdManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { currency: 'MVR', daysToShow: 7 },
  });
  const watchCurrency = watch('currency');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hero-ad/admin/all');
      setAds(data);
    } catch {
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const openCreate = () => {
    setEditingAd(null);
    setImageFile(null);
    setImagePreview(null);
    reset({ currency: 'MVR', daysToShow: 7 });
    setShowForm(true);
  };

  const openEdit = (ad) => {
    setEditingAd(ad);
    setImageFile(null);
    setImagePreview(ad.image || null);
    reset({
      title: ad.title,
      location: ad.location,
      price: ad.price,
      currency: ad.currency,
      linkUrl: ad.linkUrl || '',
      daysToShow: ad.daysToShow,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAd(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const data = {
        title: formData.title,
        location: formData.location,
        price: Number(formData.price),
        currency: formData.currency,
        linkUrl: formData.linkUrl || undefined,
        daysToShow: Number(formData.daysToShow),
      };

      const fd = new FormData();
      fd.append('data', JSON.stringify(data));
      if (imageFile) fd.append('image', imageFile);

      if (editingAd) {
        await api.put(`/hero-ad/admin/${editingAd._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Ad updated!');
      } else {
        await api.post('/hero-ad/admin', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Ad created!');
      }
      closeForm();
      fetchAds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save ad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id) => {
    setActionLoading((p) => ({ ...p, [id + '_act']: true }));
    try {
      await api.patch(`/hero-ad/admin/${id}/activate`);
      toast.success('Ad is now live on the hero section!');
      fetchAds();
    } catch {
      toast.error('Failed to activate');
    } finally {
      setActionLoading((p) => ({ ...p, [id + '_act']: false }));
    }
  };

  const handleDeactivate = async (id) => {
    setActionLoading((p) => ({ ...p, [id + '_deact']: true }));
    try {
      await api.patch(`/hero-ad/admin/${id}/deactivate`);
      toast.success('Ad deactivated');
      fetchAds();
    } catch {
      toast.error('Failed to deactivate');
    } finally {
      setActionLoading((p) => ({ ...p, [id + '_deact']: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    try {
      await api.delete(`/hero-ad/admin/${id}`);
      toast.success('Ad deleted');
      fetchAds();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const activeAd = ads.find((a) => a.isActive && a.expiresAt && new Date(a.expiresAt) > new Date());

  return (
    <AdminLayout title="Hero Ad Manager" subtitle="Control the floating ad card shown in the homepage hero section">

      {/* ── Live preview banner ──────────────────────────────── */}
      {activeAd && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl overflow-hidden"
        >
          <div className="bg-ocean-gradient p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <AdPreviewCard ad={activeAd} />
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-bold text-lg">Live on Homepage</span>
              </div>
              <p className="text-ocean-200 text-sm mb-1">
                This ad is currently showing in the hero section.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Clock className="w-4 h-4 text-teal-300" />
                <span className="text-sm font-semibold text-teal-300">
                  {daysLeft(activeAd.expiresAt)} day{daysLeft(activeAd.expiresAt) !== 1 ? 's' : ''} remaining
                </span>
                <span className="text-ocean-300 text-xs">
                  · Expires {new Date(activeAd.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900">All Hero Ads</h2>
        <button onClick={openCreate} className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Ad
        </button>
      </div>

      {/* ── Ad list ─────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl shadow-card">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hero ads yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Create an ad to feature a room in the hero section.</p>
          <button onClick={openCreate} className="btn-primary gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create First Ad
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => {
            const isLive = ad.isActive && ad.expiresAt && new Date(ad.expiresAt) > new Date();
            const isExpired = ad.isActive && ad.expiresAt && new Date(ad.expiresAt) <= new Date();
            const remaining = daysLeft(ad.expiresAt);

            return (
              <motion.div
                key={ad._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 ${isLive ? 'ring-2 ring-teal-400/40' : ''}`}
              >
                {/* Thumbnail */}
                <div className="w-16 h-14 rounded-xl overflow-hidden bg-ocean-100 flex-shrink-0">
                  {ad.image ? (
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Home className="w-8 h-8 text-ocean-300" /></div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{ad.title}</span>
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-gray-500 text-xs">{ad.location}</span>
                    {isLive && (
                      <span className="badge bg-teal-100 text-teal-700 text-[10px]">
                        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
                    {isExpired && (
                      <span className="badge bg-red-100 text-red-600 text-[10px]">EXPIRED</span>
                    )}
                    {!ad.isActive && !isExpired && (
                      <span className="badge bg-gray-100 text-gray-500 text-[10px]">INACTIVE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span className="font-semibold text-ocean-600">
                      {ad.currency} {Number(ad.price).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ad.daysToShow} day{ad.daysToShow !== 1 ? 's' : ''} duration
                    </span>
                    {isLive && (
                      <span className="text-teal-600 font-medium">
                        {remaining}d left · expires {new Date(ad.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isLive ? (
                    <button
                      onClick={() => handleActivate(ad._id)}
                      disabled={actionLoading[ad._id + '_act']}
                      className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      title="Activate this ad"
                    >
                      {actionLoading[ad._id + '_act']
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Play className="w-3.5 h-3.5 fill-current" />
                      }
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeactivate(ad._id)}
                      disabled={actionLoading[ad._id + '_deact']}
                      className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      title="Deactivate"
                    >
                      {actionLoading[ad._id + '_deact']
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Pause className="w-3.5 h-3.5 fill-current" />
                      }
                      Pause
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(ad)}
                    className="w-8 h-8 rounded-lg bg-ocean-50 hover:bg-ocean-100 flex items-center justify-center text-ocean-600 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit form modal ─────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg z-10 my-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">
                    {editingAd ? 'Edit Hero Ad' : 'Create Hero Ad'}
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    This will appear as a floating card in the homepage hero section.
                  </p>
                </div>
                <button onClick={closeForm} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Image upload */}
                <div>
                  <label className="label">Ad Photo *</label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden h-40 group">
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-sm font-medium flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Change Photo
                        </span>
                        <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 h-40 border-2 border-dashed border-ocean-200 rounded-xl cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/50 transition-all">
                      <Camera className="w-7 h-7 text-ocean-400" />
                      <span className="text-sm font-medium text-gray-600">Upload Ad Photo</span>
                      <span className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    </label>
                  )}
                </div>

                {/* Title + Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Room / Ad Title *</label>
                    <input
                      className={`input ${errors.title ? 'input-error' : ''}`}
                      placeholder="Overwater Villa"
                      {...register('title', { required: 'Title required' })}
                    />
                    {errors.title && <p className="error-msg">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="label">Location *</label>
                    <input
                      className={`input ${errors.location ? 'input-error' : ''}`}
                      placeholder="Hulhumalé"
                      {...register('location', { required: 'Location required' })}
                    />
                    {errors.location && <p className="error-msg">{errors.location.message}</p>}
                  </div>
                </div>

                {/* Price + Currency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Price *</label>
                    <input
                      type="number" min="0"
                      className={`input ${errors.price ? 'input-error' : ''}`}
                      placeholder="1200"
                      {...register('price', { required: 'Price required', min: { value: 1, message: 'Must be > 0' } })}
                    />
                    {errors.price && <p className="error-msg">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select className="select" {...register('currency')}>
                      <option value="MVR">MVR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                {/* Days to show */}
                <div>
                  <label className="label">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-ocean-500" />
                      Days to Show *
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min="1" max="365"
                      className={`input flex-1 ${errors.daysToShow ? 'input-error' : ''}`}
                      {...register('daysToShow', {
                        required: 'Required',
                        min: { value: 1, message: 'At least 1 day' },
                        max: { value: 365, message: 'Max 365 days' },
                      })}
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">days</span>
                  </div>
                  {errors.daysToShow && <p className="error-msg">{errors.daysToShow.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">Timer starts when you click "Activate" on the ad.</p>
                </div>

                {/* Quick presets */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Quick presets:</p>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 3, 7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => reset((v) => ({ ...v, daysToShow: d }))}
                        className="px-3 py-1 text-xs rounded-lg border border-ocean-200 text-ocean-600 hover:bg-ocean-50 transition-colors font-medium"
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link URL */}
                <div>
                  <label className="label">
                    Link URL <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    className="input"
                    placeholder="/listing/abc123 or https://..."
                    {...register('linkUrl')}
                  />
                  <p className="text-xs text-gray-400 mt-1">Clicking the hero card will open this link.</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeForm} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center gap-2">
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" /> {editingAd ? 'Update Ad' : 'Save Ad'}</>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
