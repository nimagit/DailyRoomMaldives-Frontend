import { useState, useRef, useEffect } from 'react';
import { MapPin, SlidersHorizontal, X, ChevronDown, Check, Moon, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOCATIONS } from '../utils/locations';

const ALL_LOCATIONS = [{ value: '', label: 'All Locations' }, ...LOCATIONS];

const TYPES = [
  { value: '', label: 'All', Icon: null },
  { value: 'daily', label: 'Daily', Icon: Moon },
  { value: 'monthly', label: 'Monthly', Icon: CalendarDays },
];

const CURRENCIES = [
  { value: '', label: 'Any' },
  { value: 'MVR', label: 'MVR' },
  { value: 'USD', label: 'USD' },
];

/* ── Custom location dropdown ─────────────────────────────────── */
function LocationDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = ALL_LOCATIONS.find((l) => l.value === value) || ALL_LOCATIONS[0];

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 bg-white text-left
          ${open ? 'border-ocean-400 ring-2 ring-ocean-100' : 'border-gray-200 hover:border-ocean-300'}`}
      >
        <MapPin className="w-4 h-4 text-ocean-400 flex-shrink-0" />
        <span className="flex-1 truncate text-gray-700">{selected.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1.5"
            style={{ minWidth: '200px' }}
          >
            {ALL_LOCATIONS.map((loc) => (
              <li key={loc.value}>
                <button
                  type="button"
                  onClick={() => { onChange({ location: loc.value }); setOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors duration-150
                    ${value === loc.value
                      ? 'bg-ocean-50 text-ocean-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                >
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${value === loc.value ? 'text-ocean-500' : 'text-gray-300'}`} />
                  <span className="flex-1">{loc.label}</span>
                  {value === loc.value && <Check className="w-3.5 h-3.5 text-ocean-500 flex-shrink-0" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main SearchFilter component ──────────────────────────────── */
export default function SearchFilter({ filters, onChange, onReset, totalResults }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.type || filters.location || filters.minPrice || filters.maxPrice || filters.currency;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-ocean-100 p-4 sm:p-5">
      {/* Main row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Location — custom dropdown */}
        <LocationDropdown value={filters.location || ''} onChange={onChange} />

        {/* Type pills */}
        <div className="flex gap-2 items-center">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ type: t.value })}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                filters.type === t.value
                  ? 'bg-ocean-600 text-white shadow-md'
                  : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100'
              }`}
            >
              {t.Icon && <t.Icon className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
            showAdvanced ? 'bg-ocean-50 border-ocean-300 text-ocean-700' : 'border-gray-200 text-gray-600 hover:border-ocean-200 hover:text-ocean-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-coral-500 rounded-full" />}
        </button>
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-100 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="label text-xs">Min Price</label>
                <input
                  type="number" placeholder="0" min="0"
                  className="input text-sm"
                  value={filters.minPrice || ''}
                  onChange={(e) => onChange({ minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="label text-xs">Max Price</label>
                <input
                  type="number" placeholder="Any" min="0"
                  className="input text-sm"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onChange({ maxPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="label text-xs">Currency</label>
                <select
                  className="select text-sm"
                  value={filters.currency || ''}
                  onChange={(e) => onChange({ currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors w-full justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {typeof totalResults === 'number' && (
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          <span className="font-semibold text-ocean-700">{totalResults}</span>{' '}
          room{totalResults !== 1 ? 's' : ''} found
          {filters.location && (
            <> in <span className="font-medium">{ALL_LOCATIONS.find((l) => l.value === filters.location)?.label}</span></>
          )}
        </p>
      )}
    </div>
  );
}
