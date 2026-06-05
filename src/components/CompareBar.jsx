import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Trash2, Home } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export default function CompareBar() {
  const { items, remove, clear, setShowModal } = useCompare();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        >
          <div className="page-container pb-4 pointer-events-auto">
            <div className="bg-ocean-950 rounded-2xl shadow-2xl border border-ocean-800 px-4 py-3 flex items-center gap-3">
              {/* Icon + label */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 bg-ocean-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-semibold hidden sm:block">Compare</span>
              </div>

              {/* Selected listing thumbnails */}
              <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                {items.map((listing) => (
                  <motion.div
                    key={listing._id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative flex-shrink-0 group"
                  >
                    <div className="flex items-center gap-2 bg-ocean-800 rounded-xl pl-1 pr-3 py-1">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-ocean-700 flex-shrink-0">
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Home className="w-4 h-4 text-ocean-400" /></div>
                        )}
                      </div>
                      <span className="text-white text-xs font-medium max-w-[100px] truncate">
                        {listing.title}
                      </span>
                      <button
                        onClick={() => remove(listing._id)}
                        className="w-4 h-4 rounded-full bg-ocean-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors ml-1 flex-shrink-0"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: 3 - items.length }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl border-2 border-dashed border-ocean-700 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-ocean-600 text-xs font-bold">+</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={clear}
                  className="w-8 h-8 rounded-xl bg-ocean-800 hover:bg-red-900/50 flex items-center justify-center text-ocean-400 hover:text-red-400 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  disabled={items.length < 2}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-ocean-700 disabled:text-ocean-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="w-4 h-4" />
                  Compare {items.length < 2 ? `(need ${2 - items.length} more)` : `(${items.length})`}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
