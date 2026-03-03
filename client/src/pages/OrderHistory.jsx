import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, Calendar,
  ClipboardList, Package, Truck, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { getOrders, saveOrder } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
export { saveOrder };

const STATUS_STEPS = [
  { key: 'placed',   label: 'Placed', Icon: ClipboardList},
  { key: 'packed',   label: 'Packed', Icon: Package },     
  { key: 'shipping', label: 'Shipping', Icon: Truck},   
  { key: 'delivered',label: 'Delivered',Icon: CheckCircle2}, 
];    
                                  
const STATUS_INDEX = { placed: 0, packed: 1, shipping: 2, delivered: 3 };  
           
function OrderTracker({ status = 'delivered' }) {
  const activeIdx = STATUS_INDEX[status.toLowerCase()] ?? 3;    
  return (       
    <div className="flex items-center w-full mt-4 px-1">
      {STATUS_STEPS.map(({ key, label, Icon }, i) => {      
        const done = i <= activeIdx;    
        return (              
          <div key={key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  done ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />      
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap ${
                  done ? 'text-amber-500' : 'text-gray-400'
                }`}    
              >  
                {label}  
              </span>     
            </div>
            {i < STATUS_STEPS.length - 1 && (    
              <div
                className={`flex-1 h-[3px] mx-1 mb-5 rounded-full transition-colors ${
                  i < activeIdx ? 'bg-amber-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const allOrders = getOrders();
    // Filter orders by current user
    const userOrders = user ? allOrders.filter(order => order.userId === user.name) : [];
    setOrders(userOrders);
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="text-center space-y-5 px-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">No Orders Yet</h1>
            <p className="text-gray-400 mt-1 text-sm">Your order history will appear here once you shop.</p>
          </div>
          <Button asChild className="rounded-full bg-amber-500 hover:bg-amber-600 px-8">
            <Link to="/products">Browse Products <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="w-full max-w-xl mx-auto space-y-4 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {orders.map((order) => {
          const date = new Date(order.date);
          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          const status = order.status || 'delivered';

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 font-mono">{order.id}</span>
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
              </div>

              {/* Items */}
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">
                    {item.name} <span className="text-gray-500">×{item.quantity}</span>
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                <span className="text-base font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>

              {/* Progress tracker */}
              <OrderTracker status={status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
