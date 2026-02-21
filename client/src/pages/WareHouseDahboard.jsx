import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProducts } from "../contexts/ProductContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Warehouse, AlertTriangle, Package, CheckCircle, TrendingDown,
  RefreshCw, Search, Box, Apple, Leaf, Filter,
} from "lucide-react";
import { toast } from "sonner";

// ── helpers ──────────────────────────────────────────────────────────────────
const stockLevel = (stock) => {
  if (stock === 0) return { label: "Out of Stock", color: "text-destructive",  bg: "bg-destructive/10 border-destructive/20",  badge: "text-destructive border-destructive/40",  dot: "bg-destructive"  };
  if (stock <= 5)  return { label: "Critical",     color: "text-accent",       bg: "bg-accent/5 border-accent/20",             badge: "text-accent border-accent/40",            dot: "bg-accent"       };
  if (stock <= 15) return { label: "Low",          color: "text-amber-600",    bg: "bg-amber-50 border-amber-200",             badge: "text-amber-600 border-amber-300",         dot: "bg-amber-400"    };
  return            { label: "Healthy",     color: "text-emerald-600",  bg: "bg-emerald-50 border-emerald-200",         badge: "text-emerald-600 border-emerald-300",     dot: "bg-emerald-500"  };
};

// ── component ────────────────────────────────────────────────────────────────
export default function WarehouseDashboard() {
  const { user }                      = useAuth();
  const { products, updateProduct }   = useProducts();
  const [search, setSearch]           = useState("");
  const [restockMap, setRestockMap]   = useState({});
  const [typeFilter, setTypeFilter]   = useState("all");

  if (user?.role !== "warehouse") return <Navigate to="/" replace />;

  const critical = products.filter(p => p.stock === 0);
  const low      = products.filter(p => p.stock > 0 && p.stock <= 5);
  const lowish   = products.filter(p => p.stock > 5 && p.stock <= 15);
  const healthy  = products.filter(p => p.stock > 15);
  const total    = products.reduce((s, p) => s + p.stock, 0);

  const fruits   = products.filter(p => p.type === "fruit");
  const veggies  = products.filter(p => p.type === "vegetable");

  const filtered = useMemo(() => {
    let result = [...products];
    if (typeFilter !== "all") result = result.filter(p => p.type === typeFilter);
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => a.stock - b.stock); // sort by stock ascending (critical first)
    return result;
  }, [products, typeFilter, search]);

  const handleRestock = (product) => {
    const qty = Number(restockMap[product.id]) || 20;
    if (qty <= 0) { toast.error("Enter a valid quantity"); return; }
    updateProduct({ ...product, stock: product.stock + qty });
    setRestockMap(prev => ({ ...prev, [product.id]: "" }));
    toast.success(`Restocked ${product.name}`, { description: `+${qty} units added. New stock: ${product.stock + qty}` });
  };

  const stats = [
    { icon: Package,      label: "Total SKUs",    value: products.length, color: "text-primary",     bg: "bg-primary/10   border-primary/20"     },
    { icon: CheckCircle,  label: "Healthy",       value: healthy.length,  color: "text-emerald-600", bg: "bg-emerald-50   border-emerald-200"    },
    { icon: TrendingDown, label: "Low Stock",     value: low.length + lowish.length, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    { icon: AlertTriangle,label: "Out of Stock",  value: critical.length, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20"},
    { icon: Apple,        label: "Fruit SKUs",    value: fruits.length,   color: "text-orange-600",  bg: "bg-orange-50    border-orange-200"     },
    { icon: Leaf,         label: "Veggie SKUs",   value: veggies.length,  color: "text-emerald-700", bg: "bg-green-50     border-green-200"      },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container space-y-8">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shadow-sm">
            <Warehouse className="h-7 w-7 text-orange-600" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Warehouse Staff</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Monitor stock levels and restock inventory</p>
          </div>
        </div>

        {/* ── Alert Banner ─────────────────────────────────────────── */}
        {(critical.length > 0 || low.length > 0) && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm space-y-0.5">
              {critical.length > 0 && (
                <p><strong className="text-destructive">{critical.length} item(s) completely out of stock</strong></p>
              )}
              {low.length > 0 && (
                <p><strong className="text-accent">{low.length} item(s) critically low (≤5 units)</strong> — immediate restocking needed.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className={`border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${s.bg}`}>
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

        {/* ── Overview bar ─────────────────────────────────────────── */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Box className="h-4 w-4 text-muted-foreground" /> Total Inventory
              </span>
              <span className="font-bold text-lg">{total} <span className="text-muted-foreground text-sm font-normal">units</span></span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden gap-0.5 bg-muted">
              {healthy.length  > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(healthy.length / products.length) * 100}%` }} title="Healthy" />}
              {lowish.length   > 0 && <div className="bg-amber-300 transition-all"   style={{ width: `${(lowish.length  / products.length) * 100}%` }} title="Low"     />}
              {low.length      > 0 && <div className="bg-orange-500 transition-all"  style={{ width: `${(low.length     / products.length) * 100}%` }} title="Critical" />}
              {critical.length > 0 && <div className="bg-destructive transition-all" style={{ width: `${(critical.length/ products.length) * 100}%` }} title="Out"     />}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              {[
                { color: "bg-emerald-500", label: `Healthy (${healthy.length})` },
                { color: "bg-amber-300",   label: `Low (${lowish.length})`      },
                { color: "bg-orange-500",  label: `Critical (${low.length})`    },
                { color: "bg-destructive", label: `Out (${critical.length})`    },
              ].map((l, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Inventory List ───────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="font-heading flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Inventory Management
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Type filter pills */}
                {["all", "fruit", "vegetable"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      typeFilter === t
                        ? t === "fruit" ? "bg-orange-500 text-white border-orange-500" : t === "vegetable" ? "bg-emerald-600 text-white border-emerald-600" : "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {t === "fruit" && <Apple className="h-3 w-3" />}
                    {t === "vegetable" && <Leaf className="h-3 w-3" />}
                    {t === "all" && <Filter className="h-3 w-3" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 h-8 w-44 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {filtered.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-sm">No products found.</p>
            ) : (
              filtered.map(p => {
                const s = stockLevel(p.stock);
                const isFruit = p.type === "fruit";
                return (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${s.bg}`}>
                    <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate">{p.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-4 shrink-0 ${isFruit ? "border-orange-300 text-orange-600" : "border-emerald-300 text-emerald-700"}`}
                        >
                          {isFruit ? "Fruit" : "Veg"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-xs font-semibold ${s.color}`}>{p.stock} units</span>
                      <Badge variant="outline" className={`text-[10px] px-2 h-5 hidden md:inline-flex ${s.badge}`}>{s.label}</Badge>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={restockMap[p.id] || ""}
                        onChange={e => setRestockMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-16 h-8 text-xs text-center px-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs px-2 whitespace-nowrap"
                        onClick={() => handleRestock(p)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span className="hidden sm:inline">Restock</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
