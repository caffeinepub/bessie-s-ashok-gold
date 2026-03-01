import { Link, useParams } from '@tanstack/react-router';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useGetOrders } from '@/hooks/useQueries';
import { OrderStatus } from '@/backend';
import OrderStatusTracker from '@/components/OrderStatusTracker';

export default function OrderConfirmation() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const { data: orders } = useGetOrders();

  const order = orders?.find((o) => o.id.toString() === orderId);
  const currentStatus: OrderStatus = order?.status ?? OrderStatus.pending;

  return (
    <main className="container mx-auto px-4 md:px-6 py-20">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Icon */}
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 rounded-full bg-gold/10 blur-xl scale-150" />
          <div className="relative p-5 rounded-full bg-gold/10 border border-gold/30">
            <CheckCircle2 className="h-12 w-12 text-gold" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Order <span className="gold-text">Confirmed!</span>
        </h1>
        <p className="font-serif text-lg text-foreground/60 italic mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {/* Order ID Card */}
        <div className="card-dark rounded-lg p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <h2 className="font-display text-sm tracking-widest uppercase text-foreground">
              Order Details
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-body text-muted-foreground">Order ID</span>
              <span className="font-display text-sm text-gold tracking-wider">#{orderId}</span>
            </div>
            {order && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-body text-muted-foreground">Order Total</span>
                <span className="font-serif text-base font-semibold text-gold">€{order.total.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Tracker */}
        <div className="card-dark rounded-lg p-6 mb-6 text-left">
          <h2 className="font-display text-sm tracking-widest uppercase text-foreground mb-5">
            Order Status
          </h2>
          <OrderStatusTracker currentStatus={currentStatus} />
        </div>

        {/* Info */}
        <div className="bg-gold/5 border border-gold/15 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm font-body text-foreground/70 leading-relaxed">
            We'll process your order shortly. Our team will contact you via phone to confirm delivery details and arrange secure shipping of your gold items.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold text-white font-display text-sm tracking-widest uppercase rounded hover:bg-gold-dark transition-all duration-200 shadow-gold"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-gold/40 text-gold font-display text-sm tracking-widest uppercase rounded hover:bg-gold/10 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
