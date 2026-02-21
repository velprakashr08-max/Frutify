import { Star, ShoppingCart, Eye, Leaf, Heart, Pencil, Trash2, Flame, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/data/vegetables';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import CategoryIcon from '@/components/CategoryIcon';
import { toast } from 'sonner';

export default function ProductCard({ product, onQuickView, onEdit, onDelete }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const wishlisted = isInWishlist(product.id);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addItem(product.id);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition-shadow duration-300">
      <div className="relative overflow-hidden aspect-4/3">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.organic && (
            <Badge className="bg-primary text-primary-foreground gap-1 shadow-lg">
              <Leaf className="h-3 w-3" /> Organic
            </Badge>
          )}
          {product.discount > 0 && (
            <Badge className="bg-accent text-accent-foreground shadow-lg">
              -{product.discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            wishlisted
              ? 'bg-accent text-accent-foreground scale-110'
              : 'bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm text-xs border-accent/30 text-accent gap-1">
            <Flame className="h-3 w-3" /> Only {product.stock} left
          </Badge>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-background font-heading font-bold text-lg px-4 py-2 rounded-full bg-foreground/30">Out of Stock</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {user?.isAdmin && onEdit && (
            <Button size="sm" variant="secondary" className="shadow-lg rounded-full h-9 w-9 p-0" onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {user?.isAdmin && onDelete && (
            <Button size="sm" variant="destructive" className="shadow-lg rounded-full h-9 w-9 p-0" onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="secondary" className="shadow-lg rounded-full h-9 w-9 p-0" onClick={() => onQuickView(product)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest flex items-center gap-1">
          <CategoryIcon name={categories.find(c => c.name === product.category)?.icon || 'leaf'} className="h-3.5 w-3.5" /> {product.category}
        </p>
        <h3 className="font-heading font-semibold text-base leading-tight line-clamp-1">{product.name}</h3>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted/50'}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <Button size="icon" className="rounded-full h-9 w-9 shadow-md" onClick={handleAdd} disabled={product.stock === 0}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}