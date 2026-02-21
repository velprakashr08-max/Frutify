import { useState, useEffect } from 'react';
import { Package, Calendar, Receipt, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { getOrders, saveOrder } from '../lib/storage';

export { saveOrder };

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  if (orders.length === 0) {
    return (
      <div className="py-20">
        <div className="container text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <h1 className="font-heading text-2xl font-bold">No Orders Yet</h1>
          <p className="text-muted-foreground">Start shopping to see your order history here.</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container space-y-6 max-w-3xl">
        <div>
          <h1 className="font-heading text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground">Your past purchases</p>
        </div>
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm font-medium">{order.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name} ×{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    <Package className="h-3 w-3 mr-1" /> Delivered
                  </Badge>
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}