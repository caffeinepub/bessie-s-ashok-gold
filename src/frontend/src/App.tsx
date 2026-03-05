import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/hooks/useCart";
import { CurrencyProvider } from "@/hooks/useCurrency";
import Admin from "@/pages/Admin";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import OrderConfirmation from "@/pages/OrderConfirmation";
import ProductDetail from "@/pages/ProductDetail";
import Shop from "@/pages/Shop";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Layout component with Navigation and Footer
function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: Shop,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: ProductDetail,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: Cart,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-confirmation/$orderId",
  component: OrderConfirmation,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: Contact,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopRoute,
  productDetailRoute,
  cartRoute,
  orderConfirmationRoute,
  adminRoute,
  contactRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CartProvider>
    </CurrencyProvider>
  );
}
