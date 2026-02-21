import { Toaster } from "./components/ui/Toaster";
import { Toaster as Sonner } from "./components/ui/Sonner";
import { TooltipProvider } from "./components/ui/Tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";
import { WishlistProvider } from "./contexts/WishListContext";   
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Products from "./pages/Products";          
import Admin from "./pages/Admin";     
import Wishlist from "./pages/Wishlist";  
import OrderHistory from "./pages/OrderHistory";  
import DeliveryDashboard from "./pages/DeliveryDashboard";       
import ManagerDashboard from "./pages/ManagerDashboard";  
import WarehouseDashboard from "./pages/WareHouseDahboard";      
import Chatbot from "./components/Chatbot";    
import NotFound from "./pages/NotFound";
     
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
                <Routes>   
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />   
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/wishlist" element={<Wishlist />} />   
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/delivery" element={<DeliveryDashboard />} />   
                  <Route path="/manager" element={<ManagerDashboard />} />
                  <Route path="/warehouse" element={<WarehouseDashboard />} />   
                  <Route path="*" element={<NotFound />} />
                </Routes>
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