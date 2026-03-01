import {useState,useEffect,useMemo} from "react";
import {Navigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {Button} from "../components/ui/Button";
import {
  Truck,CheckCircle,Clock,Package,MapPin,Phone,Star,Bike,IndianRupee,Navigation,User,Calendar,AlertCircle,ChevronRight,
} from "lucide-react";
import {formatPrice} from "../lib/utils";
import {toast} from "sonner";
function getOrders(){
  try{
    const stored =localStorage.getItem("freshveg_orders");
    return stored ? JSON.parse(stored) : [];
  } catch { return [];}
}

function saveOrders(orders) {
  localStorage.setItem("freshveg_orders", JSON.stringify(orders));
}
const STATUS_LABELS = {placed:"New Order",packed:"Ready to Pick",out_for_delivery:"Out for Delivery",delivered:"Delivered",
};

const STATUS_STYLES ={
  placed:"bg-blue-50   text-blue-700   border-blue-200",
  packed:"bg-amber-50  text-amber-700  border-amber-200",
  out_for_delivery:"bg-primary/10 text-primary  border-primary/30",
  delivered:"bg-green-50  text-green-700  border-green-200",
};

const NEXT_STATUS ={
  packed:"out_for_delivery",
  out_for_delivery:"delivered",
};

const BTN_LABEL={
  packed:"Pick Up",
  out_for_delivery:"Mark Delivered",
};

const FAKE_ADDRESSES =[
  "14, MG Road, Bengaluru  560001",
  "22, Anna Salai, Chennai  600002",
  "5, FC Road, Pune  411004",
  "88, Connaught Place, New Delhi  110001",
  "3, Park Street, Kolkata  700016",
  "12, Jubilee Hills, Hyderabad  500033",
];

const FAKE_PHONES =[
  "+91 98765 43210","+91 87654 32109","+91 76543 21098",
  "+91 91234 56789","+91 99887 65432",
];

export default function DeliveryDashboard() {
  const {user}=useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [deliveredToday, setDeliveredToday] = useState(0);
  const [earningsToday]  = useState(247);   

  useEffect(() => {
    const orders = getOrders();
    setAllOrders(orders);
    setDeliveredToday(orders.filter(o => o.status === "delivered").length);
  }, []);

  const activeOrders = useMemo(
    () => allOrders.filter(o => o.status === "packed" || o.status === "out_for_delivery"),
    [allOrders]
  );
            
  if (user?.role !== "delivery") return <Navigate to="/" replace />;

  const readyToPick = activeOrders.filter(o => o.status === "packed").length;
  const inTransit   = activeOrders.filter(o => o.status === "out_for_delivery").length;
  const handleAdvance = (orderId, currentStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;          

    const updated =allOrders.map(o=>
      o.id === orderId ?{...o,status:next}:o
    );  
    saveOrders(updated);
    setAllOrders(updated);

    if(next ==="delivered"){
      setDeliveredToday(p=>p+1);
      toast.success("Order delivered! Great job ??",{description:`Order #${orderId} marked as delivered.` });
    } else{
      toast.success("Picked up heading out!",{description: `Order #${orderId} is now out for delivery.` });
    }
  };

  const stats = [
    {label:"Ready to Pick",value:readyToPick,sub:"awaiting pick-up",alert:readyToPick >0},
    {label:"In Transit",value:inTransit,sub:"out for delivery"},
    {label:"Delivered Today",value:deliveredToday,sub:"completed"},
    {label:"Earnings Today",value:formatPrice(earningsToday),sub:"estimated"},
  ];     

  return (
    <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((k,i)=>(
              <div key={i} className={`bg-white rounded-xl border p-5 ${k.alert && k.value > 0 ? "border-amber-200" : "border-gray-100"}`}>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{k.label}</p>
                <p className={`text-2xl font-bold mt-1.5 ${k.alert && k.value > 0 ? "text-amber-600" : "text-gray-900"}`}>{k.value}</p>
                <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">Today's Performance</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                {label:"On-time Rate",value:"96%"},
                {label:"Avg Delivery",value:"18 min"},
                {label:"Rating",value:"4.9 ?"},
              ].map((m,i)=>(
                <div key={i} className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800">
                Active Assignments
            {activeOrders.length > 0 &&(
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold">
                    {activeOrders.length}
                  </span>       
                )}         
              </p>      
            </div>     
            {activeOrders.length === 0 ?(
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">No pending deliveries</p>
                <p className="text-xs text-gray-400 mt-1">All clear! New orders will appear here.</p>
              </div>
            ):(
              <div className="space-y-3">
                {activeOrders.map((order,idx)=>{
                  const isPick=order.status ==="packed";
                  const addr=FAKE_ADDRESSES[idx %FAKE_ADDRESSES.length];
                  const phone=FAKE_PHONES[idx % FAKE_PHONES.length];
                  const total=order.total ?? order.items?.reduce((s, i) => s + i.price * i.quantity,0) ??0;
                  return (
                    <div key={order.id} className={`bg-white rounded-xl border border-gray-100 border-l-2 overflow-hidden ${isPick ? "border-l-amber-400" : "border-l-emerald-500"}`}>
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm font-bold text-gray-800">{order.id}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{order.items?.length ?? 0} items � {formatPrice(total)}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isPick ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>{STATUS_LABELS[order.status || "placed"]}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 space-y-1">
                          {order.items?.map((item,i)=>(                     
                            <div key={i} className="flex justify-between text-xs text-gray-500">
                              <span className="truncate">{item.name} �{item.quantity}</span>
                              <span className="shrink-0 ml-2 font-medium text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                          <span className="flex items-start gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" /> {addr}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-gray-400" /> {phone}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" /> ~{isPick ? "5" : "12"} min {isPick ? "to store" : "to deliver"}
                          </span>
                        </div>
                        {NEXT_STATUS[order.status] && (
                          <Button
                            onClick={() => handleAdvance(order.id, order.status)}
                            className={`w-full gap-2 font-semibold rounded-lg ${
                              isPick
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {isPick ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                            {BTN_LABEL[order.status]}
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );              
                })}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">
              Complete all deliveries before 8 PM for a{" "}
              <span className="font-semibold text-gray-800">₹50 punctuality bonus</span>.
            </p>      
          </div>
    </div>                                           
  );} 