import { useState } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Minus, Plus, AlertCircle, ImageOff } from 'lucide-react';
import { useGetProduct } from '@/hooks/useQueries';
import { useCart } from '@/hooks/useCart';
import { useAddToCart } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams({ from: '/product/$id' });
  const navigate = useNavigate();
  const productId = BigInt(id);
  const { data: product, isLoading } = useGetProduct(productId);
  const { addItem } = useCart();
  const addToCartMutation = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [imgFailed, setImgFailed] = useState(false);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-lg bg-secondary" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 bg-secondary" />
            <Skeleton className="h-8 w-3/4 bg-secondary" />
            <Skeleton className="h-6 w-32 bg-secondary" />
            <Skeleton className="h-20 w-full bg-secondary" />
            <Skeleton className="h-12 w-full bg-secondary" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-gold/40 mx-auto mb-4" />
        <h2 className="font-display text-2xl text-foreground mb-2">Product Not Found</h2>
        <p className="text-muted-foreground font-body mb-6">This product doesn't exist or has been removed.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-body text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </main>
    );
  }

  const isOutOfStock = !product.inStock;

  const handleImageError = () => {
    setImgFailed(true);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    addToCartMutation.mutate({ productId: product.id, quantity: BigInt(quantity) });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    addToCartMutation.mutate({ productId: product.id, quantity: BigInt(quantity) });
    navigate({ to: '/cart' });
  };

  return (
    <main className="container mx-auto px-4 md:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-8">
        <Link to="/" className="hover:text-gold transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-foreground/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="relative">
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary border border-gold/15">
            {imgFailed ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-secondary gap-3">
                <ImageOff className="h-16 w-16 text-gold/30" />
                <span className="text-xs font-body tracking-widest uppercase text-gold/40">
                  No Image
                </span>
              </div>
            ) : (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          <span className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">
            {product.category}
          </span>

          {/* Name */}
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-tight">
            {product.name}
          </h1>

          {/* Stock Badge */}
          {product.inStock ? (
            <Badge className="w-fit bg-gold/15 text-gold border border-gold/30 font-body text-xs tracking-wide">
              In Stock
            </Badge>
          ) : (
            <Badge variant="destructive" className="w-fit font-body text-xs tracking-wide">
              Out of Stock
            </Badge>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-semibold text-gold">
              €{product.price.toFixed(2)}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gold/15" />

          {/* Description */}
          <p className="font-body text-sm text-foreground/70 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-body text-muted-foreground tracking-widest uppercase">Qty</span>
              <div className="flex items-center gap-2 border border-gold/20 rounded overflow-hidden bg-background">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gold/10 text-foreground/60 hover:text-gold transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-body text-foreground min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gold/10 text-foreground/60 hover:text-gold transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCartMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gold text-white font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-gold"
            >
              <ShoppingCart className="h-4 w-4" />
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gold text-gold font-display text-sm tracking-widest uppercase rounded hover:bg-gold/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {isOutOfStock && (
            <p className="text-xs text-muted-foreground font-body text-center">
              This item is currently out of stock.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
