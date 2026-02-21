import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishListContext';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const { products } = useProducts();
  const [quickView, setQuickView] = useState(null);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="py-20">
        <div className="container text-center space-y-4">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <h1 className="font-heading text-2xl font-bold">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground">Save your favorite vegetables for later!</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">{wishlistProducts.length} saved items</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map(p => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
          ))}
        </div>
      </div>
      <ProductDetailModal product={quickView} open={!!quickView} onOpenChange={v => !v && setQuickView(null)} />
    </div>
  );
}