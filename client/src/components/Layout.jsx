import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Leaf, Heart, Clock, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoginModal from '@/components/LoginModal';
import CartSidebar from '@/components/CartSidebar';
import PageTransition from '@/components/PageTransition';

export default function Layout({ children }) {
  const { user, logout, showLogin, setShowLogin } = useAuth();
  const { totalItems, setShowCart } = useCart();
  const { wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/orders', label: 'Orders' },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-xl shadow-md border-b'
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
      }`}>
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary transition-transform duration-300 hover:scale-105">
            <Leaf className="h-7 w-7" /> FreshVeg
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === l.to
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowCart(true)}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Auth */}
            {user ? (
              <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l">
                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full ring-2 ring-primary/20" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-0.5">
                    {user.isAdmin ? <><Crown className="h-3 w-3" /> Admin</> : <><ShoppingCart className="h-3 w-3" /> Customer</>}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}><LogOut className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button size="sm" className="hidden md:inline-flex ml-2 rounded-full" onClick={() => setShowLogin(true)}>
                <User className="h-4 w-4 mr-1" /> Login
              </Button>
            )}

            {/* Mobile toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              <div className="relative w-5 h-5">
                <Menu className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                <X className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
          mobileOpen ? 'max-h-96 border-t' : 'max-h-0'
        }`}>
          <nav className="container py-4 flex flex-col gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium py-2.5 px-3 rounded-lg transition-all ${
                  location.pathname === l.to
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted'
                }`}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-3 pt-3 mt-2 border-t">
                <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full ring-2 ring-primary/20" />
                <div className="flex-1">
                  <span className="text-sm font-medium block">{user.name}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">{user.isAdmin ? <><Crown className="h-3 w-3" /> Admin</> : <><ShoppingCart className="h-3 w-3" /> Customer</>}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <Button size="sm" className="mt-2" onClick={() => setShowLogin(true)}>
                <User className="h-4 w-4 mr-1" /> Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <CartSidebar />
    </div>
  );
}