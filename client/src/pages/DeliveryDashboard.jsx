import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Truck, CheckCircle, Clock, Package, MapPin, Phone, Star, TrendingUp, Bike } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { toast } from 'sonner';

function getOrders() {
  const stored = localStorage.getItem('freshveg_orders');
  return stored ? JSON.parse(stored) : [];
}

const STATUS_LABELS = {
  placed: 'New Order',
  packed: 'Ready to Pick',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const STATUS_BADGE = {
  placed: 'bg-secondary/10 text-secondary border-secondary/30',
  packed: 'bg-amber-100 text-amber-700 border-amber-300',
  out_for_delivery: 'bg-primary/10 text-primary border-primary/30',
  delivered: 'bg-green-100 text-green-700 border-green-300',
};

const NEXT_STATUS = {
  packed: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const FAKE_ADDRESSES = [
  '14, MG Road, Bengaluru', '22, Anna Salai, Chennai', '5, FC Road, Pune',
  '88, Connaught Place, Delhi', '3, Park Street, Kolkata',
];

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const all = getOrders();
    // Delivery agents see orders that are packed or out-for-delivery
    setOrders(all.filter(o => o.status === 'packed' || o.status === 'out_for_delivery'));
  }, []);

  if (user?.role !== 'delivery') return <Navigate to="/" replace />;

  const handleAdvance = (orderId, status) => {
    const next = NEXT_STATUS[status];
    if (!next) return;
    updateOrderStatus(orderId, next);
    setOrders(prev =>
      next === 'delivered'
        ? prev.filter(o => o.id !== orderId)
        : prev.map(o => o.id === orderId ? { ...o, status: next } : o)
    );
    toast.success(next === 'delivered' ? 'Order delivered!' : 'Order picked up, heading out!');
  };

  const delivered = orders.filter(o => o.status === 'delivered').length;
  const inTransit = orders.filter(o => o.status === 'out_for_delivery').length;
  const readyToPick = orders.filter(o => o.status === 'packed').length;

  return (
    <div className="py-8">
      <div className="container space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bike className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Delivery Dashboard</h1>
            <p className="text-muted-foreground">Manage your delivery assignments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: 'Ready to Pick', value: readyToPick, color: 'text-amber-600', bg: 'bg-amber-100' },
            { icon: Truck, label: 'In Transit', value: inTransit, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: CheckCircle, label: 'Delivered Today', value: delivered, color: 'text-green-600', bg: 'bg-green-100' },
            { icon: Star, label: 'Rating', value: '4.9 ★', color: 'text-secondary', bg: 'bg-secondary/10' },
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center gap-2 pt-5 pb-4 text-center">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active orders */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <CheckCircle className="h-12 w-12 mx-auto text-primary/40" />
              <p className="font-heading text-lg font-semibold">All clear!</p>
              <p className="text-sm text-muted-foreground">No pending deliveries right now.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">Active Assignments</h2>
            {orders.map((order, idx) => (
              <Card key={order.id} className={`border-2 ${order.status === 'out_for_delivery' ? 'border-primary/20' : 'border-amber-200'}`}>
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-mono text-sm font-medium">{order.id}</span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {FAKE_ADDRESSES[idx % FAKE_ADDRESSES.length]}
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_BADGE[order.status || 'placed']}>
                      {STATUS_LABELS[order.status || 'placed']}
                    </Badge>
                  </div>

                  <div className="text-sm space-y-0.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span>{item.name} ×{item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>~10 min delivery</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>+91 98765 43210</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                      {NEXT_STATUS[order.status || 'placed'] && (
                        <Button size="sm" className="rounded-full" onClick={() => handleAdvance(order.id, order.status || 'placed')}>
                          {order.status === 'packed' ? <><Truck className="h-3.5 w-3.5 mr-1" /> Pick Up</> : <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Delivered</>}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Earnings card */}
        <Card className="border-none bg-primary text-primary-foreground">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm opacity-80">Today's Earnings</p>
              <p className="text-3xl font-bold">{formatPrice(Math.floor(Math.random() * 400) + 100)}</p>
            </div>
            <TrendingUp className="h-10 w-10 opacity-30" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}