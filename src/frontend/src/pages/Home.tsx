import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCIES, useCurrency } from "@/hooks/useCurrency";
import { useListProducts } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  ChevronDown,
  ChevronRight,
  Gem,
  Phone,
  Shield,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function ProductSkeleton() {
  return (
    <div className="bg-white border border-gold/20 rounded-xl overflow-hidden shadow-sm">
      <Skeleton className="aspect-square w-full bg-amber-100" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16 bg-amber-100" />
        <Skeleton className="h-4 w-3/4 bg-amber-100" />
        <Skeleton className="h-3 w-full bg-amber-100" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-20 bg-amber-100" />
          <Skeleton className="h-7 w-16 bg-amber-100" />
        </div>
      </div>
    </div>
  );
}

// ─── Currency Selector ────────────────────────────────────────────────────────
function CurrencySelector() {
  const { currency, setCurrencyCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-ocid="currency.select"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-black/30 hover:border-black text-black font-display text-xs tracking-[0.2em] uppercase rounded-none shadow-sm hover:shadow-md transition-all duration-200 min-w-[130px] justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-gold font-semibold text-sm">
            {currency.symbol}
          </span>
          <span className="font-semibold text-black">{currency.code}</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-black/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-white border-2 border-black/20 shadow-xl min-w-[180px] rounded-none overflow-hidden"
          data-ocid="currency.dropdown_menu"
        >
          {CURRENCIES.map((c) => (
            <button
              type="button"
              key={c.code}
              onClick={() => {
                setCurrencyCode(c.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left font-body text-xs transition-all duration-150
                ${
                  currency.code === c.code
                    ? "bg-black text-white font-semibold ring-2 ring-amber-400 ring-inset"
                    : "text-black hover:bg-amber-100 hover:text-black border-l-4 border-l-transparent"
                }`}
            >
              <span
                className={`text-sm font-semibold w-5 text-center ${currency.code === c.code ? "text-amber-300" : "text-gold"}`}
              >
                {c.symbol}
              </span>
              <span className="font-display tracking-widest uppercase text-[11px]">
                {c.code}
              </span>
              {currency.code === c.code && (
                <span className="ml-auto text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-semibold">
                  Active
                </span>
              )}
              {currency.code !== c.code && (
                <span className="ml-auto text-[10px] opacity-60">
                  {c.label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const trustItems = [
  {
    icon: Shield,
    title: "Certified Authentic",
    desc: "Every piece verified & hallmarked",
  },
  {
    icon: Truck,
    title: "Worldwide Shipping",
    desc: "Fully insured express delivery",
  },
  {
    icon: Award,
    title: "Premium Craftsmanship",
    desc: "Finest artisan goldwork",
  },
  {
    icon: Star,
    title: "Trusted Since 1990",
    desc: "Decades of excellence",
  },
];

export default function Home() {
  const { data: products, isLoading } = useListProducts();
  const featuredProducts = products?.slice(0, 4) ?? [];

  return (
    <main style={{ backgroundColor: "oklch(0.98 0.025 85)" }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden"
        style={{ backgroundColor: "oklch(0.93 0.1 82)" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-home-bg.dim_1440x600.jpg')",
          }}
        />
        {/* Bright warm overlay — vivid amber/yellow tones */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.93 0.1 82 / 0.95), oklch(0.93 0.1 82 / 0.75), oklch(0.93 0.1 82 / 0.2))",
          }}
        />
        {/* Gold shimmer at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />

        <div className="relative container mx-auto px-6 md:px-10 py-24">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-8 bg-black/40" />
              <span className="font-body text-xs tracking-[0.35em] uppercase text-black font-semibold">
                Bessie's Collection
              </span>
              <span className="h-px w-8 bg-black/40" />
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-black mb-5">
              Ashok <span className="gold-text">Gold</span>
            </h1>

            {/* Tagline */}
            <p className="font-serif text-xl md:text-2xl text-black/75 mb-8 leading-relaxed italic max-w-lg">
              Timeless elegance forged in pure gold — discover our exquisite
              collection of jewelry, coins &amp; collectibles.
            </p>

            {/* Currency Selector */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px w-6 bg-black/30" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-black/60 font-semibold">
                  Display Currency
                </span>
              </div>
              <CurrencySelector />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                data-ocid="home.shop.primary_button"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-display text-sm tracking-[0.2em] uppercase rounded-none hover:bg-neutral-800 transition-all duration-300 font-semibold"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                data-ocid="home.contact.secondary_button"
                className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-black text-black font-display text-sm tracking-[0.2em] uppercase rounded-none hover:bg-black hover:text-white transition-all duration-300 font-semibold"
              >
                Contact Us
                <Phone className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────── */}
      <section
        className="py-8"
        style={{
          backgroundColor: "oklch(0.88 0.16 82)",
          borderTop: "1px solid oklch(0.65 0.13 72 / 0.3)",
          borderBottom: "1px solid oklch(0.65 0.13 72 / 0.3)",
        }}
      >
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-black/15">
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-2 px-4 py-2"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                  style={{ backgroundColor: "oklch(0 0 0 / 0.12)" }}
                >
                  <Icon className="h-5 w-5 text-black" />
                </div>
                <span className="font-display text-xs tracking-[0.2em] uppercase text-black font-bold">
                  {title}
                </span>
                <span className="text-xs text-black/70 font-body leading-snug">
                  {desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
      <section
        className="py-20"
        style={{ backgroundColor: "oklch(0.98 0.025 85)" }}
      >
        <div className="container mx-auto px-6 md:px-10">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-12 bg-gold/60" />
              <Gem className="h-4 w-4 text-gold" />
              <span className="h-px w-12 bg-gold/60" />
            </div>
            <p className="font-body text-xs tracking-[0.35em] uppercase text-black font-bold mb-3">
              Curated Selection
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
              Featured Collection
            </h2>
            <p className="text-black/65 font-body text-base max-w-md mx-auto leading-relaxed">
              Handpicked pieces from our finest gold collection, crafted for
              those who appreciate true luxury.
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 border-2 border-dashed rounded-xl"
              style={{ borderColor: "oklch(0.65 0.13 72 / 0.3)" }}
              data-ocid="home.products.empty_state"
            >
              <Gem className="h-10 w-10 text-gold/50 mx-auto mb-3" />
              <p className="text-black/55 font-body text-sm">
                No products available yet.
              </p>
            </div>
          )}

          {/* View all */}
          <div className="text-center mt-12">
            <Link
              to="/shop"
              data-ocid="home.view_all.button"
              className="group inline-flex items-center gap-2 px-10 py-4 border-2 border-black text-black font-display text-sm tracking-[0.2em] uppercase rounded-none hover:bg-black hover:text-white transition-all duration-300 font-semibold"
            >
              View All Products
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ backgroundColor: "oklch(0.93 0.08 84)" }}
      >
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Gold divider top */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className="h-px flex-1 max-w-[80px] bg-black/30" />
              <span className="font-display text-black text-lg tracking-widest">
                ✦
              </span>
              <span className="h-px flex-1 max-w-[80px] bg-black/30" />
            </div>

            <p className="font-body text-xs tracking-[0.35em] uppercase text-black font-bold mb-4">
              Our Story
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-6 leading-tight">
              Bessie's Ashok Gold
            </h2>

            {/* Rule */}
            <div
              className="w-16 h-0.5 mx-auto mb-8"
              style={{ backgroundColor: "oklch(0.65 0.13 72)" }}
            />

            <p className="font-serif text-lg md:text-xl text-black/75 leading-relaxed italic mb-6">
              For over three decades, Bessie's Ashok Gold has been a trusted
              name in fine gold jewelry, coins, and collectibles. Rooted in a
              passion for purity and artisanship, every piece in our collection
              is a testament to the timeless beauty of gold.
            </p>
            <p className="font-body text-sm text-black/65 leading-relaxed max-w-xl mx-auto">
              From intricately crafted jewelry to investment-grade gold coins,
              we bring you authentic pieces sourced from the finest artisans —
              delivered with care, trust, and a guarantee of quality.
            </p>

            {/* Gold divider bottom */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <span className="h-px flex-1 max-w-[80px] bg-black/30" />
              <span className="font-display text-black text-lg tracking-widest">
                ✦
              </span>
              <span className="h-px flex-1 max-w-[80px] bg-black/30" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA STRIP ─────────────────────────────────── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: "oklch(0.85 0.18 78)" }}
      >
        {/* Warm pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, oklch(0 0 0) 0, oklch(0 0 0) 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background:
              "linear-gradient(to right, transparent, oklch(0.1 0 0 / 0.3), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background:
              "linear-gradient(to right, transparent, oklch(0.1 0 0 / 0.3), transparent)",
          }}
        />

        <div className="relative container mx-auto px-6 md:px-10 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-black/40" />
            <span className="font-display text-black text-sm tracking-widest font-bold">
              ✦
            </span>
            <span className="h-px w-10 bg-black/40" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
            Looking for Something{" "}
            <span className="underline decoration-gold/70 underline-offset-4">
              Special?
            </span>
          </h2>
          <p className="font-body text-base text-black/70 mb-10 max-w-lg mx-auto leading-relaxed">
            Contact us for custom orders, bulk purchases, or any inquiries about
            our gold collection. We're here to help.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              data-ocid="home.cta.browse_button"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-display text-sm tracking-[0.2em] uppercase rounded-none hover:bg-neutral-800 transition-all duration-300 shadow-lg font-semibold"
            >
              Browse Shop
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              data-ocid="home.cta.contact_button"
              className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-black text-black font-display text-sm tracking-[0.2em] uppercase rounded-none hover:bg-black hover:text-white transition-all duration-300 font-semibold"
            >
              Get in Touch
              <Phone className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
