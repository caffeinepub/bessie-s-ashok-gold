import { Link, useLocation } from '@tanstack/react-router';
import { ShoppingCart, Menu, X, Settings } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function Navigation() {
  const { totalItems } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/contact', label: 'Contact' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold/20 bg-background/95 backdrop-blur-md shadow-xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/assets/generated/logo.dim_300x80.png"
            alt="Bessie's Ashok Gold"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`font-display text-sm tracking-widest uppercase transition-colors duration-200 ${
                isActive(to)
                  ? 'text-gold'
                  : 'text-foreground/60 hover:text-gold'
              }`}
            >
              {label === 'Admin' ? (
                <span className="flex items-center gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  {label}
                </span>
              ) : (
                label
              )}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 text-foreground/60 hover:text-gold transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-foreground/60 hover:text-gold transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/20 bg-background px-4 py-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`font-display text-sm tracking-widest uppercase transition-colors ${
                  isActive(to) ? 'text-gold' : 'text-foreground/60 hover:text-gold'
                }`}
              >
                {label === 'Admin' ? (
                  <span className="flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ) : (
                  label
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
