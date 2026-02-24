import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Star, ShoppingCart, Plus, Minus, Leaf, Heart, Send, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductContext';
import { useWishlist } from '@/contexts/WishlistContext';   
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailModal({ product, open, onOpenChange }) {
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const { addItem } = useCart();
  const { reviews, products, addReview } = useProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();  
  const { user } = useAuth();

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);
  const productReviews = reviews.filter(r => r.productId === product.id);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    addItem(product.id, qty);
    toast.success(`${qty}× ${product.name} added to cart!`);
    setQty(1);
    onOpenChange(false);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review'); return; }
    if (!reviewTitle.trim() || !reviewComment.trim()) return;
    addReview({
      id: Date.now(),
      productId: product.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating: reviewRating,
      date: new Date().toISOString().slice(0, 10),
      title: reviewTitle,
      comment: reviewComment,
      helpful: 0,
    });
    toast.success('Review submitted!');
    setReviewTitle('');
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-4 sm:p-6 space-y-3 bg-muted/30">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted shadow-inner">
              <img src={product.gallery[selectedImage] || product.image} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
            {product.gallery.length > 1 && (
              <div className="flex gap-2">
                {product.gallery.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      i === selectedImage ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">{product.category}</p>
              <h2 className="font-heading text-2xl font-bold">{product.name}</h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {product.organic && (
                <Badge className="bg-primary text-primary-foreground gap-1"><Leaf className="h-3 w-3" /> Organic</Badge>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted/50'}`} />
                ))}
                <span className="text-sm text-muted-foreground ml-1">{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {product.discount > 0 && <Badge className="bg-accent text-accent-foreground">-{product.discount}%</Badge>}
            </div>

            <div className="text-sm">
              {product.stock > 5 ? (
                <span className="text-primary font-medium flex items-center gap-1"><CheckCircle className="h-4 w-4" /> In Stock ({product.stock} available)</span>
              ) : product.stock > 0 ? (
                <span className="text-accent font-medium flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Only {product.stock} left</span>
              ) : (
                <span className="text-destructive font-medium flex items-center gap-1"><XCircle className="h-4 w-4" /> Out of Stock</span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border rounded-full overflow-hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => qty > 1 && setQty(qty - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => qty < product.stock && setQty(qty + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="flex-1 rounded-full" onClick={handleAdd} disabled={product.stock === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
              <Button
                variant={wishlisted ? 'default' : 'outline'}
                size="icon"
                className={`rounded-full shrink-0 ${wishlisted ? 'bg-accent hover:bg-accent/90' : ''}`}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <Tabs defaultValue="description" className="pt-4">
              <TabsList className="w-full rounded-full h-10">
                <TabsTrigger value="description" className="flex-1 rounded-full text-xs">Description</TabsTrigger>
                <TabsTrigger value="nutrition" className="flex-1 rounded-full text-xs">Nutrition</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 rounded-full text-xs">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-3 pt-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs rounded-full">#{tag}</Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="pt-3">
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.nutrition).map(([key, val]) => (
                        <tr key={key} className="border-b last:border-0">
                          <td className="py-2.5 px-3 font-medium capitalize bg-muted/50">{key}</td>
                          <td className="py-2.5 px-3">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 pt-3">
                {user && (
                  <form onSubmit={handleSubmitReview} className="space-y-2 p-3 rounded-xl border bg-muted/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Write a Review</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} type="button" onClick={() => setReviewRating(i + 1)}>
                          <Star className={`h-5 w-5 transition-colors ${i < reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted/50'}`} />
                        </button>
                      ))}
                    </div>
                    <Input placeholder="Review title" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} className="rounded-lg" />
                    <textarea
                      placeholder="Share your experience..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="flex min-h-15 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button size="sm" type="submit" className="rounded-full" disabled={!reviewTitle.trim() || !reviewComment.trim()}>
                      <Send className="h-3 w-3 mr-1" /> Submit
                    </Button>
                  </form>
                )}
                {productReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
                ) : (
                  productReviews.map(r => (
                    <div key={r.id} className="border rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 shrink-0">
                          <img src={r.userAvatar} alt={r.userName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.userName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted/50'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <h4 className="text-sm font-semibold">{r.title}</h4>
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}    