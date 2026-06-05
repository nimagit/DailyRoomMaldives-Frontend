import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, MessageCircle, Phone, Star, ShieldCheck, Zap, Eye, Bed, BarChart3, Check, Moon, CalendarDays, BedDouble, Bath, BedSingle } from 'lucide-react';
import ViberButton from './ViberButton';
import { LOCATION_MAP } from '../utils/locations';
import { useCompare } from '../context/CompareContext';

const AMENITY_ICONS = {};

function formatPrice(price, currency, type) {
  return `${currency} ${price.toLocaleString()}${type === 'daily' ? '/night' : '/mo'}`;
}

function PlaceholderImage() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-ocean-100 to-ocean-200 flex flex-col items-center justify-center gap-2">
      <Bed className="w-10 h-10 text-ocean-400" />
      <span className="text-ocean-400 text-xs font-medium">No Photo</span>
    </div>
  );
}

export default function ListingCard({ listing, index = 0, variant = 'default' }) {
  const {
    _id, title, type, price, currency, location,
    images, amenities = [], contact,
    isPremium, isVerified, isUrgent, views,
    rooms, bathrooms, bathroomType, beds, bedType,
  } = listing;

  const waMessage = encodeURIComponent(`Hi, I'm interested in your room: ${title}`);
  const waLink    = contact?.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${waMessage}` : null;

  const isPremiumActive = isPremium && listing.premiumExpiry && new Date(listing.premiumExpiry) > new Date();
  const isUrgentActive = isUrgent && listing.urgentExpiry && new Date(listing.urgentExpiry) > new Date();
  const { toggle, isSelected } = useCompare();
  const selected = isSelected(_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '0px 0px -48px 0px' }}
      transition={{
        delay: Math.min(index * 0.05, 0.25),
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`card group relative flex flex-col ${isPremiumActive ? 'ring-2 ring-amber-400/60 ring-offset-1' : ''}`}
    >
      {/* Premium ribbon */}
      {isPremiumActive && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-premium-gradient text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
          <Star className="w-3 h-3 fill-current" />
          FEATURED
        </div>
      )}

      {/* Image */}
      <Link to={`/listing/${_id}`} target="_blank" rel="noopener noreferrer" className="block relative h-52 overflow-hidden bg-ocean-100 flex-shrink-0">
        {images?.[0] ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-card-gradient" />

        {/* Bottom badges on image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className={`badge text-[11px] ${type === 'daily' ? 'badge-daily' : 'badge-monthly'} shadow-sm`}>
            {type === 'daily' ? <><Moon className="w-3 h-3" /> Daily</> : <><CalendarDays className="w-3 h-3" /> Monthly</>}
          </span>
          {isVerified && (
            <span className="badge badge-verified shadow-sm text-[11px]">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          {isUrgentActive && (
            <span className="badge badge-urgent shadow-sm text-[11px]">
              <Zap className="w-3 h-3 fill-current" />
              Hot Deal
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title + Location */}
        <div>
          <Link
            to={`/listing/${_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 hover:text-ocean-700 transition-colors"
          >
            {title}
          </Link>
          <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-ocean-400 flex-shrink-0" />
            <span>{LOCATION_MAP[location] || location}</span>
            {typeof views === 'number' && (
              <span className="ml-auto flex items-center gap-1 text-gray-400">
                <Eye className="w-3 h-3" />
                {views}
              </span>
            )}
          </div>
        </div>

        {/* Room stats */}
        {(rooms || beds || bathrooms) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            {rooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-ocean-400" />
                {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
              </span>
            )}
            {beds && (
              <span className="flex items-center gap-1">
                <BedSingle className="w-3.5 h-3.5 text-ocean-400" />
                {beds} {beds === 1 ? 'Bed' : 'Beds'}
                {bedType && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-ocean-50 text-ocean-600 capitalize">
                    {bedType.replace('-', ' ')}
                  </span>
                )}
              </span>
            )}
            {bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-ocean-400" />
                {bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}
                {bathroomType && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${bathroomType === 'attached' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {bathroomType === 'attached' ? 'Attached' : 'Shared'}
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                {AMENITY_ICONS[a] ? `${AMENITY_ICONS[a]} ${a}` : a}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="text-[11px] text-ocean-500 font-medium px-1">+{amenities.length - 4} more</span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="pt-2 border-t border-gray-100 mt-auto space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-ocean-700 whitespace-nowrap">
              {currency} {price.toLocaleString()}
            </span>
            <span className="text-gray-400 text-xs whitespace-nowrap">
              {type === 'daily' ? '/night' : '/month'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 flex-1 justify-center bg-ocean-50 hover:bg-ocean-100 text-ocean-600 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                title="Call"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            )}
            {contact?.viber && (
              <ViberButton number={contact.viber} size="sm" stopProp className="justify-center py-1.5" />
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 flex-[2] justify-center bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors shadow-sm"
                title="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Compare toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(listing); }}
          className={`flex items-center justify-center gap-1.5 w-full py-2 mt-2 rounded-xl text-xs font-semibold border-2 transition-all duration-200 active:scale-95 ${
            selected
              ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
              : 'border-gray-200 text-gray-500 hover:border-ocean-300 hover:text-ocean-600 hover:bg-ocean-50'
          }`}
        >
          {selected ? (
            <><Check className="w-3.5 h-3.5" /> Added to Compare</>
          ) : (
            <><BarChart3 className="w-3.5 h-3.5" /> Compare</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
