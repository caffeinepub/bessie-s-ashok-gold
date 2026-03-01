import { Link } from '@tanstack/react-router';
import { ArrowRight, Star, Shield, Truck } from 'lucide-react';
import { useListProducts } from '@/hooks/useQueries';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

function ProductSkeleton() {
  return (
    <div className="card-dark rounded-lg overflow-hidden">
      <Skeleton className="aspect-square w-full bg-secondary" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16 bg-secondary" />
        <Skeleton className="h-4 w-3/4 bg-secondary" />
        <Skeleton className="h-3 w-full bg-secondary" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-20 bg-secondary" />
          <Skeleton className="h-7 w-16 bg-secondary" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: products, isLoading } = useListProducts();

  const featuredProducts = products?.slice(0, 4) ?? [];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/generated/hero-banner.dim_1200x400.png')" }}
        />
        {/* Light overlay */}
        <div className="absolute inset-0 bg-background/60" />
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />

        <div className="relative container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-xl">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-4">
              Bessie's Collection
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-4">
              Ashok{' '}
              <span className="gold-text">Gold</span>
            </h1>
            <p className="font-serif text-lg md:text-xl text-foreground/70 mb-8 leading-relaxed italic">
              Timeless elegance forged in pure gold. Discover our exquisite collection of jewelry, coins, and collectibles.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-white font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 shadow-gold"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3 border border-gold/40 text-gold font-display text-sm tracking-widest uppercase rounded hover:bg-gold/10 transition-all duration-200"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-gold/10 bg-secondary">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Certified Authentic', desc: '100% genuine gold products' },
              { icon: Star, title: 'Premium Quality', desc: 'Finest craftsmanship guaranteed' },
              { icon: Truck, title: 'Secure Delivery', desc: 'Insured & tracked shipping' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="p-2.5 rounded-full bg-gold/10 border border-gold/20 shrink-0">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-display text-xs tracking-wider uppercase text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-10">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-2">Curated Selection</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            Featured <span className="gold-text">Pieces</span>
          </h2>
          <div className="mt-3 mx-auto w-16 h-px bg-gold/40" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
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
          <div className="text-center py-12 text-muted-foreground font-body">
            Loading products...
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold/40 text-gold font-display text-sm tracking-widest uppercase rounded hover:bg-gold/10 transition-all duration-200"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="relative overflow-hidden bg-secondary border-y border-gold/10 py-16">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
            The Art of <span className="gold-text">Pure Gold</span>
          </h2>
          <p className="font-serif text-lg text-foreground/60 italic mb-6 max-w-lg mx-auto">
            Each piece in our collection is a testament to centuries of goldsmithing tradition.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-white font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 shadow-gold"
          >
            Discover the Collection
          </Link>
        </div>
      </section>
    </main>
  );
}
