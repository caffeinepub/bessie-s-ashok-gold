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
        className: "bg-amber-100 text-amber-900 border-amber-300",
      };
    case OrderStatus.processing:
      return {
        label: "Processing",
        className: "bg-blue-100 text-blue-900 border-blue-300",
      };
    case OrderStatus.shipped:
      return {
        label: "Shipped",
        className: "bg-purple-100 text-purple-900 border-purple-300",
      };
    case OrderStatus.delivered:
      return {
        label: "Delivered",
        className: "bg-green-100 text-green-900 border-green-300",
      };
    case OrderStatus.cancelled:
      return {
        label: "Cancelled",
        className: "bg-red-100 text-red-900 border-red-300",
      };
    default:
      return {
        label: "Unknown",
        className: "bg-gray-100 text-gray-900 border-gray-300",
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
          data-ocid="cart.orders.toggle"
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-lg border-2 border-black/20 bg-amber-50 hover:bg-amber-100 hover:border-black/40 transition-all duration-200 group"
        >
          <span className="flex items-center gap-2.5 font-display text-sm tracking-widest uppercase text-black font-bold group-hover:text-black transition-colors">
            <ClockIcon className="h-4 w-4 text-gold" />
            My Previous Orders
            {orders && orders.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-black text-white text-[10px] font-bold">
                {orders.length}
              </span>
            )}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-black/60" />
          ) : (
            <ChevronDown className="h-4 w-4 text-black/60" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 rounded-lg border-2 border-black/15 bg-white overflow-hidden">
          {isLoading ? (
            <div
              className="p-5 space-y-3"
              data-ocid="cart.orders.loading_state"
            >
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3 bg-amber-100" />
                  <Skeleton className="h-3 w-2/3 bg-amber-100" />
                  <Skeleton className="h-3 w-1/2 bg-amber-100" />
                </div>
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 px-5 text-center"
              data-ocid="cart.orders.empty_state"
            >
              <PackageOpen className="h-10 w-10 text-black/25 mb-3" />
              <p className="font-display text-sm text-black/60 tracking-wide font-semibold">
                No previous orders found.
              </p>
              <p className="font-body text-xs text-black/45 mt-1">
                Your completed orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {sortedOrders.map((order: Order) => {
                const { label, className } = statusLabel(order.status);
                return (
                  <div
                    key={order.id.toString()}
                    className="p-4 hover:bg-amber-50 transition-colors"
                  >
                    {/* Order header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-display text-xs tracking-widest uppercase text-gold font-bold">
                          Order #{order.id.toString()}
                        </p>
                        <p className="font-body text-xs text-black/55 mt-0.5">
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
                          className="flex justify-between text-xs font-body text-black/70"
                        >
                          <span className="truncate mr-2">
                            {getProductName(productId)} × {quantity.toString()}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 border-t border-black/10">
                      <span className="font-body text-xs text-black/55 font-semibold">
                        Total
                      </span>
                      <span className="font-serif text-sm font-bold text-gold">
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
      <main
        className="min-h-screen"
        style={{ backgroundColor: "oklch(0.98 0.025 85)" }}
      >
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="text-center mb-12" data-ocid="cart.empty_state">
            <ShoppingCart className="h-16 w-16 text-black/20 mx-auto mb-6" />
            <h2 className="font-display text-2xl text-black font-bold mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-black/60 font-body mb-8">
              Discover our exquisite collection and add something special.
            </p>
            <Link
              to="/shop"
              data-ocid="cart.shop.primary_button"
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-display text-sm tracking-widest uppercase rounded hover:bg-neutral-800 transition-all duration-200 font-semibold"
            >
              Shop Now
            </Link>
          </div>

          {/* Previous Orders even when cart is empty */}
          <div className="max-w-xl mx-auto">
            <PreviousOrders />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.98 0.025 85)" }}
    >
      <div className="container mx-auto px-4 md:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-black font-bold mb-1">
            Your Selection
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-black">
            Shopping <span className="gold-text">Cart</span>
          </h1>
          <div className="mt-3 w-16 h-0.5 bg-gold/60" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-sm text-black/60 font-body font-semibold">
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
              data-ocid="cart.continue_shopping.link"
              className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors font-body mt-2 font-semibold"
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
            <div className="rounded-lg p-5 bg-white border-2 border-black/15 shadow-sm">
              <h2 className="font-display text-sm tracking-widest uppercase text-black font-bold mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={item.product.id.toString()}
                    className="flex justify-between text-xs font-body text-black/65"
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
              <div className="border-t-2 border-black/15 pt-3 flex justify-between items-center">
                <span className="font-display text-sm tracking-wide text-black font-bold">
                  Subtotal
                </span>
                <span className="font-serif text-xl font-bold text-gold">
                  {convertPrice(subtotal)}
                </span>
              </div>
            </div>

            {/* Checkout Form */}
            {!showCheckout ? (
              <button
                type="button"
                onClick={() => setShowCheckout(true)}
                data-ocid="cart.checkout.primary_button"
                className="w-full py-3 bg-gold text-black font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 shadow-gold font-bold"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="rounded-lg p-5 bg-white border-2 border-black/15 shadow-sm space-y-4">
                <h2 className="font-display text-sm tracking-widest uppercase text-black font-bold">
                  Delivery Details
                </h2>

                {/* Full Name */}
                <div className="space-y-1">
                  <Label
                    htmlFor="name"
                    className="text-xs font-body text-black/65 tracking-wide uppercase font-semibold"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    data-ocid="cart.name.input"
                    className="bg-amber-50 border-black/20 focus:border-black/60 text-black placeholder:text-black/35"
                  />
                  {errors.name && (
                    <p
                      className="text-xs text-destructive flex items-center gap-1"
                      data-ocid="cart.name.error_state"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <Label
                    htmlFor="country"
                    className="text-xs font-body text-black/65 tracking-wide uppercase font-semibold"
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
                    data-ocid="cart.country.input"
                    className="bg-amber-50 border-black/20 focus:border-black/60 text-black placeholder:text-black/35"
                  />
                  {errors.country && (
                    <p
                      className="text-xs text-destructive flex items-center gap-1"
                      data-ocid="cart.country.error_state"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-body text-black/65 tracking-wide uppercase font-semibold"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+49 123 456 7890"
                    data-ocid="cart.phone.input"
                    className="bg-amber-50 border-black/20 focus:border-black/60 text-black placeholder:text-black/35"
                  />
                  {errors.phone && (
                    <p
                      className="text-xs text-destructive flex items-center gap-1"
                      data-ocid="cart.phone.error_state"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <Label
                    htmlFor="address"
                    className="text-xs font-body text-black/65 tracking-wide uppercase font-semibold"
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
                    data-ocid="cart.address.textarea"
                    className="bg-amber-50 border-black/20 focus:border-black/60 text-black placeholder:text-black/35 resize-none"
                  />
                  {errors.address && (
                    <p
                      className="text-xs text-destructive flex items-center gap-1"
                      data-ocid="cart.address.error_state"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={placeOrderMutation.isPending}
                  data-ocid="cart.place_order.submit_button"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white font-display text-sm tracking-widest uppercase rounded hover:bg-neutral-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-bold shadow-md"
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
                  data-ocid="cart.back.button"
                  className="w-full py-2 text-xs font-body text-black/55 hover:text-black transition-colors font-semibold"
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
      </div>
    </main>
  );
}
