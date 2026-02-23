import {X, Plus, Minus, Trash2, ShoppingBag, Truck} from 'lucide-react';
import {useCart} from '@/contexts/CartContext';
import {useProducts} from '@/contexts/ProductContext';
import {Button} from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle} from '@/components/ui/sheet';
import {formatPrice} from '@/lib/utils';
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import CheckoutModal from '@/components/CheckoutModal';
export default function CartSidebar() {
  const {items,removeItem,updateQty,clearCart,showCart,setShowCart}=useCart();
  const {products}=useProducts();
  const [showCheckout,setShowCheckout]=useState(false);   
  const cartProducts=items.map(ci=>{
    const product=products.find(p=>p.id===ci.productId);
    return product ? { ...ci, product } : null;
  }).filter(Boolean);
  const subtotal=cartProducts.reduce((s, ci) => s + ci.product.price * ci.quantity, 0);
  return (
    <>
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-heading flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> Shopping Cart
            </SheetTitle>
          </SheetHeader>
          {cartProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <ShoppingBag className="h-16 w-16 opacity-30" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <Button variant="outline" onClick={()=>setShowCart(false)}>Browse Products</Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {cartProducts.map(ci => (
                  <div key={ci.productId} className="flex gap-3 p-3 rounded-lg border bg-card">
                    <img src={ci.product.image} alt={ci.product.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{ci.product.name}</h4>
                      <p className="text-sm font-bold text-primary">{formatPrice(ci.product.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button variant="outline" size="icon" className="h-7 w-7"
                          onClick={()=> ci.quantity > 1 && updateQty(ci.productId, ci.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{ci.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7"
                          onClick={()=> ci.quantity < ci.product.stock && updateQty(ci.productId, ci.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={()=> removeItem(ci.productId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-bold">{formatPrice(ci.product.price * ci.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-primary font-medium bg-primary/10 rounded-md py-1.5">
                  <Truck className="h-3.5 w-3.5" /> Free shipping on all orders!
                </div>
                <Button className="w-full" onClick={()=> { setShowCart(false); setShowCheckout(true); }}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <CheckoutModal open={showCheckout} onOpenChange={setShowCheckout} cartProducts={cartProducts} subtotal={subtotal} />
    </>
  );
}  