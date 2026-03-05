import type { Product } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { useAddToCart } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { Eye, ImageOff, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const addToCartMutation = useAddToCart();
  const { convertPrice } = useCurrency();
  const [imgFailed, setImgFailed] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    addToCartMutation.mutate({ productId: product.id, quantity: BigInt(1) });
    toast.success(`${product.name} added to cart`);
  };

  const handleImageError = () => {
    setImgFailed(true);
  };

  const isOutOfStock = !product.inStock;

  return (
    <div className="group relative card-dark rounded-lg overflow-hidden transition-all duration-300 hover:shadow-gold hover:-translate-y-1">
      {/* Stock Badge */}
      <div className="absolute top-2 right-2 z-10">
        {product.inStock ? (
          <Badge className="bg-gold/90 text-white font-body text-[10px] tracking-wide border-0 shadow-sm">
            In Stock
          </Badge>
        ) : (
          <Badge
            variant="destructive"
            className="font-body text-[10px] tracking-wide shadow-sm"
          >
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Image */}
      <Link to="/product/$id" params={{ id: product.id.toString() }}>
        <div className="relative overflow-hidden aspect-square bg-secondary">
          {imgFailed ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary gap-2">
              <ImageOff className="h-10 w-10 text-gold/40" />
              <span className="text-[10px] font-body tracking-widest uppercase text-gold/50">
                No Image
              </span>
            </div>
          ) : (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="font-display text-xs tracking-widest uppercase text-gold/80 border border-gold/40 px-3 py-1 rounded bg-background/80">
                Out of Stock
              </span>
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="flex items-center gap-1.5 text-[10px] font-display tracking-widest uppercase text-white bg-foreground/60 px-3 py-1.5 rounded">
              <Eye className="h-3 w-3" />
              View
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <span className="text-[10px] font-body tracking-widest uppercase text-gold/70 mb-1 block">
          {product.category}
        </span>
        <Link to="/product/$id" params={{ id: product.id.toString() }}>
          <h3 className="font-display text-sm font-medium text-foreground mb-1 hover:text-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-lg font-semibold text-gold">
            {convertPrice(product.price)}
          </span>
          <button
            type="button"
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
