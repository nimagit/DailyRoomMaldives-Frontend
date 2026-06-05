import { Link } from 'react-router-dom';
import { Waves, MapPin, Heart } from 'lucide-react';
import FadeUp from './FadeUp';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ocean-900 text-ocean-100">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <FadeUp delay={0} y={20}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-ocean-gradient rounded-xl flex items-center justify-center">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="block font-bold text-white text-lg">Daily Room</span>
                <span className="block text-xs text-ocean-400 font-medium uppercase tracking-wide">Maldives</span>
              </div>
            </div>
            <p className="text-sm text-ocean-300 leading-relaxed max-w-xs">
              The simplest way to find daily transit rooms and monthly rentals across the Maldives islands.
            </p>
          </FadeUp>

          {/* Quick Links */}
          <FadeUp delay={0.08} y={20}>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Browse All Rooms' },
                { to: '/?type=daily', label: 'Daily Rooms' },
                { to: '/?type=monthly', label: 'Monthly Rentals' },
                { to: '/list-property', label: 'List Your Property' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-ocean-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </FadeUp>

          {/* Locations */}
          <FadeUp delay={0.16} y={20}>
            <h3 className="font-semibold text-white mb-4">Locations</h3>
            <ul className="space-y-2.5 text-sm">
              {['Malé', 'Hulhumalé Phase 1', 'Hulhumalé Phase 2', 'Maafushi', 'Addu City'].map((loc) => (
                <li key={loc} className="flex items-center gap-2 text-ocean-300">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                  {loc}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>

        <FadeUp delay={0.2} y={12}>
          <div className="mt-10 pt-6 border-t border-ocean-800 flex items-center justify-center text-xs text-ocean-400">
            <p>© {year} Daily Room Maldives. All rights reserved.</p>
          </div>
        </FadeUp>
      </div>
    </footer>
  );
}
