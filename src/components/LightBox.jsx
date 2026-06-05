import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function LightBox({ images, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  goNext();
      if (e.key === 'ArrowLeft')   goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  const variants = {
    enter:  (d) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0, scale: 0.96 }),
    center:        { x: 0, opacity: 1, scale: 1 },
    exit:   (d) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0, scale: 0.96 }),
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <span className="text-white/60 text-sm font-semibold tabular-nums">
          {current + 1} <span className="text-white/30">/</span> {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden px-16 pb-2">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center px-16"
          >
            <img
              src={images[current]}
              alt={`Photo ${current + 1}`}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev arrow */}
        {images.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Click outside (on padding area) to close */}
        <div
          className="absolute inset-0 -z-10"
          onClick={onClose}
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex-shrink-0 py-3 px-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <motion.button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  i === current
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black/80 opacity-100'
                    : 'opacity-40 hover:opacity-70'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>,
    document.body
  );
}
