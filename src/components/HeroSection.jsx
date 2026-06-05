import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin, Shield, Star, Search, ArrowRight,
  Waves, ChevronDown, Clock, ExternalLink, Home,
} from 'lucide-react';
import api from '../utils/api';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=85&w=1920&auto=format&fit=crop';

const stats = [
  { value: '500+', label: 'Active Rooms' },
  { value: '6+',   label: 'Islands' },
  { value: '24h',  label: 'Fast Listing' },
  { value: '100%', label: 'Direct Contact' },
];

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-7, 7, -7],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

function daysLeft(expiresAt) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / 86400000));
}

/* ── Wraps card in a link if linkUrl present ── */
function AdLink({ ad, className, children }) {
  if (!ad.linkUrl) return <div className={className}>{children}</div>;
  if (ad.linkUrl.startsWith('http')) {
    return (
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <Link to={ad.linkUrl} className={className}>{children}</Link>;
}

/* ── Desktop floating card (xl+) ── */
function DesktopAdCard({ ad }) {
  return (
    <motion.div
      variants={floatVariants}
      initial="initial"
      animate="animate"
      className="hidden xl:block absolute right-6 top-1/2 -translate-y-1/2 z-10"
    >
      <div className="flex items-center justify-end mb-2">
        <span className="text-[10px] text-white/50 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
          Sponsored
        </span>
      </div>

      <AdLink
        ad={ad}
        className="block group cursor-pointer"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-52 shadow-2xl group-hover:bg-white/18 group-hover:scale-[1.03] transition-all duration-300">
          <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-ocean-800">
            {ad.image ? (
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-ocean-300" /></div>
            )}
          </div>
          <p className="text-white font-semibold text-sm leading-tight mb-1">
            {ad.title} · {ad.location}
          </p>
          <p className="text-teal-300 font-bold text-sm">
            {ad.currency} {Number(ad.price).toLocaleString()}
            <span className="text-white/50 font-normal text-xs"> /night</span>
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/60 text-xs">Available now</span>
            </div>
            {ad.linkUrl && (
              <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
            )}
          </div>
        </div>
      </AdLink>

      {ad.expiresAt && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <Clock className="w-3 h-3 text-white/30" />
          <span className="text-[10px] text-white/30">{daysLeft(ad.expiresAt)}d left</span>
        </div>
      )}
    </motion.div>
  );
}

/* ── Mobile / tablet inline card (hidden on xl) ── */
function MobileAdCard({ ad }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="xl:hidden mt-6 max-w-sm mx-auto w-full"
    >
      <AdLink
        ad={ad}
        className="block group"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-xl group-hover:bg-white/15 transition-all duration-300 group-active:scale-[0.98]">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-ocean-800 flex-shrink-0">
              {ad.image ? (
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Home className="w-8 h-8 text-ocean-300" /></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-white/50 text-[10px] font-medium">Sponsored · Available now</span>
              </div>
              <p className="text-white font-semibold text-sm leading-tight truncate">
                {ad.title}
              </p>
              <p className="text-white/60 text-xs truncate">
                <MapPin className="w-3 h-3 inline mr-0.5 -mt-px" />
                {ad.location}
              </p>
              <p className="text-teal-300 font-bold text-sm mt-0.5">
                {ad.currency} {Number(ad.price).toLocaleString()}
                <span className="text-white/40 font-normal text-[11px]"> /night</span>
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </AdLink>
    </motion.div>
  );
}

/* ── Hero section ── */
export default function HeroSection() {
  const [heroAd, setHeroAd] = useState(null);

  useEffect(() => {
    api.get('/hero-ad/active')
      .then(({ data }) => setHeroAd(data))
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col pt-16">

      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Maldives overwater bungalows with turquoise sea"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/90 via-ocean-900/55 to-ocean-800/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/40 via-transparent to-ocean-950/40" />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { size: 'w-64 h-64', pos: 'top-10 right-16',  delay: 0   },
          { size: 'w-48 h-48', pos: 'bottom-24 left-10', delay: 1.5 },
          { size: 'w-32 h-32', pos: 'top-1/3 left-1/4', delay: 0.8 },
        ].map(({ size, pos, delay }, i) => (
          <motion.div
            key={i}
            className={`absolute ${size} ${pos} rounded-full bg-teal-400/10 blur-2xl`}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative flex-1 flex items-center page-container py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-3xl mx-auto text-center">

          {/* Location pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-lg"
          >
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-teal-300" />
            Malé · Hulhumalé · Maafushi · More
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 leading-[1.05] tracking-tight"
          >
            Find Your Perfect
            <span className="block mt-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-300">
                Room in Maldives
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/75 text-base sm:text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Daily transit rooms &amp; monthly rentals across every island.
            No account needed — browse, find &amp; contact directly.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          >
            <a
              href="#listings"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-teal-900/40 transition-all duration-200 active:scale-95 text-base w-full sm:w-auto justify-center"
            >
              <Search className="w-5 h-5" />
              Browse Rooms
            </a>
            <Link
              to="/list-property"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 active:scale-95 text-base w-full sm:w-auto justify-center"
            >
              List Your Room
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center flex-wrap gap-2.5 mb-8"
          >
            {[
              { icon: Shield, text: 'Verified Listings' },
              { icon: Star,   text: 'Premium Featured' },
              { icon: Waves,  text: 'All Maldives Islands' },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 shadow"
              >
                <Icon className="w-3.5 h-3.5 text-teal-300" />
                {text}
              </span>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-4 gap-2 sm:gap-3 max-w-lg mx-auto"
          >
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + i * 0.07 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-2 sm:px-3 py-3 text-center shadow-lg"
              >
                <div className="text-lg sm:text-2xl font-extrabold text-white leading-none">{value}</div>
                <div className="text-white/60 text-[9px] sm:text-xs font-medium mt-1 leading-tight">{label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Mobile hero ad (below stats, hidden on xl) ── */}
          {heroAd && <MobileAdCard ad={heroAd} />}
        </div>
      </div>

      {/* ── Desktop floating hero ad (xl only) ── */}
      {heroAd && <DesktopAdCard ad={heroAd} />}

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 xl:hidden"
      >
        <span className="text-white/50 text-[11px] font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-white/50" />
        </motion.div>
      </motion.div>

      {/* ── Animated 3-layer wave bottom ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: 100 }} aria-hidden="true">
        <div className="wave-layer absolute bottom-0 left-0"
          style={{ width: '200%', height: '100%', animationDuration: '16s', animationDelay: '-4s', opacity: 0.3 }}>
          <svg viewBox="0 0 2880 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 C1680,90 1920,10 2160,50 C2400,90 2640,10 2880,50 L2880,100 L0,100 Z" fill="#7dd3fc" />
          </svg>
        </div>
        <div className="wave-layer absolute bottom-0 left-0"
          style={{ width: '200%', height: '100%', animationDuration: '10s', animationDelay: '-2s', opacity: 0.5 }}>
          <svg viewBox="0 0 2880 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,55 C180,20 360,85 540,55 C720,20 900,85 1080,55 C1260,20 1440,85 1620,55 C1800,20 1980,85 2160,55 C2340,20 2520,85 2700,55 C2880,20 2880,100 2880,100 L0,100 Z" fill="#38bdf8" />
          </svg>
        </div>
        <div className="wave-layer absolute bottom-0 left-0"
          style={{ width: '200%', height: '100%', animationDuration: '7s', animationDelay: '0s', opacity: 1 }}>
          <svg viewBox="0 0 2880 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,62 C120,32 240,80 360,55 C480,30 600,82 720,58 C840,34 960,80 1080,56 C1200,32 1320,80 1440,58 C1560,36 1680,80 1800,58 C1920,36 2040,80 2160,58 C2280,36 2400,80 2520,58 C2640,36 2760,80 2880,58 L2880,100 L0,100 Z" fill="#f0f9ff" />
          </svg>
        </div>
      </div>
    </section>
  );
}
