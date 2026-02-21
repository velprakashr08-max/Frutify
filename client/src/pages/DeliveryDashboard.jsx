import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  Truck, CheckCircle, Clock, Package, MapPin, Phone,
  Star, Bike, IndianRupee, Navigation, User, Calendar,
  TrendingUp, AlertCircle, ChevronRight,
} from "lucide-react";
import { formatPrice } from "../lib/utils";
import { toast } from "sonner";

// ── helpers ─────────────────────────────────────────────────────────────────
function getOrders() {
  try {
    const stored = localStorage.getItem("freshveg_orders");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem("freshveg_orders", JSON.stringify(orders));
}

// ── constants ────────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  placed:           "New Order",
  packed:           "Ready to Pick",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
};

const STATUS_STYLES = {
  placed:           "bg-blue-50   text-blue-700   border-blue-200",
  packed:           "bg-amber-50  text-amber-700  border-amber-200",
  out_for_delivery: "bg-primary/10 text-primary  border-primary/30",
  delivered:        "bg-green-50  text-green-700  border-green-200",
};

const NEXT_STATUS = {
  packed:           "out_for_delivery",
  out_for_delivery: "delivered",
};

const BTN_LABEL = {
  packed:           "Pick Up",
  out_for_delivery: "Mark Delivered",
};

const FAKE_ADDRESSES = [
  "14, MG Road, Bengaluru – 560001",
  "22, Anna Salai, Chennai – 600002",
  "5, FC Road, Pune – 411004",
  "88, Connaught Place, New Delhi – 110001",
  "3, Park Street, Kolkata – 700016",
  "12, Jubilee Hills, Hyderabad – 500033",
];

const FAKE_PHONES = [
  "+91 98765 43210", "+91 87654 32109", "+91 76543 21098",
  "+91 91234 56789", "+91 99887 65432",
];

// ── component ────────────────────────────────────────────────────────────────
export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [deliveredToday, setDeliveredToday] = useState(0);
  const [earningsToday]  = useState(247);   // fixed value for demo

  useEffect(() => {
    const orders = getOrders();
    setAllOrders(orders);
    setDeliveredToday(orders.filter(o => o.status === "delivered").length);
  }, []);

  if (user?.role !== "delivery") return <Navigate to="/" replace />;

  // Orders visible to delivery agent
  const activeOrders = useMemo(
    () => allOrders.filter(o => o.status === "packed" || o.status === "out_for_delivery"),
    [allOrders]
  );

  const readyToPick = activeOrders.filter(o => o.status === "packed").length;
  const inTransit   = activeOrders.filter(o => o.status === "out_for_delivery").length;

  // ── advance order status ──────────────────────────────────────────────────
  const handleAdvance = (orderId, currentStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;

    const updated = allOrders.map(o =>
      o.id === orderId ? { ...o, status: next } : o
    );

    saveOrders(updated);
    setAllOrders(updated);

    if (next === "delivered") {
      setDeliveredToday(p => p + 1);
      toast.success("Order delivered! Great job 🎉", { description: `Order #${orderId} marked as delivered.` });
    } else {
      toast.success("Picked up — heading out!", { description: `Order #${orderId} is now out for delivery.` });
    }
  };

  // ── stats ─────────────────────────────────────────────────────────────────
  const stats = [
    { icon: Package,      label: "Ready to Pick",  value: readyToPick,    color: "text-amber-600",   bg: "bg-amber-50   border-amber-200"   },
    { icon: Truck,        label: "In Transit",     value: inTransit,      color: "text-primary",     bg: "bg-primary/10 border-primary/20"  },
    { icon: CheckCircle,  label: "Delivered Today",value: deliveredToday, color: "text-green-600",   bg: "bg-green-50   border-green-200"   },
    { icon: IndianRupee,  label: "Earnings Today", value: formatPrice(earningsToday), color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container space-y-8">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shadow-sm">
              <Bike className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">Delivery Dashboard</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5" />
                {user.name} &bull;
                <Calendar className="h-3.5 w-3.5 ml-1" />
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-sm px-3 py-1 gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
            Online
          </Badge>
        </div>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className={`border shadow-sm hover:shadow-md transition-shadow ${s.bg}`}>
              <CardContent className="flex flex-col items-center gap-2 pt-5 pb-4 text-center">
                <div className="p-2.5 rounded-xl bg-white/70 shadow-sm">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Performance Bar ──────────────────────────────────────── */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Daily Performance</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.9 Rating
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "On-time Rate",  value: "96%",  color: "text-green-600" },
                { label: "Total Today",   value: `${deliveredToday + inTransit + readyToPick}`,  color: "text-primary" },
                { label: "Avg Time",      value: "18 min", color: "text-secondary" },
              ].map((m, i) => (
                <div key={i} className="rounded-xl bg-muted/50 p-3">
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Active Assignments ───────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Active Assignments
            {activeOrders.length > 0 && (
              <Badge className="ml-1">{activeOrders.length}</Badge>
            )}
          </h2>

          {activeOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center space-y-3">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500/40" />
                <p className="font-heading text-lg font-semibold">All clear!</p>
                <p className="text-sm text-muted-foreground">No deliveries pending right now. Great work!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order, idx) => {
                const style  = STATUS_STYLES[order.status || "placed"];
                const isPick = order.status === "packed";
                const addr   = FAKE_ADDRESSES[idx % FAKE_ADDRESSES.length];
                const phone  = FAKE_PHONES[idx % FAKE_PHONES.length];
                const total  = order.total ?? order.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;

                return (
                  <Card
                    key={order.id}
                    className={`border-l-4 shadow-sm hover:shadow-md transition-all ${
                      isPick ? "border-l-amber-400" : "border-l-primary"
                    }`}
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Row 1: ID + status */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-mono text-sm font-bold tracking-wide text-foreground">
                            {order.id}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""} &bull; {formatPrice(total)}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-1 ${style}`}>
                          {STATUS_LABELS[order.status || "placed"]}
                        </Badge>
                      </div>

                      {/* Row 2: Items */}
                      <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-muted-foreground">
                            <span className="truncate">{item.name} ×{item.quantity}</span>
                            <span className="shrink-0 ml-2 font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Row 3: Address + phone */}
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground flex-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                          <span>{addr}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span>{phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>~{isPick ? "5" : "12"} min {isPick ? "to store" : "delivery"}</span>
                        </div>
                      </div>

                      {/* Row 4: CTA */}
                      {NEXT_STATUS[order.status] && (
                        <Button
                          onClick={() => handleAdvance(order.id, order.status)}
                          className={`w-full gap-2 font-semibold ${
                            isPick
                              ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                              : "bg-primary hover:bg-primary/90"
                          }`}
                        >
                          {isPick ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                          {BTN_LABEL[order.status]}
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Tip Banner ───────────────────────────────────────────── */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Complete all your assigned deliveries before 8 PM for a <span className="font-semibold text-primary">₹50 punctuality bonus</span>.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
