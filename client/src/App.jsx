import { Suspense, lazy } from 'react';
import { Toaster } from "./components/ui/Toaster";
import { Toaster as Sonner } from "./components/ui/Sonner";
import { TooltipProvider } from "./components/ui/Tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";
import { WishlistProvider } from "./contexts/WishListContext";
import Layout from "./components/Layout";
import Chatbot from "./components/Chatbot";

// ── Lazy-loaded pages (code splitting) ─────────────────────────────────────
const Index              = lazy(() => import("./pages/Index"));
const Products           = lazy(() => import("./pages/Products"));
const Admin              = lazy(() => import("./pages/Admin"));
const Wishlist           = lazy(() => import("./pages/Wishlist"));
const OrderHistory       = lazy(() => import("./pages/OrderHistory"));
const DeliveryDashboard  = lazy(() => import("./pages/DeliveryDashboard"));
const ManagerDashboard   = lazy(() => import("./pages/ManagerDashboard"));
const WarehouseDashboard = lazy(() => import("./pages/WareHouseDahboard"));
const NotFound           = lazy(() => import("./pages/NotFound"));

// Simple spinner fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

     
const App = () => (
  <TooltipProvider>
    <ProductProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/"          element={<Index />} />
                    <Route path="/products"  element={<Products />} />
                    <Route path="/admin"     element={<Admin />} />
                    <Route path="/wishlist"  element={<Wishlist />} />
                    <Route path="/orders"    element={<OrderHistory />} />
                    <Route path="/delivery"  element={<DeliveryDashboard />} />
                    <Route path="/manager"   element={<ManagerDashboard />} />
                    <Route path="/warehouse" element={<WarehouseDashboard />} />
                    <Route path="*"          element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
              <Chatbot />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ProductProvider>
  </TooltipProvider>
);

export default App;