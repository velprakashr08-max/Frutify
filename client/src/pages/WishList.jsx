import {useState} from 'react';
import {Heart} from 'lucide-react';
import {Button} from '../components/ui/Button';
import {Link} from 'react-router-dom';
import {useWishlist} from '../contexts/WishListContext';
import {useProducts} from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
export default function Wishlist() {
  const {wishlist} =useWishlist();
  const {products} =useProducts();
  const [quickView,setQuickView] =useState(null);
  const wishlistProducts =products.filter(p=>wishlist.includes(p.id));
  if (wishlistProducts.length ===0) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500 mt-0.5">{wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? 's' : ''}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-100 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
            {wishlistProducts.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {wishlistProducts.map(p => (
            <ProductCard key={p.id} product={p} onQuickView={setQuickView} compact />
          ))}
        </div>
      </div>
      <ProductDetailModal product={quickView} open={!!quickView} onOpenChange={v => !v && setQuickView(null)} />
    </div>
  );
}