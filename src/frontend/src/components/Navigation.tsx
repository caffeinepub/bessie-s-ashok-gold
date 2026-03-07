import { useCart } from "@/hooks/useCart";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Settings, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { totalItems } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/contact", label: "Contact" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full shadow-sm"
      style={{
        backgroundColor: "oklch(0.99 0.002 60)",
        borderBottom: "2px solid oklch(0.85 0 0 / 0.25)",
      }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          data-ocid="nav.link"
        >
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
              data-ocid={`nav.${label.toLowerCase()}.link`}
              className={`font-display text-sm tracking-widest uppercase transition-colors duration-200 font-semibold ${
                isActive(to)
                  ? "text-black underline underline-offset-4 decoration-black/60"
                  : "text-black/80 hover:text-black"
              }`}
            >
              {label === "Admin" ? (
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
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold text-black tracking-widest uppercase hidden sm:inline">
            Ashok Gold
          </span>
          <Link
            to="/cart"
            data-ocid="nav.cart.link"
            className="relative p-2 text-black hover:text-black/70 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 text-black hover:text-black/70 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.mobile.toggle"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 py-4"
          style={{
            backgroundColor: "oklch(0.97 0.003 60)",
            borderTop: "1px solid oklch(0.85 0 0 / 0.2)",
          }}
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                data-ocid={`nav.mobile.${label.toLowerCase()}.link`}
                className={`font-display text-sm tracking-widest uppercase transition-colors font-semibold ${
                  isActive(to)
                    ? "text-black underline underline-offset-4"
                    : "text-black/80 hover:text-black"
                }`}
              >
                {label === "Admin" ? (
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
