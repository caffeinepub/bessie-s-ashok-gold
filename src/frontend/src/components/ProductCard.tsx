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
    <div className="group relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-2 border-black/10 hover:border-black/25">
      {/* Stock Badge */}
      <div className="absolute top-2 right-2 z-10">
        {product.inStock ? (
          <Badge className="bg-black text-white font-body text-[10px] tracking-wide border-0 shadow-sm font-bold">
            In Stock
          </Badge>
        ) : (
          <Badge
            variant="destructive"
            className="font-body text-[10px] tracking-wide shadow-sm font-bold"
          >
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Image */}
      <Link to="/product/$id" params={{ id: product.id.toString() }}>
        <div
          className="relative overflow-hidden aspect-square"
          style={{ backgroundColor: "oklch(0.96 0.003 60)" }}
        >
          {imgFailed ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ backgroundColor: "oklch(0.96 0.003 60)" }}
            >
              <ImageOff className="h-10 w-10 text-black/25" />
              <span className="text-[10px] font-body tracking-widest uppercase text-black/35 font-semibold">
                No Image
              </span>
            </div>
          ) : (
            <img
              src={product.image.getDirectURL()}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="font-display text-xs tracking-widest uppercase text-black border-2 border-black px-3 py-1 rounded bg-white/90 font-bold">
                Out of Stock
              </span>
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="flex items-center gap-1.5 text-[10px] font-display tracking-widest uppercase text-white bg-black/70 px-3 py-1.5 rounded font-bold">
              <Eye className="h-3 w-3" />
              View
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <span className="text-[10px] font-body tracking-widest uppercase text-black/50 mb-1 block font-bold">
          {product.category}
        </span>
        <Link to="/product/$id" params={{ id: product.id.toString() }}>
          <h3 className="font-display text-sm font-bold text-black mb-1 hover:text-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-black/60 font-body line-clamp-2 mb-3 font-medium">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-lg font-bold text-gold">
            {convertPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || addToCartMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white font-display text-[10px] tracking-widest uppercase rounded hover:bg-neutral-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm font-bold"
          >
            <ShoppingCart className="h-3 w-3" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
