import {useState,useEffect} from 'react';
import {Package,Calendar,Receipt,ShoppingBag,CheckCircle2,Clock,ChevronDown,ChevronUp,ArrowRight,Leaf} from 'lucide-react';
import {Button} from '../components/ui/Button';
import {Link} from 'react-router-dom';
import {formatPrice} from '../lib/utils';
import {getOrders,saveOrder} from '../lib/storage';
export {saveOrder};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const o = getOrders();
    setOrders(o);         
    if (o.length > 0) setExpanded({ [o[0].id]: true });
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fdf9]">
        <div className="text-center space-y-5 px-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-green-300" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-800">No Orders Yet</h1>
            <p className="text-gray-400 mt-1 text-sm">Your order history will appear here once you shop.</p>
          </div>
          <Button asChild className="rounded-full bg-green-600 hover:bg-green-700 px-8">
            <Link to="/products">Browse Products <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fdf9] py-10">
      <div className="container max-w-3xl space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-5 w-5 text-green-600" />
              <span className="text-xs font-bold tracking-widest uppercase text-green-600">Frutify</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold text-gray-900">Order History</h1>
            <p className="text-gray-400 text-sm mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-green-100 rounded-2xl px-5 py-3 shadow-sm self-start sm:self-auto">
            <div className="text-right">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Total Spent</p>
              <p className="text-xl font-extrabold text-green-600">{formatPrice(totalSpent)}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const isOpen = !!expanded[order.id];
            const date = new Date(order.date);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
              >                <button
                  onClick={() => toggle(order.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                        {order.id}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                        <Package className="h-3 w-3" /> Delivered
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-extrabold text-gray-800">{formatPrice(order.total)}</span>
                    <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:border-green-100 group-hover:text-green-500 transition-colors">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-50 px-5 py-4 space-y-2 bg-[#fafafa]">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                              <Leaf className="h-4 w-4 text-green-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-700 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Total</span>
                      <span className="text-base font-extrabold text-green-600">{formatPrice(order.total)}</span>
                    </div>
                  </div>              
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center pt-2">
          <Button asChild variant="outline" className="rounded-full border-green-200 text-green-600 hover:bg-green-50 px-8">
            <Link to="/products">Shop Again <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
