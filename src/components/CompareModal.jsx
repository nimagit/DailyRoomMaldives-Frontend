import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CheckCircle, XCircle, MessageCircle, Phone, Star, ShieldCheck, Home, Moon, CalendarDays } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { LOCATION_MAP } from '../utils/locations';
import ViberButton from './ViberButton';

const ALL_AMENITIES = ['WiFi', 'AC', 'TV', 'Kitchen', 'Hot Water', 'Washing Machine', 'Parking', 'Balcony', 'Sea View', 'Gym'];

const ALL_FEATURES = [
  { key: 'nearAirport',    label: 'Near Airport' },
  { key: 'transitRoom',    label: 'Transit Room' },
  { key: 'bikiniFriendly', label: 'Bikini-Friendly' },
  { key: 'liftAvailable',  label: 'Lift Available' },
  { key: 'hasAC',          label: 'Air Conditioned' },
  { key: 'securitySystem', label: 'Security System' },
  { key: 'furnished',      label: 'Furnished' },
  { key: 'petsAllowed',    label: 'Pets Allowed' },
];

function Tick({ yes }) {
  return yes
    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
    : <XCircle    className="w-4 h-4 text-gray-200  mx-auto" />;
}

function Row({ label, children }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap w-28 align-top">
        {label}
      </td>
      {children}
    </tr>
  );
}

export default function CompareModal() {
  const { items, remove, clear, showModal, setShowModal } = useCompare();

  return (
    <AnimatePresence>
      {showModal && items.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="font-extrabold text-gray-900 text-lg">Compare Rooms</h2>
                <p className="text-gray-400 text-xs mt-0.5">{items.length} room{items.length !== 1 ? 's' : ''} selected</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clear}
                  className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-auto flex-1 px-6 pb-6">
              <table className="w-full border-separate border-spacing-0">
                <colgroup>
                  <col className="w-28" />
                  {items.map((_, i) => <col key={i} />)}
                </colgroup>

                <tbody>
                  {/* Photos */}
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4" />
                    {items.map((listing) => (
                      <td key={listing._id} className="py-4 px-3 align-top">
                        <div className="relative">
                          <div className="w-full h-36 rounded-2xl overflow-hidden bg-ocean-100">
                            {listing.images?.[0] ? (
                              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Home className="w-10 h-10 text-ocean-300" /></div>
                            )}
                          </div>
                          {/* Remove button */}
                          <button
                            onClick={() => remove(listing._id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* Badges */}
                          <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                            {listing.isPremium && <span className="badge badge-premium text-[10px]"><Star className="w-2.5 h-2.5 fill-current" />Featured</span>}
                            {listing.isVerified && <span className="badge badge-verified text-[10px]"><ShieldCheck className="w-2.5 h-2.5" />Verified</span>}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Title */}
                  <Row label="Room">
                    {items.map((l) => (
                      <td key={l._id} className="py-3 px-3 align-top">
                        <a
                          href={`/listing/${l._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm text-gray-900 hover:text-ocean-700 transition-colors line-clamp-2 leading-snug"
                        >
                          {l.title}
                        </a>
                      </td>
                    ))}
                  </Row>

                  {/* Price */}
                  <Row label="Price">
                    {items.map((l) => (
                      <td key={l._id} className="py-3 px-3 align-middle">
                        <span className="text-xl font-extrabold text-ocean-700">{l.currency} {l.price?.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs ml-1">/{l.type === 'daily' ? 'night' : 'mo'}</span>
                      </td>
                    ))}
                  </Row>

                  {/* Location */}
                  <Row label="Location">
                    {items.map((l) => (
                      <td key={l._id} className="py-3 px-3 align-middle">
                        <span className="flex items-center gap-1 text-sm text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-ocean-400 flex-shrink-0" />
                          {LOCATION_MAP[l.location] || l.location}
                        </span>
                      </td>
                    ))}
                  </Row>

                  {/* Type */}
                  <Row label="Type">
                    {items.map((l) => (
                      <td key={l._id} className="py-3 px-3 align-middle">
                        <span className={`badge text-xs ${l.type === 'daily' ? 'badge-daily' : 'badge-monthly'}`}>
                          {l.type === 'daily' ? <><Moon className="w-3 h-3" /> Daily</> : <><CalendarDays className="w-3 h-3" /> Monthly</>}
                        </span>
                      </td>
                    ))}
                  </Row>

                  {/* Amenities */}
                  <Row label="Amenities">
                    {items.map((l) => (
                      <td key={l._id} className="py-3 px-3 align-top">
                        <div className="space-y-1.5">
                          {ALL_AMENITIES.map((a) => {
                            const has = l.amenities?.includes(a);
                            return (
                              <div key={a} className="flex items-center gap-2">
                                <Tick yes={has} />
                                <span className={`text-xs ${has ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>{a}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </Row>

                  {/* Features */}
                  <Row label="Features">
                    {items.map((l) => (
                      <td key={l._id} className="py-3 px-3 align-top">
                        <div className="space-y-1.5">
                          {ALL_FEATURES.map(({ key, label }) => {
                            const has = l.filters?.[key];
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <Tick yes={has} />
                                <span className={`text-xs ${has ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </Row>

                  {/* Contact */}
                  <Row label="Contact">
                    {items.map((l) => (
                      <td key={l._id} className="py-3 px-3 align-top">
                        <div className="flex flex-col gap-2">
                          {l.contact?.viber && <ViberButton number={l.contact.viber} size="sm" />}
                          {l.contact?.whatsapp && (
                            <a
                              href={`https://wa.me/${l.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, interested in: ${l.title}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          )}
                          {l.contact?.phone && (
                            <a
                              href={`tel:${l.contact.phone}`}
                              className="flex items-center gap-1.5 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </Row>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
