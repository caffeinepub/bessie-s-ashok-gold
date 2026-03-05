import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListProducts } from "@/hooks/useQueries";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const PRODUCTS_PER_PAGE = 20;

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

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under €500", min: 0, max: 500 },
  { label: "€500 – €1,000", min: 500, max: 1000 },
  { label: "€1,000 – €2,500", min: 1000, max: 2500 },
  { label: "Over €2,500", min: 2500, max: Number.POSITIVE_INFINITY },
];

export default function Shop() {
  const { data: products, isLoading } = useListProducts();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("0");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    if (!products) return [];
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return cats.sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const priceRange = PRICE_RANGES[Number.parseInt(selectedPriceRange)];

    let result = products.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchesPrice =
        p.price >= priceRange.min && p.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === "price-asc")
      result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc")
      result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "name")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, search, selectedCategory, selectedPriceRange, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PRODUCTS_PER_PAGE),
  );
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filtered.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filtered, currentPage]);

  const hasFilters =
    search !== "" || selectedCategory !== "all" || selectedPriceRange !== "0";

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedPriceRange("0");
    setSortBy("default");
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setCurrentPage(1);
  };

  return (
    <main className="container mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-1">
          Our Collection
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
          Shop <span className="gold-text">All Products</span>
        </h1>
        <div className="mt-3 w-16 h-px bg-gold/40" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-background border-gold/20 focus:border-gold/60 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category */}
        <Select
          value={selectedCategory}
          onValueChange={handleFilterChange(setSelectedCategory)}
        >
          <SelectTrigger className="w-full sm:w-44 bg-background border-gold/20 text-foreground">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-background border-gold/20">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price Range */}
        <Select
          value={selectedPriceRange}
          onValueChange={handleFilterChange(setSelectedPriceRange)}
        >
          <SelectTrigger className="w-full sm:w-44 bg-background border-gold/20 text-foreground">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent className="bg-background border-gold/20">
            {PRICE_RANGES.map((range) => (
              <SelectItem
                key={range.label}
                value={PRICE_RANGES.indexOf(range).toString()}
              >
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={handleFilterChange(setSortBy)}>
          <SelectTrigger className="w-full sm:w-44 bg-background border-gold/20 text-foreground">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-background border-gold/20">
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-body text-gold border border-gold/30 rounded hover:bg-gold/10 transition-colors whitespace-nowrap"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground font-body mb-5">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}{" "}
          found
          {totalPages > 1 && ` — page ${currentPage} of ${totalPages}`}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="border-gold/30 text-foreground hover:bg-gold/10"
                data-ocid="shop.pagination_prev"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 2,
                  )
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis placeholders have no stable key
                        key={`ellipsis-${idx}`}
                        className="px-2 text-muted-foreground text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          setCurrentPage(item as number);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                          currentPage === item
                            ? "bg-gold text-white"
                            : "text-foreground hover:bg-gold/10 border border-gold/20"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
                className="border-gold/30 text-foreground hover:bg-gold/10"
                data-ocid="shop.pagination_next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <SlidersHorizontal className="h-10 w-10 text-gold/30 mx-auto mb-4" />
          <p className="font-display text-lg text-foreground/60">
            No products found
          </p>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Try adjusting your filters
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm text-gold hover:text-gold-dark transition-colors font-body underline underline-offset-4"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </main>
  );
}
