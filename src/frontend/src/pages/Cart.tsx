import type { Order } from "@/backend";
import { OrderStatus } from "@/backend";
import CartItemComponent from "@/components/CartItem";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import {
  useAddToCart,
  useGetOrders,
  useListProducts,
  usePlaceOrder,
} from "@/hooks/useQueries";
import { sendWhatsAppNotification } from "@/utils/whatsapp";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ClockIcon,
  Loader2,
  PackageOpen,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Status badge helper ──────────────────────────────────────────────────────
function statusLabel(status: OrderStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case OrderStatus.pending:
      return {
        label: "Pending",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case OrderStatus.processing:
      return {
        label: "Processing",
        className: "bg-blue-100 text-blue-700 border-blue-200",
      };
    case OrderStatus.shipped:
      return {
        label: "Shipped",
        className: "bg-purple-100 text-purple-700 border-purple-200",
      };
    case OrderStatus.delivered:
      return {
        label: "Delivered",
        className: "bg-green-100 text-green-700 border-green-200",
      };
    case OrderStatus.cancelled:
      return {
        label: "Cancelled",
        className: "bg-red-100 text-red-700 border-red-200",
      };
    default:
      return {
        label: "Unknown",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
}

// ─── Previous Orders Section ──────────────────────────────────────────────────
function PreviousOrders() {
  const [open, setOpen] = useState(false);
  const { data: orders, isLoading } = useGetOrders();
  const { data: products } = useListProducts();
  const { convertPrice } = useCurrency();

  const getProductName = (productId: bigint): string => {
    if (!products) return `Product #${productId}`;
    const product = products.find((p) => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  const formatTimestamp = (timestamp: bigint): string => {
    // ICP timestamps are in nanoseconds
    const ms = Number(timestamp / BigInt(1_000_000));
    const date = new Date(ms);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedOrders = orders
    ? [...orders].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-lg border border-gold/25 bg-cream/60 hover:bg-cream hover:border-gold/50 transition-all duration-200 group"
        >
          <span className="flex items-center gap-2.5 font-display text-sm tracking-widest uppercase text-foreground/80 group-hover:text-gold transition-colors">
            <ClockIcon className="h-4 w-4 text-gold" />
            My Previous Orders
            {orders && orders.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-gold text-white text-[10px] font-bold">
                {orders.length}
              </span>
            )}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-gold/60" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gold/60" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 rounded-lg border border-gold/15 bg-cream/40 overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <PackageOpen className="h-10 w-10 text-gold/25 mb-3" />
              <p className="font-display text-sm text-foreground/50 tracking-wide">
                No previous orders found.
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Your completed orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gold/10">
              {sortedOrders.map((order: Order) => {
                const { label, className } = statusLabel(order.status);
                return (
                  <div
                    key={order.id.toString()}
                    className="p-4 hover:bg-cream/60 transition-colors"
                  >
                    {/* Order header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-display text-xs tracking-widest uppercase text-gold">
                          Order #{order.id.toString()}
                        </p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(order.timestamp)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className} shrink-0`}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Items */}
                    <ul className="space-y-0.5 mb-2">
                      {order.items.map(([productId, quantity], idx) => (
                        <li
                          // biome-ignore lint/suspicious/noArrayIndexKey: order items have no stable key
                          key={idx}
                          className="flex justify-between text-xs font-body text-foreground/70"
                        >
                          <span className="truncate mr-2">
                            {getProductName(productId)} × {quantity.toString()}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 border-t border-gold/10">
                      <span className="font-body text-xs text-muted-foreground">
                        Total
                      </span>
                      <span className="font-serif text-sm font-semibold text-gold">
                        {convertPrice(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────────────────
export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } =
    useCart();
  const placeOrderMutation = usePlaceOrder();
  const addToCartMutation = useAddToCart();
  const { convertPrice } = useCurrency();

  const [form, setForm] = useState({
    name: "",
    country: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCheckout, setShowCheckout] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.country.trim()) newErrors.country = "Country is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone))
      newErrors.phone = "Enter a valid phone number";
    if (!form.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;

    // Capture items snapshot before clearing cart
    const orderItems = items.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));
    const orderTotal = subtotal;

    // Sync cart to backend before placing order
    for (const item of items) {
      await addToCartMutation.mutateAsync({
        productId: item.product.id,
        quantity: BigInt(item.quantity),
      });
    }

    placeOrderMutation.mutate(
      {
        name: form.name,
        country: form.country,
        phone: form.phone,
        address: form.address,
      },
      {
        onSuccess: (orderId) => {
          if (orderId !== null && orderId !== undefined) {
            // Send WhatsApp notification with full order details
            sendWhatsAppNotification({
              orderId: orderId.toString(),
              customerName: form.name,
              customerCountry: form.country,
              customerPhone: form.phone,
              customerAddress: form.address,
              items: orderItems,
              total: orderTotal,
              timestamp: new Date(),
            });

            clearCart();
            navigate({
              to: "/order-confirmation/$orderId",
              params: { orderId: orderId.toString() },
            });
          } else {
            toast.error("Failed to place order. Please try again.");
          }
        },
        onError: () => {
          toast.error("An error occurred. Please try again.");
        },
      },
    );
  };

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <ShoppingCart className="h-16 w-16 text-gold/20 mx-auto mb-6" />
          <h2 className="font-display text-2xl text-foreground mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-muted-foreground font-body mb-8">
            Discover our exquisite collection and add something special.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-display text-sm tracking-widest uppercase rounded hover:bg-neutral-800 transition-all duration-200"
          >
            Shop Now
          </Link>
        </div>

        {/* Previous Orders even when cart is empty */}
        <div className="max-w-xl mx-auto">
          <PreviousOrders />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-1">
          Your Selection
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
          Shopping <span className="gold-text">Cart</span>
        </h1>
        <div className="mt-3 w-16 h-px bg-gold/40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-sm text-muted-foreground font-body">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
          {items.map((item) => (
            <CartItemComponent
              key={item.product.id.toString()}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors font-body mt-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          {/* Previous Orders — below cart items on mobile/tablet, full width */}
          <div className="pt-4 lg:hidden">
            <PreviousOrders />
          </div>
        </div>

        {/* Order Summary + Checkout */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="card-dark rounded-lg p-5">
            <h2 className="font-display text-sm tracking-widest uppercase text-foreground mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div
                  key={item.product.id.toString()}
                  className="flex justify-between text-xs font-body text-muted-foreground"
                >
                  <span className="truncate mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="shrink-0">
                    {convertPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gold/15 pt-3 flex justify-between items-center">
              <span className="font-display text-sm tracking-wide text-foreground">
                Subtotal
              </span>
              <span className="font-serif text-xl font-semibold text-gold">
                {convertPrice(subtotal)}
              </span>
            </div>
          </div>

          {/* Checkout Form */}
          {!showCheckout ? (
            <button
              type="button"
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 bg-gold text-white font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 shadow-gold"
            >
              Proceed to Checkout
            </button>
          ) : (
            <div className="card-dark rounded-lg p-5 space-y-4">
              <h2 className="font-display text-sm tracking-widest uppercase text-foreground">
                Delivery Details
              </h2>

              {/* Full Name */}
              <div className="space-y-1">
                <Label
                  htmlFor="name"
                  className="text-xs font-body text-muted-foreground tracking-wide uppercase"
                >
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-background border-gold/20 focus:border-gold/60 text-foreground placeholder:text-muted-foreground"
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1">
                <Label
                  htmlFor="country"
                  className="text-xs font-body text-muted-foreground tracking-wide uppercase"
                >
                  Country *
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  placeholder="e.g. Germany, France"
                  className="bg-background border-gold/20 focus:border-gold/60 text-foreground placeholder:text-muted-foreground"
                />
                {errors.country && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label
                  htmlFor="phone"
                  className="text-xs font-body text-muted-foreground tracking-wide uppercase"
                >
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+49 123 456 7890"
                  className="bg-background border-gold/20 focus:border-gold/60 text-foreground placeholder:text-muted-foreground"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label
                  htmlFor="address"
                  className="text-xs font-body text-muted-foreground tracking-wide uppercase"
                >
                  Delivery Address *
                </Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Street, City, Postal Code"
                  rows={3}
                  className="bg-background border-gold/20 focus:border-gold/60 text-foreground placeholder:text-muted-foreground resize-none"
                />
                {errors.address && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.address}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={placeOrderMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-white font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 shadow-gold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placeOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="w-full py-2 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Cart
              </button>
            </div>
          )}

          {/* Previous Orders — sidebar on desktop */}
          <div className="hidden lg:block">
            <PreviousOrders />
          </div>
        </div>
      </div>
    </main>
  );
}
