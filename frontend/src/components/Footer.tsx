import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'bessies-ashok-gold');

  return (
    <footer className="border-t border-gold/20 bg-secondary mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <img
              src="/assets/generated/logo.dim_300x80.png"
              alt="Bessie's Ashok Gold"
              className="h-10 w-auto object-contain mb-3"
            />
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Exquisite gold jewelry and collectibles, crafted with timeless elegance for the discerning connoisseur.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xs tracking-widest uppercase text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/contact', label: 'Contact' },
                { to: '/cart', label: 'Cart' },
                { to: '/admin', label: 'Admin Panel' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors font-body"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-xs tracking-widest uppercase text-gold mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Jewelry', 'Collectibles', 'Investments', 'Accessories'].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/shop"
                    className="text-sm text-muted-foreground hover:text-gold transition-colors font-body"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gold/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-body">
            © {year} Bessie's Ashok Gold. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
            Built with{' '}
            <Heart className="h-3 w-3 text-gold fill-gold" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
