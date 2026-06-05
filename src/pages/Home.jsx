import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, ChevronDown, AlertCircle, Loader2, Home as HomeIcon } from 'lucide-react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import SearchFilter from '../components/SearchFilter';
import ListingCard from '../components/ListingCard';
import WaveDivider from '../components/WaveDivider';
import FadeUp from '../components/FadeUp';

const INITIAL_FILTERS = { type: '', location: '', minPrice: '', maxPrice: '', currency: '' };

/* ── helpers ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-12 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
        <div className="skeleton h-5 w-1/3 mt-2" />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, iconClass }) {
  return (
    <FadeUp y={20} duration={0.5} className="flex items-start gap-3 mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle text-sm">{subtitle}</p>}
      </div>
    </FadeUp>
  );
}

/* Animated ocean bubble decoration */
function OceanBubbles() {
  const bubbles = [
    { size: 8,  left: '8%',  delay: 0,   duration: 4 },
    { size: 12, left: '22%', delay: 1.2, duration: 5 },
    { size: 6,  left: '45%', delay: 0.5, duration: 3.5 },
    { size: 10, left: '65%', delay: 2,   duration: 4.5 },
    { size: 7,  left: '80%', delay: 0.8, duration: 3.8 },
    { size: 14, left: '92%', delay: 1.7, duration: 5.2 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            bottom: 8,
            background: 'radial-gradient(circle at 30% 30%, rgba(125,211,252,0.7), rgba(14,165,233,0.2))',
          }}
          animate={{ y: [0, -(80 + b.size * 4)], opacity: [0, 0.8, 0] }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}


/* ── Page component ──────────────────────────────────────────── */
export default function Home() {
  const [data, setData] = useState({
    premiumListings: [], urgentListings: [], regularListings: [],
    total: 0, pages: 0, currentPage: 1,
  });
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async (pageNum, currentFilters, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const params = new URLSearchParams({ page: pageNum, limit: 12 });
      if (currentFilters.type)     params.set('type', currentFilters.type);
      if (currentFilters.location) params.set('location', currentFilters.location);
      if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice);
      if (currentFilters.currency) params.set('currency', currentFilters.currency);

      const { data: res } = await api.get(`/listings?${params}`);
      setData((prev) => ({
        premiumListings: res.premiumListings || [],
        urgentListings:  res.urgentListings  || [],
        regularListings: append
          ? [...prev.regularListings, ...(res.regularListings || [])]
          : (res.regularListings || []),
        total:       res.total       || 0,
        pages:       res.pages       || 0,
        currentPage: res.currentPage || 1,
      }));
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchListings(1, filters, false);
  }, [filters, fetchListings]);

  const handleFilterChange = (newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }));

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchListings(next, filters, true);
  };

  const hasMore = data.currentPage < data.pages;
  const totalShown =
    (data.premiumListings?.length || 0) +
    (data.urgentListings?.length  || 0) +
    (data.regularListings?.length || 0);

  const hasPremium = data.premiumListings?.length > 0;
  const hasUrgent  = data.urgentListings?.length  > 0;

  return (
    <div className="min-h-screen flex flex-col bg-ocean-50">
      <Navbar />
      <HeroSection />

      {/* ── Search & filter ──────────────────────────────────── */}
      <main id="listings" className="flex-1">
        <div className="page-container py-8 sm:py-10">
            <FadeUp y={16} duration={0.5} once>
            <SearchFilter
              filters={filters}
              onChange={handleFilterChange}
              onReset={() => setFilters(INITIAL_FILTERS)}
              totalResults={loading ? null : data.total}
            />
          </FadeUp>
        </div>

        {/* Error */}
        {error && (
          <div className="page-container mb-6">
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
              <button onClick={() => fetchListings(page, filters)} className="ml-auto text-sm font-medium hover:underline">Retry</button>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="page-container pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* ── Featured / Premium ──────────────────────────── */}
            {hasPremium && (
              <>
                <section className="page-container pb-10">
                  <SectionHeader
                    icon={Star}
                    title="Featured Rooms"
                    subtitle="Premium listings — top-quality verified rooms"
                    iconClass="bg-amber-100 text-amber-600"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {data.premiumListings.map((listing, i) => (
                      <ListingCard key={listing._id} listing={listing} index={i} />
                    ))}
                  </div>
                </section>

                {/* Wave between Featured and Hot Deals / All Rooms */}
                <div className="relative">
                  <OceanBubbles />
                  <WaveDivider
                    topColor="#f0f9ff"
                    waveColors={['#bae6fd', '#7dd3fc', '#e0f2fe']}
                    bottomColor={hasUrgent ? '#fff7ed' : '#f0f9ff'}
                    height={88}
                  />
                </div>
              </>
            )}

            {/* ── Hot Deals ──────────────────────────────────── */}
            {hasUrgent && (
              <>
                <section className={`pb-10 ${hasUrgent ? 'bg-orange-50/40' : ''}`}>
                  <div className="page-container">
                    <SectionHeader
                      icon={Zap}
                      title="Hot Deals Today"
                      subtitle="Available now — contact before they're gone!"
                      iconClass="bg-red-100 text-red-500"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {data.urgentListings.map((listing, i) => (
                        <ListingCard key={listing._id} listing={listing} index={i} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Wave between Hot Deals and All Rooms */}
                <div className="relative">
                  <OceanBubbles />
                  <WaveDivider
                    topColor="#fff7ed"
                    waveColors={['#7dd3fc', '#38bdf8', '#0ea5e9']}
                    bottomColor="#f0f9ff"
                    height={88}
                  />
                </div>
              </>
            )}

            {/* ── All Listings ────────────────────────────────── */}
            <section className="page-container pb-16">
              <FadeUp y={20} duration={0.5}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="section-title">
                      {filters.type === 'daily'   ? 'Daily Rooms'
                       : filters.type === 'monthly' ? 'Monthly Rentals'
                       : 'All Available Rooms'}
                    </h2>
                    <p className="section-subtitle text-sm">Sorted by newest first</p>
                  </div>
                </div>
              </FadeUp>

              {data.regularListings?.length === 0 && totalShown === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <HomeIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Rooms Found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or check back later.</p>
                  <button onClick={() => setFilters(INITIAL_FILTERS)} className="btn-primary">
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {(data.regularListings || []).map((listing, i) => (
                      <ListingCard key={listing._id} listing={listing} index={i} />
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className="text-center mt-10">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="btn-secondary gap-2 min-w-[180px]"
                      >
                        {loadingMore ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                        ) : (
                          <><ChevronDown className="w-4 h-4" /> Load More Rooms</>
                        )}
                      </button>
                      <p className="text-xs text-gray-400 mt-2">
                        Showing {data.regularListings.length} of {data.total} rooms
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── Wave above footer ──────────────────────────── */}
            <div className="relative">
              <OceanBubbles />
              <WaveDivider
                topColor="#f0f9ff"
                waveColors={['#0ea5e9', '#0369a1', '#0c4a6e']}
                bottomColor="#0c4a6e"
                height={100}
              />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
