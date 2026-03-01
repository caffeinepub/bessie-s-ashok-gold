import { Link } from '@tanstack/react-router';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/backend';
import { useCart } from '@/hooks/useCart';
import { useAddToCart } from '@/hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CATEGORY_IMAGES: Record<string, string> = {
  Jewelry: '/assets/generated/product-jewelry.dim_400x400.png',
  Collectibles: '/assets/generated/product-coin.dim_400x400.png',
  Investments: '/assets/generated/product-coin.dim_400x400.png',
  Accessories: '/assets/generated/product-decor.dim_400x400.png',
};

function getProductImage(product: Product): string {
  if (product.imageUrl && !product.imageUrl.includes('placeholder.com')) {
    return product.imageUrl;
  }
  return CATEGORY_IMAGES[product.category] || '/assets/generated/product-decor.dim_400x400.png';
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    addToCartMutation.mutate({ productId: product.id, quantity: BigInt(1) });
    toast.success(`${product.name} added to cart`);
  };

  const isOutOfStock = !product.inStock;
  const imgSrc = getProductImage(product);

  return (
    <div className="group relative card-dark rounded-lg overflow-hidden transition-all duration-300 hover:shadow-gold hover:-translate-y-1">
      {/* Stock Badge */}
      <div className="absolute top-2 right-2 z-10">
        {product.inStock ? (
          <Badge className="bg-gold/90 text-white font-body text-[10px] tracking-wide border-0 shadow-sm">
            In Stock
          </Badge>
        ) : (
          <Badge variant="destructive" className="font-body text-[10px] tracking-wide shadow-sm">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Image */}
      <Link to="/product/$id" params={{ id: product.id.toString() }}>
        <div className="relative overflow-hidden aspect-square bg-secondary">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="font-display text-xs tracking-widest uppercase text-gold/80 border border-gold/40 px-3 py-1 rounded bg-background/80">
                Out of Stock
              </span>
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="flex items-center gap-2 text-gold font-display text-xs tracking-widest uppercase border border-gold/60 px-4 py-2 rounded bg-background/80 backdrop-blur-sm">
              <Eye className="h-3.5 w-3.5" />
              View Details
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-[10px] font-body tracking-widest uppercase text-gold/70">
            {product.category}
          </span>
        </div>
        <Link to="/product/$id" params={{ id: product.id.toString() }}>
          <h3 className="font-display text-sm font-medium text-foreground group-hover:text-gold transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-serif text-lg font-semibold text-gold">
            €{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addToCartMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-white font-display text-[10px] tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ShoppingCart className="h-3 w-3" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
