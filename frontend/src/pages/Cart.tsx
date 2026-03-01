import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { usePlaceOrder, useAddToCart } from '@/hooks/useQueries';
import CartItemComponent from '@/components/CartItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { sendWhatsAppNotification } from '@/utils/whatsapp';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const placeOrderMutation = usePlaceOrder();
  const addToCartMutation = useAddToCart();

  const [form, setForm] = useState({ name: '', country: '', phone: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCheckout, setShowCheckout] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) newErrors.phone = 'Enter a valid phone number';
    if (!form.address.trim()) newErrors.address = 'Address is required';
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
      { name: form.name, country: form.country, phone: form.phone, address: form.address },
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
            navigate({ to: '/order-confirmation/$orderId', params: { orderId: orderId.toString() } });
          } else {
            toast.error('Failed to place order. Please try again.');
          }
        },
        onError: () => {
          toast.error('An error occurred. Please try again.');
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-gold/20 mx-auto mb-6" />
        <h2 className="font-display text-2xl text-foreground mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground font-body mb-8">
          Discover our exquisite collection and add something special.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-white font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 shadow-gold"
        >
          Shop Now
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-gold mb-1">Your Selection</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
          Shopping <span className="gold-text">Cart</span>
        </h1>
        <div className="mt-3 w-16 h-px bg-gold/40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-sm text-muted-foreground font-body">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
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
                <div key={item.product.id.toString()} className="flex justify-between text-xs font-body text-muted-foreground">
                  <span className="truncate mr-2">{item.product.name} × {item.quantity}</span>
                  <span className="shrink-0">€{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gold/15 pt-3 flex justify-between items-center">
              <span className="font-display text-sm tracking-wide text-foreground">Subtotal</span>
              <span className="font-serif text-xl font-semibold text-gold">
                €{subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout Form */}
          {!showCheckout ? (
            <button
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
                <Label htmlFor="name" className="text-xs font-body text-muted-foreground tracking-wide uppercase">
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
                    <AlertCircle className="h-3 w-3" />{errors.name}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs font-body text-muted-foreground tracking-wide uppercase">
                  Country *
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. Germany, France"
                  className="bg-background border-gold/20 focus:border-gold/60 text-foreground placeholder:text-muted-foreground"
                />
                {errors.country && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.country}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-body text-muted-foreground tracking-wide uppercase">
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
                    <AlertCircle className="h-3 w-3" />{errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="address" className="text-xs font-body text-muted-foreground tracking-wide uppercase">
                  Delivery Address *
                </Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  rows={3}
                  className="bg-background border-gold/20 focus:border-gold/60 text-foreground placeholder:text-muted-foreground resize-none"
                />
                {errors.address && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />{errors.address}
                  </p>
                )}
              </div>

              <button
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
                  'Place Order'
                )}
              </button>

              <button
                onClick={() => setShowCheckout(false)}
                className="w-full py-2 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
