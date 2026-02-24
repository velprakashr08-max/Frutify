import {Star,ShoppingCart,Eye,Leaf,Heart,Pencil,Trash2,Flame,CheckCircle,AlertTriangle,XCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {formatPrice} from '@/lib/utils';
import {Badge} from '@/components/ui/badge';
import {categories} from '@/data/vegetables';
import {useCart} from '@/contexts/CartContext';
import {useWishlist} from '@/contexts/WishlistContext';
import {useAuth} from '@/contexts/AuthContext';
import CategoryIcon from '@/components/CategoryIcon';
import {toast} from 'sonner';
export default function ProductCard({product,onQuickView,onEdit,onDelete,compact=false}) {
  const {addItem} =useCart();
  const {toggleWishlist,isInWishlist}=useWishlist();
  const {user} =useAuth();
  const wishlisted =isInWishlist(product.id);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addItem(product.id);
    toast.success(`${product.name} added to cart!`);
  };

  if (compact) {
    return (
      <div className="group relative rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {/* Image */}
        <div className="relative overflow-hidden" style={{aspectRatio:'1'}}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Dark gradient on hover */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.organic && (
              <span className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow">
                Organic
              </span>
            )}
            {product.discount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Wishlist heart — top-right */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow transition-all duration-200 ${
              wishlisted
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`h-3 w-3 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-gray-600 font-bold text-[10px] tracking-wide px-2 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Bottom action bar — slides up on hover */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2 pb-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={() => onQuickView?.(product)}
                className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2 py-1 rounded-full shadow flex items-center gap-1 hover:bg-white transition-colors"
              >
                <Eye className="h-3 w-3" /> View
              </button>
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 transition-colors"
              >
                <ShoppingCart className="h-3 w-3" /> Add
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5 space-y-1">
          <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-1">{product.name}</p>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-sm font-bold text-green-600 shrink-0">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-[9px] text-gray-400 line-through shrink-0">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-gray-500 font-medium">{product.rating}</span>
            </div>
          </div>
        </div>        
      </div>
    );   
  }
        
  return (
    <div className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition-shadow duration-300">
      <div className="relative overflow-hidden aspect-4/3">   
        <img src={product.image} alt={product.name}   
          className="w-full h-full object-cover" />      
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