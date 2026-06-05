import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Save, ArrowLeft, Camera, X, Loader2, Star, ShieldCheck, Zap, Trash2, Moon, CalendarDays,
} from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

import { LOCATIONS } from '../../utils/locations';

const AMENITY_OPTIONS = [
  'WiFi', 'AC', 'TV', 'Kitchen', 'Hot Water',
  'Washing Machine', 'Parking', 'Balcony', 'Sea View', 'Gym',
];

const DAILY_FILTERS = [
  { key: 'nearAirport', label: 'Near Airport' },
  { key: 'transitRoom', label: 'Transit Room' },
  { key: 'bikiniFriendly', label: 'Bikini-Friendly Beach' },
];

const MONTHLY_FILTERS = [
  { key: 'liftAvailable', label: 'Lift Available' },
  { key: 'hasAC', label: 'Air Conditioned' },
  { key: 'securitySystem', label: 'Security System' },
  { key: 'furnished', label: 'Furnished' },
  { key: 'parking', label: 'Parking' },
  { key: 'petsAllowed', label: 'Pets Allowed' },
];

function FormSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
      <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loadingData, setLoadingData] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  const {
    register, handleSubmit, watch, reset, setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'daily', currency: 'MVR', status: 'published',
      isPremium: false, isVerified: false, isUrgent: false,
      rooms: '', bathrooms: '', bathroomType: 'attached', beds: '', bedType: '',
    },
  });

  const watchType = watch('type');
  const watchPremium = watch('isPremium');
  const watchBathroomType = watch('bathroomType');

  useEffect(() => {
    if (!isEdit) return;
    const fetchListing = async () => {
      try {
        const { data: listing } = await api.get(`/listings/admin/${id}`);
        if (!listing) { toast.error('Listing not found'); navigate('/admin/listings'); return; }

        reset({
          title: listing.title,
          description: listing.description,
          type: listing.type,
          price: listing.price,
          currency: listing.currency,
          location: listing.location,
          address: listing.address || '',
          status: listing.status,
          contactName:     listing.contact?.name,
          contactViber:    listing.contact?.viber    || '',
          contactWhatsapp: listing.contact?.whatsapp || '',
          contactPhone:    listing.contact?.phone    || '',
          isPremium: listing.isPremium,
          premiumDays: 30,
          isVerified: listing.isVerified,
          isUrgent: listing.isUrgent,
          depositMonths: listing.filters?.depositMonths || 1,
          rooms: listing.rooms || '',
          bathrooms: listing.bathrooms || '',
          bathroomType: listing.bathroomType || 'attached',
          beds: listing.beds || '',
          bedType: listing.bedType || '',
        });
        setExistingImages(listing.images || []);
        setSelectedAmenities(listing.amenities || []);
        const f = {};
        [...DAILY_FILTERS, ...MONTHLY_FILTERS].forEach(({ key }) => {
          if (listing.filters?.[key]) f[key] = true;
        });
        setActiveFilters(f);
      } catch {
        toast.error('Failed to load listing');
      } finally {
        setLoadingData(false);
      }
    };
    fetchListing();
  }, [id, isEdit, reset, navigate]);

  const toggleAmenity = (a) =>
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const toggleFilter = (key) =>
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + existingImages.length + newImages.length > 10) {
      toast.error('Maximum 10 images allowed'); return;
    }
    const combined = [...newImages, ...files];
    setNewImages(combined);
    setNewImagePreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (idx) =>
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));

  const removeNewImage = (idx) => {
    const updated = newImages.filter((_, i) => i !== idx);
    setNewImages(updated);
    setNewImagePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const filters = { depositMonths: Number(formData.depositMonths) || 1 };
      [...DAILY_FILTERS, ...MONTHLY_FILTERS].forEach(({ key }) => {
        filters[key] = Boolean(activeFilters[key]);
      });

      const data = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: Number(formData.price),
        currency: formData.currency,
        location: formData.location,
        address: formData.address || undefined,
        status: formData.status,
        contact: {
          name:     formData.contactName,
          viber:    formData.contactViber    || undefined,
          whatsapp: formData.contactWhatsapp || undefined,
          phone:    formData.contactPhone    || undefined,
        },
        rooms: formData.rooms ? Number(formData.rooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        bathroomType: formData.bathroomType || undefined,
        beds: formData.beds ? Number(formData.beds) : undefined,
        bedType: formData.bedType || undefined,
        amenities: selectedAmenities,
        filters,
        isPremium: formData.isPremium,
        isVerified: formData.isVerified,
        isUrgent: formData.isUrgent,
        existingImages,
      };

      if (formData.isPremium) data.premiumDays = Number(formData.premiumDays) || 30;

      const fd = new FormData();
      fd.append('data', JSON.stringify(data));
      newImages.forEach((img) => fd.append('images', img));

      if (isEdit) {
        await api.put(`/listings/admin/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Listing updated!');
      } else {
        await api.post('/listings/admin', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Listing created!');
      }
      navigate('/admin/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <AdminLayout title="Loading...">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? 'Edit Listing' : 'Add New Listing'}
      subtitle={isEdit ? `Editing listing #${id}` : 'Fill in the details to create a new listing'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/admin/listings')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-ocean-700 mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>

        {/* Basic Info */}
        <FormSection title="Basic Information">
          <div>
            <label className="label">Title *</label>
            <input
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Spacious AC Room Near Airport — Hulhumalé"
              {...register('title', { required: 'Title is required', minLength: { value: 10, message: 'At least 10 characters' } })}
            />
            {errors.title && <p className="error-msg">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              rows={4}
              className={`textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the room in detail — size, floor, nearby landmarks, house rules..."
              {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters' } })}
            />
            {errors.description && <p className="error-msg">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Room Type *</label>
              <div className="flex gap-2">
                {['daily', 'monthly'].map((t) => (
                  <label key={t} className="flex-1">
                    <input type="radio" value={t} className="sr-only" {...register('type')} />
                    <div className={`text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                      watchType === t ? 'border-ocean-500 bg-ocean-50 text-ocean-700' : 'border-gray-200 text-gray-500 hover:border-ocean-200'
                    }`}>
                      {t === 'daily' ? <><Moon className="w-3.5 h-3.5 inline mr-1" />Daily</> : <><CalendarDays className="w-3.5 h-3.5 inline mr-1" />Monthly</>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select className="select" {...register('status')}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </FormSection>

        {/* Pricing & Location */}
        <FormSection title="Pricing & Location">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Price *</label>
              <input
                type="number" min="0"
                className={`input ${errors.price ? 'input-error' : ''}`}
                placeholder="0"
                {...register('price', { required: 'Price is required', min: { value: 1, message: 'Must be > 0' } })}
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
            <div>
              <label className="label">Location *</label>
              <select className={`select ${errors.location ? 'input-error' : ''}`} {...register('location', { required: 'Location required' })}>
                <option value="">Select...</option>
                {LOCATIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              {errors.location && <p className="error-msg">{errors.location.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Address (optional)</label>
            <input className="input" placeholder="Street, building, floor..." {...register('address')} />
          </div>
        </FormSection>

        {/* Contact Info */}
        <FormSection title="Contact Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Host Name *</label>
              <input
                className={`input ${errors.contactName ? 'input-error' : ''}`}
                placeholder="Mohamed Ali"
                {...register('contactName', { required: 'Name required' })}
              />
              {errors.contactName && <p className="error-msg">{errors.contactName.message}</p>}
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-[#7360F2]" />
                Viber Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input className="input" placeholder="+960 777 1234" {...register('contactViber')} />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-500" />
                WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input className="input" placeholder="+960 777 1234" {...register('contactWhatsapp')} />
            </div>
            <div>
              <label className="label">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input className="input" placeholder="+960 777 1234" {...register('contactPhone')} />
            </div>
          </div>
        </FormSection>

        {/* Room Details */}
        <FormSection title="Room Details">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Number of Rooms</label>
              <input
                type="number" min="1" max="20"
                className="input"
                placeholder="e.g. 2"
                {...register('rooms')}
              />
            </div>
            <div>
              <label className="label">Number of Bathrooms</label>
              <input
                type="number" min="1" max="20"
                className="input"
                placeholder="e.g. 1"
                {...register('bathrooms')}
              />
            </div>
            <div>
              <label className="label">Number of Beds</label>
              <input
                type="number" min="1" max="20"
                className="input"
                placeholder="e.g. 1"
                {...register('beds')}
              />
            </div>
            <div>
              <label className="label">Bed Type</label>
              <select className="select" {...register('bedType')}>
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="queen">Queen</option>
                <option value="king">King</option>
                <option value="bunk">Bunk</option>
                <option value="sofa-bed">Sofa Bed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Bathroom Type</label>
              <div className="flex gap-2">
                {[{ value: 'attached', label: 'Attached' }, { value: 'shared', label: 'Shared' }].map(({ value, label }) => (
                  <label key={value} className="flex-1">
                    <input type="radio" value={value} className="sr-only" {...register('bathroomType')} />
                    <div className={`text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                      watchBathroomType === value
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                        : 'border-gray-200 text-gray-500 hover:border-ocean-200'
                    }`}>
                      {label}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FormSection>

        {/* Amenities */}
        <FormSection title="Amenities">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <button
                key={a} type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                  selectedAmenities.includes(a)
                    ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                    : 'border-gray-200 text-gray-500 hover:border-ocean-200'
                }`}
              >
                {selectedAmenities.includes(a) ? '✓ ' : ''}{a}
              </button>
            ))}
          </div>
        </FormSection>

        {/* Filters */}
        <FormSection title={`${watchType === 'daily' ? 'Daily Room' : 'Monthly Rental'} Features`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(watchType === 'daily' ? DAILY_FILTERS : MONTHLY_FILTERS).map(({ key, label }) => (
              <button
                key={key} type="button"
                onClick={() => toggleFilter(key)}
                className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                  activeFilters[key]
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-500 hover:border-teal-200'
                }`}
              >
                {activeFilters[key] ? '✓ ' : ''}{label}
              </button>
            ))}
          </div>
          {watchType === 'monthly' && (
            <div className="w-36 mt-2">
              <label className="label text-xs">Deposit (months)</label>
              <input type="number" min="0" max="12" className="input" {...register('depositMonths')} />
            </div>
          )}
        </FormSection>

        {/* Photos */}
        <FormSection title="Photos (up to 10 total)">
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Current Photos</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {existingImages.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {newImagePreviews.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">New Photos</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {newImagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length + newImages.length < 10 && (
            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-ocean-200 rounded-xl cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/50 transition-all">
              <Camera className="w-6 h-6 text-ocean-400" />
              <span className="text-sm font-medium text-gray-600">Upload Photos</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB each</span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageChange} />
            </label>
          )}
        </FormSection>

        {/* Premium Settings */}
        <FormSection title="Listing Badges & Promotion">
          <div className="space-y-3">
            {/* Premium */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Featured / Premium</p>
                  <p className="text-xs text-gray-500">Pinned at the top of all listings</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" {...register('isPremium')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>
            {watchPremium && (
              <div className="w-36 ml-12">
                <label className="label text-xs">Duration (days)</label>
                <input type="number" min="1" max="365" defaultValue={30} className="input text-sm" {...register('premiumDays')} />
              </div>
            )}

            {/* Verified */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-green-200 bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Verified Badge</p>
                  <p className="text-xs text-gray-500">Confirms legitimacy of the listing</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" {...register('isVerified')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
              </label>
            </div>

            {/* Urgent */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Hot Deal (24h Boost)</p>
                  <p className="text-xs text-gray-500">Appears in Hot Deals section for 24 hours</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" {...register('isUrgent')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
              </label>
            </div>
          </div>
        </FormSection>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/admin/listings')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary gap-2 flex-1 justify-center"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> {isEdit ? 'Update Listing' : 'Create Listing'}</>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
