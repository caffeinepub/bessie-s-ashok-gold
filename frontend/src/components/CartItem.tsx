import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/hooks/useCart';

const CATEGORY_IMAGES: Record<string, string> = {
  Jewelry: '/assets/generated/product-jewelry.dim_400x400.png',
  Collectibles: '/assets/generated/product-coin.dim_400x400.png',
  Investments: '/assets/generated/product-coin.dim_400x400.png',
  Accessories: '/assets/generated/product-decor.dim_400x400.png',
};

function getProductImage(item: CartItemType): string {
  const { product } = item;
  if (product.imageUrl && !product.imageUrl.includes('placeholder.com')) {
    return product.imageUrl;
  }
  return CATEGORY_IMAGES[product.category] || '/assets/generated/product-decor.dim_400x400.png';
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: bigint, quantity: number) => void;
  onRemove: (productId: bigint) => void;
}

export default function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item;
  const subtotal = product.price * quantity;
  const imgSrc = getProductImage(item);

  return (
    <div className="flex gap-4 p-4 card-dark rounded-lg">
      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded overflow-hidden bg-secondary">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-body tracking-widest uppercase text-gold/70">
              {product.category}
            </span>
            <h3 className="font-display text-sm font-medium text-foreground truncate">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              €{product.price.toFixed(2)} each
            </p>
          </div>
          <button
            onClick={() => onRemove(product.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity + Subtotal */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 border border-gold/20 rounded overflow-hidden bg-background">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              className="p-1.5 hover:bg-gold/10 text-foreground/60 hover:text-gold transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 py-1 text-sm font-body text-foreground min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="p-1.5 hover:bg-gold/10 text-foreground/60 hover:text-gold transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="font-serif text-base font-semibold text-gold">
            €{subtotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
