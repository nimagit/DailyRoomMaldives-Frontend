import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, MessageCircle, Star, ShieldCheck, Zap,
  ArrowLeft, Eye, Calendar, Home, Bed, CheckCircle,
  Plane, Sun, Building, Lock, ParkingCircle, PawPrint, Wind, Moon, CalendarDays,
  BedDouble, Bath, BedSingle,
} from 'lucide-react';

import api from '../utils/api';
import Navbar from '../components/Navbar';
import FadeUp from '../components/FadeUp';
import ViberButton from '../components/ViberButton';
import Footer from '../components/Footer';
import LightBox from '../components/LightBox';

import { LOCATION_MAP } from '../utils/locations';

const AMENITY_ICONS = {
  'AC': Wind, 'WiFi': null, 'TV': null, 'Kitchen': null,
  'Parking': ParkingCircle, 'Hot Water': null, 'Washing Machine': null,
  'Balcony': null, 'Sea View': null, 'Gym': null,
};

const FILTER_INFO = {
  nearAirport: { label: 'Near Airport', icon: Plane },
  transitRoom: { label: 'Transit Room', icon: Plane },
  bikiniFriendly: { label: 'Bikini-Friendly', icon: Sun },
  liftAvailable: { label: 'Lift Available', icon: Building },
  hasAC: { label: 'Air Conditioned', icon: Wind },
  securitySystem: { label: 'Security System', icon: Lock },
  furnished: { label: 'Furnished', icon: Home },
  parking: { label: 'Parking', icon: ParkingCircle },
  petsAllowed: { label: 'Pets Allowed', icon: PawPrint },
};

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="skeleton h-64 sm:h-96 rounded-2xl" />
      <div className="skeleton h-8 w-2/3" />
      <div className="skeleton h-4 w-1/3" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/listings/${id}`);
        setListing(data);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 page-container py-8 pt-24">
          <SkeletonDetail />
        </main>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center page-container py-8 pt-24">
          <div className="text-center">
            <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Listing Not Found</h2>
            <p className="text-gray-500 mb-6">This room may have been removed or is no longer available.</p>
            <Link to="/" className="btn-primary">Browse All Rooms</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const {
    title, description, type, price, currency, location, address,
    images = [], amenities = [], filters = {}, contact,
    isPremium, isVerified, isUrgent, views, premiumExpiry, urgentExpiry, createdAt,
    rooms, bathrooms, bathroomType, beds, bedType,
  } = listing;

  const isPremiumActive = isPremium && premiumExpiry && new Date(premiumExpiry) > new Date();
  const isUrgentActive = isUrgent && urgentExpiry && new Date(urgentExpiry) > new Date();

  const waMessage = encodeURIComponent(`Hi, I'm interested in your room: ${title}`);
  const waLink    = contact?.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${waMessage}` : null;

  const activeFilters = Object.entries(filters)
    .filter(([k, v]) => v === true && FILTER_INFO[k]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 page-container py-8 pt-24">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-ocean-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="shadow-card"
            >
              {images.length > 0 ? (
                <>
                  {/* 1 image */}
                  {images.length === 1 && (
                    <div
                      className="relative h-64 sm:h-[440px] rounded-2xl overflow-hidden cursor-pointer group"
                      onClick={() => setLightboxIndex(0)}
                    >
                      <img src={images[0]} alt={`${title} — photo 1`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                    </div>
                  )}

                  {/* 2 images */}
                  {images.length === 2 && (
                    <div className="grid grid-cols-2 gap-1 h-64 sm:h-[420px] rounded-2xl overflow-hidden">
                      {[0, 1].map(i => (
                        <div key={i} className="relative cursor-pointer group overflow-hidden" onClick={() => setLightboxIndex(i)}>
                          <img src={images[i]} alt={`${title} — photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3 images */}
                  {images.length === 3 && (
                    <div
                      className="grid gap-1 h-64 sm:h-[420px] rounded-2xl overflow-hidden"
                      style={{ gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }}
                    >
                      <div className="row-span-2 relative cursor-pointer group overflow-hidden" onClick={() => setLightboxIndex(0)}>
                        <img src={images[0]} alt={`${title} — photo 1`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                      </div>
                      {[1, 2].map(i => (
                        <div key={i} className="relative cursor-pointer group overflow-hidden" onClick={() => setLightboxIndex(i)}>
                          <img src={images[i]} alt={`${title} — photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4 images — 2×2 equal grid */}
                  {images.length === 4 && (
                    <div className="grid grid-cols-2 grid-rows-2 gap-1 h-72 sm:h-[440px] rounded-2xl overflow-hidden">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="relative cursor-pointer group overflow-hidden" onClick={() => setLightboxIndex(i)}>
                          <img src={images[i]} alt={`${title} — photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5+ images — Airbnb-style mosaic */}
                  {images.length >= 5 && (
                    <div
                      className="grid gap-1 h-72 sm:h-[440px] rounded-2xl overflow-hidden"
                      style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}
                    >
                      <div className="row-span-2 relative cursor-pointer group overflow-hidden" onClick={() => setLightboxIndex(0)}>
                        <img src={images[0]} alt={`${title} — photo 1`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                      </div>
                      {[1, 2, 3, 4].map(i => {
                        const showMore = i === 4 && images.length > 5;
                        return (
                          <div key={i} className="relative cursor-pointer group overflow-hidden" onClick={() => setLightboxIndex(i)}>
                            <img src={images[i]} alt={`${title} — photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                            {showMore && (
                              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-white font-bold text-2xl">+{images.length - 5}</span>
                                <span className="text-white/70 text-xs mt-1">more photos</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </>
              ) : (
                <div className="h-64 sm:h-96 bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center rounded-2xl">
                  <div className="text-center text-ocean-400">
                    <Bed className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No Photos Available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Title + Badges */}
            <FadeUp delay={0.05} once>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`badge text-sm ${type === 'daily' ? 'badge-daily' : 'badge-monthly'}`}>
                  {type === 'daily' ? <><Moon className="w-3.5 h-3.5" /> Daily Room</> : <><CalendarDays className="w-3.5 h-3.5" /> Monthly Rental</>}
                </span>
                {isVerified && (
                  <span className="badge badge-verified text-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified by Daily Room MV
                  </span>
                )}
                {isPremiumActive && (
                  <span className="badge badge-premium text-sm">
                    <Star className="w-3.5 h-3.5 fill-current" /> Featured Listing
                  </span>
                )}
                {isUrgentActive && (
                  <span className="badge badge-urgent text-sm">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Hot Deal Today
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-ocean-500" />
                  {LOCATION_MAP[location] || location}
                  {address && ` · ${address}`}
                </span>
                {views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {views} views
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Listed {new Date(createdAt).toLocaleDateString('en-MV', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {(rooms || bathrooms || beds) && (
                <div className="flex flex-wrap items-center gap-5 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700">
                  {rooms && (
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-ocean-500" />
                      <span className="font-medium">{rooms}</span> {rooms === 1 ? 'Room' : 'Rooms'}
                    </span>
                  )}
                  {beds && (
                    <span className="flex items-center gap-1.5">
                      <BedSingle className="w-4 h-4 text-ocean-500" />
                      <span className="font-medium">{beds}</span> {beds === 1 ? 'Bed' : 'Beds'}
                      {bedType && (
                        <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-ocean-50 text-ocean-700 capitalize">
                          {bedType.replace('-', ' ')}
                        </span>
                      )}
                    </span>
                  )}
                  {bathrooms && (
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-ocean-500" />
                      <span className="font-medium">{bathrooms}</span> {bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                      {bathroomType && (
                        <span className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full ${bathroomType === 'attached' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {bathroomType === 'attached' ? 'Attached' : 'Shared'}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </FadeUp>

            {/* Description */}
            <FadeUp delay={0.08} className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-3">About This Room</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
            </FadeUp>

            {/* Amenities */}
            {amenities.length > 0 && (
              <FadeUp delay={0.1} className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2.5 p-3 bg-ocean-50 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-ocean-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            )}

            {/* Filters / Features */}
            {activeFilters.length > 0 && (
              <FadeUp delay={0.12} className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Property Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeFilters.map(([key]) => {
                    const info = FILTER_INFO[key];
                    const Icon = info.icon;
                    return (
                      <div key={key} className="flex items-center gap-2.5 p-3 bg-teal-50 rounded-xl">
                        <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{info.label}</span>
                      </div>
                    );
                  })}
                  {filters.depositMonths > 0 && type === 'monthly' && (
                    <div className="flex items-center gap-2.5 p-3 bg-teal-50 rounded-xl">
                      <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{filters.depositMonths} Month Deposit</span>
                    </div>
                  )}
                </div>
              </FadeUp>
            )}
          </div>

          {/* Right: Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <FadeUp delay={0.1} once className="bg-white rounded-2xl shadow-card border border-ocean-100 p-6">
                <div className="text-center mb-5">
                  <div className="text-4xl font-extrabold text-ocean-700">
                    {currency} {price.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    per {type === 'daily' ? 'night' : 'month'}
                  </div>
                </div>

                <div className="space-y-3">
                  {contact?.viber && (
                    <ViberButton number={contact.viber} size="lg" />
                  )}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-coral w-full text-base py-3 gap-2.5 justify-center"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </a>
                  )}
                  {contact?.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="btn-secondary w-full text-base py-3 gap-2.5 justify-center"
                    >
                      <Phone className="w-5 h-5" />
                      Call {contact.name || 'Host'}
                    </a>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Contact the host directly — no account needed
                </p>
              </FadeUp>

              {/* Host Info */}
              <FadeUp delay={0.14} once className="bg-white rounded-2xl shadow-card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Host Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center text-ocean-600 font-bold text-lg flex-shrink-0">
                    {contact?.name?.[0]?.toUpperCase() || 'H'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{contact?.name || 'Host'}</p>
                    {contact?.phone && (
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    )}
                  </div>
                  {isVerified && (
                    <ShieldCheck className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
                  )}
                </div>
              </FadeUp>

              {/* Safety note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                <p className="font-semibold mb-1">Safety Tip</p>
                <p>Always verify the room in person before making any payment. Never pay in advance to strangers.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {lightboxIndex !== null && (
          <LightBox
            images={images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
