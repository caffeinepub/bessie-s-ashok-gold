import type { CartItem as CartItemType } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: bigint, quantity: number) => void;
  onRemove: (productId: bigint) => void;
}

export default function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const { product, quantity } = item;
  const { convertPrice } = useCurrency();
  const subtotal = product.price * quantity;
  const [imgFailed, setImgFailed] = useState(false);

  const handleImageError = () => {
    setImgFailed(true);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border-2 border-black/12 shadow-sm">
      {/* Image */}
      <div
        className="w-20 h-20 shrink-0 rounded overflow-hidden"
        style={{ backgroundColor: "oklch(0.96 0.03 84)" }}
      >
        {imgFailed ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-1"
            style={{ backgroundColor: "oklch(0.96 0.03 84)" }}
          >
            <ImageOff className="h-6 w-6 text-black/25" />
            <span className="text-[8px] font-body tracking-widest uppercase text-black/35 font-semibold">
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

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-body tracking-widest uppercase text-black/45 font-bold">
              {product.category}
            </span>
            <h3 className="font-display text-sm font-bold text-black truncate">
              {product.name}
            </h3>
            <p className="text-xs text-black/55 mt-0.5 font-semibold">
              {convertPrice(product.price)} each
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            className="p-1.5 text-black/40 hover:text-destructive transition-colors shrink-0"
            aria-label="Remove item"
            data-ocid="cart.item.delete_button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity + Subtotal */}
        <div className="flex items-center justify-between mt-3">
          <div
            className="flex items-center gap-2 border-2 border-black/15 rounded overflow-hidden"
            style={{ backgroundColor: "oklch(0.96 0.03 84)" }}
          >
            <button
              type="button"
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              className="p-1.5 hover:bg-black/10 text-black/60 hover:text-black transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 py-1 text-sm font-body text-black min-w-[2rem] text-center font-bold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="p-1.5 hover:bg-black/10 text-black/60 hover:text-black transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="font-serif text-base font-bold text-gold">
            {convertPrice(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
