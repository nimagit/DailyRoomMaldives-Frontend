import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, List, Star, Inbox, Eye,
  TrendingUp, PlusCircle, ArrowRight, Clock, Home,
} from 'lucide-react';
import api from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-600',
};

const SUB_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function StatCard({ icon: Icon, label, value, color, to }) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 ${to ? 'hover:shadow-card-hover transition-shadow' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 truncate">{label}</p>
      </div>
      {to && <ArrowRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />}
    </motion.div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back — here's what's happening today">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={List} label="Total Listings" value={stats?.totalListings} color="bg-ocean-100 text-ocean-600" to="/admin/listings" />
            <StatCard icon={TrendingUp} label="Published" value={stats?.publishedListings} color="bg-green-100 text-green-600" to="/admin/listings?status=published" />
            <StatCard icon={Star} label="Premium Active" value={stats?.premiumListings} color="bg-amber-100 text-amber-600" />
            <StatCard icon={Inbox} label="Pending Reviews" value={stats?.pendingSubmissions} color="bg-coral-500/10 text-coral-500" to="/admin/submissions?status=pending" />
            <StatCard icon={Eye} label="Total Views" value={stats?.totalViews?.toLocaleString()} color="bg-purple-100 text-purple-600" />
            <StatCard icon={LayoutDashboard} label="Daily Rooms Live" value={stats?.dailyListings} color="bg-teal-100 text-teal-600" />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/listings/new" className="btn-primary gap-2">
                <PlusCircle className="w-4 h-4" /> Add New Listing
              </Link>
              <Link to="/admin/submissions" className="btn-secondary gap-2">
                <Inbox className="w-4 h-4" /> Review Submissions
                {stats?.pendingSubmissions > 0 && (
                  <span className="w-5 h-5 bg-coral-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.pendingSubmissions > 9 ? '9+' : stats.pendingSubmissions}
                  </span>
                )}
              </Link>
              <Link to="/admin/listings" className="btn-secondary gap-2">
                <List className="w-4 h-4" /> Manage Listings
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Listings */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Recent Listings</h3>
                <Link to="/admin/listings" className="text-xs text-ocean-600 hover:underline font-medium">View all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {data?.recentListings?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No listings yet</p>
                ) : (
                  data?.recentListings?.map((l) => (
                    <Link key={l._id} to={`/admin/listings/${l._id}/edit`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-ocean-100 flex-shrink-0">
                        {l.images?.[0] ? (
                          <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Home className="w-5 h-5 text-ocean-400" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-ocean-700">{l.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status]}`}>
                            {l.status}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-ocean-700">{l.currency} {l.price?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">{l.type}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Recent Submissions</h3>
                <Link to="/admin/submissions" className="text-xs text-ocean-600 hover:underline font-medium">View all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {data?.recentSubmissions?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No submissions yet</p>
                ) : (
                  data?.recentSubmissions?.map((s) => (
                    <Link key={s._id} to="/admin/submissions" className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                      <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                        <Inbox className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-ocean-700">{s.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SUB_STATUS_COLORS[s.status]}`}>
                            {s.status}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex-shrink-0">{s.ownerName}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
