import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, X, CheckCircle, Loader2, Camera, Moon, CalendarDays } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { LOCATIONS } from '../utils/locations';

const AMENITY_OPTIONS = [
  'WiFi', 'AC', 'TV', 'Kitchen', 'Hot Water',
  'Washing Machine', 'Parking', 'Balcony', 'Sea View', 'Gym',
];

export default function ListProperty() {
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm({ defaultValues: { currency: 'MVR', type: 'daily', bathroomType: 'attached', bedType: '' } });

  const watchType = watch('type');
  const watchBathroomType = watch('bathroomType');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    const newImages = [...images, ...files];
    setImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const data = {
        ownerName:     formData.ownerName,
        ownerEmail:    formData.ownerEmail    || undefined,
        ownerPhone:    formData.ownerPhone,
        ownerViber:    formData.ownerViber    || undefined,
        ownerWhatsapp: formData.ownerWhatsapp || undefined,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: Number(formData.price),
        currency: formData.currency,
        location: formData.location,
        address: formData.address || undefined,
        rooms: formData.rooms ? Number(formData.rooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        bathroomType: formData.bathroomType || undefined,
        beds: formData.beds ? Number(formData.beds) : undefined,
        bedType: formData.bedType || undefined,
        amenities: selectedAmenities,
        additionalInfo: formData.additionalInfo || undefined,
      };

      const fd = new FormData();
      fd.append('data', JSON.stringify(data));
      images.forEach((img) => fd.append('images', img));

      const { data: res } = await api.post('/submissions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmissionId(res.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center page-container py-16 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-card p-8 sm:p-12 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Submission Received!</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Thank you! We've received your room listing request. Our team will review it and contact you within 24 hours.
            </p>
            {submissionId && (
              <p className="text-xs text-gray-400 mb-6 bg-gray-50 px-3 py-2 rounded-lg font-mono">
                Reference: {submissionId}
              </p>
            )}
            <a href="/" className="btn-primary w-full justify-center">
              Browse Other Rooms
            </a>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 page-container py-10 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ocean-900 mb-3">
              List Your Room
            </h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Fill in the details below and our team will review and publish your listing within 24 hours. No account needed!
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Section: Owner Info */}
            <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
                Your Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    className={`input ${errors.ownerName ? 'input-error' : ''}`}
                    placeholder="Mohamed Ali"
                    {...register('ownerName', { required: 'Name is required' })}
                  />
                  {errors.ownerName && <p className="error-msg">{errors.ownerName.message}</p>}
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    className={`input ${errors.ownerPhone ? 'input-error' : ''}`}
                    placeholder="+960 777 1234"
                    {...register('ownerPhone', { required: 'Phone number is required' })}
                  />
                  {errors.ownerPhone && <p className="error-msg">{errors.ownerPhone.message}</p>}
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#7360F2]" />
                    Viber Number <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <input
                    className="input"
                    placeholder="+960 777 1234"
                    {...register('ownerViber')}
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />
                    WhatsApp Number <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <input
                    className="input"
                    placeholder="+960 777 1234"
                    {...register('ownerWhatsapp')}
                  />
                </div>
                <div>
                  <label className="label">Email Address <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    {...register('ownerEmail')}
                  />
                </div>
              </div>
            </div>

            {/* Section: Room Details */}
            <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
                Room Details
              </h2>

              <div>
                <label className="label">Listing Title *</label>
                <input
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g. Cozy AC Room Near Airport, Hulhumalé"
                  {...register('title', { required: 'Title is required', minLength: { value: 10, message: 'Title must be at least 10 characters' } })}
                />
                {errors.title && <p className="error-msg">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Room Type *</label>
                  <div className="flex gap-2">
                    {['daily', 'monthly'].map((t) => (
                      <label key={t} className="flex-1">
                        <input type="radio" value={t} className="sr-only" {...register('type')} />
                        <div className={`text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                          watchType === t
                            ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                            : 'border-gray-200 text-gray-500 hover:border-ocean-200'
                        }`}>
                          {t === 'daily' ? <><Moon className="w-3.5 h-3.5 inline mr-1" />Daily</> : <><CalendarDays className="w-3.5 h-3.5 inline mr-1" />Monthly</>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Location *</label>
                  <select
                    className={`select ${errors.location ? 'input-error' : ''}`}
                    {...register('location', { required: 'Location is required' })}
                  >
                    <option value="">Select island...</option>
                    {LOCATIONS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  {errors.location && <p className="error-msg">{errors.location.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Address / Building (optional)</label>
                <input
                  className="input"
                  placeholder="Street, building name, floor..."
                  {...register('address')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price *</label>
                  <input
                    type="number"
                    min="0"
                    className={`input ${errors.price ? 'input-error' : ''}`}
                    placeholder={watchType === 'daily' ? 'Per night' : 'Per month'}
                    {...register('price', { required: 'Price is required', min: { value: 1, message: 'Price must be positive' } })}
                  />
                  {errors.price && <p className="error-msg">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="select" {...register('currency')}>
                    <option value="MVR">MVR (Maldivian Rufiyaa)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  rows={4}
                  className={`textarea ${errors.description ? 'input-error' : ''}`}
                  placeholder="Describe your room: size, floor, nearby landmarks, house rules, what's included..."
                  {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Please write at least 30 characters' } })}
                />
                {errors.description && <p className="error-msg">{errors.description.message}</p>}
              </div>
            </div>

            {/* Section: Room & Bathroom Details */}
            <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
                Room & Bathroom Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Number of Rooms</label>
                  <input type="number" min="1" max="20" className="input" placeholder="e.g. 2" {...register('rooms')} />
                </div>
                <div>
                  <label className="label">Number of Bathrooms</label>
                  <input type="number" min="1" max="20" className="input" placeholder="e.g. 1" {...register('bathrooms')} />
                </div>
                <div>
                  <label className="label">Number of Beds</label>
                  <input type="number" min="1" max="20" className="input" placeholder="e.g. 1" {...register('beds')} />
                </div>
                <div>
                  <label className="label">Bed Type</label>
                  <select className="select" {...register('bedType')}>
                    <option value="">Select type...</option>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="queen">Queen</option>
                    <option value="king">King</option>
                    <option value="bunk">Bunk</option>
                    <option value="sofa-bed">Sofa Bed</option>
                  </select>
                </div>
              </div>
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

            {/* Section: Amenities */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      selectedAmenities.includes(amenity)
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                        : 'border-gray-200 text-gray-500 hover:border-ocean-200 hover:text-gray-700'
                    }`}
                  >
                    {selectedAmenities.includes(amenity) ? '✓ ' : ''}{amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Photos */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-4">
                Photos <span className="text-gray-400 font-normal text-sm">(up to 10)</span>
              </h2>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 10 && (
                <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-ocean-200 rounded-xl cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/50 transition-all group">
                  <Camera className="w-8 h-8 text-ocean-400 group-hover:text-ocean-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-600">Click to upload photos</span>
                  <span className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB each</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {/* Additional info */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 mb-4">
                Additional Notes <span className="text-gray-400 font-normal text-sm">(optional)</span>
              </h2>
              <textarea
                rows={3}
                className="textarea"
                placeholder="Anything else you'd like to add — preferred tenants, payment terms, special conditions..."
                {...register('additionalInfo')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-coral w-full py-4 text-base justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="w-5 h-5" /> Submit Listing Request</>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Your listing will be reviewed and published within 24 hours. You can discuss payment terms with our team upon approval.
            </p>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
