import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProducts } from "../contexts/ProductContext";
import {
  Package, AlertTriangle, Warehouse,
  RefreshCw, Search, Apple, Leaf, Filter, LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

const stockLevel = (stock) => {
  if (stock === 0) return { label: "Out of Stock", dot: "bg-red-500",    badge: "bg-red-50 text-red-600",     border: "border-l-red-400"    };
  if (stock <= 5)  return { label: "Critical",     dot: "bg-orange-500", badge: "bg-orange-50 text-orange-600", border: "border-l-orange-400" };
  if (stock <= 15) return { label: "Low",          dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-600",  border: "border-l-amber-400"  };
  return            { label: "Healthy",     dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", border: "border-l-emerald-400" };
};

export default function WarehouseDashboard() {
  const { user }                    = useAuth();
  const { products, updateProduct } = useProducts();
  const [search, setSearch]         = useState("");
  const [restockMap, setRestockMap] = useState({});
  const [typeFilter, setTypeFilter] = useState("all");

  if (user?.role !== "warehouse") return <Navigate to="/" replace />;

  const critical = products.filter(p => p.stock === 0);
  const low      = products.filter(p => p.stock > 0 && p.stock <= 5);
  const lowish   = products.filter(p => p.stock > 5 && p.stock <= 15);
  const healthy  = products.filter(p => p.stock > 15);
  const total    = products.reduce((s, p) => s + p.stock, 0);

  const kpis = [
    { label: "Total SKUs",    value: products.length,              sub: "all products",   icon: LayoutGrid,   color: "text-blue-500",   bg: "bg-blue-50"   },
    { label: "Total Units",   value: total,                        sub: "in warehouse",   icon: Package,      color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Healthy",       value: healthy.length,               sub: "well stocked",   icon: Leaf,         color: "text-emerald-600",bg: "bg-emerald-50"},
    { label: "Low / Out",     value: critical.length + low.length, sub: "need restocking",icon: AlertTriangle,color: "text-red-500",    bg: "bg-red-50",   alert: true },
  ];

  const filtered = useMemo(() => {
    let result = [...products];
    if (typeFilter !== "all") result = result.filter(p => p.type === typeFilter);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => a.stock - b.stock);
    return result;
  }, [products, typeFilter, search]);

  const handleRestock = (product) => {
    const qty = Number(restockMap[product.id]) || 20;
    if (qty <= 0) { toast.error("Enter a valid quantity"); return; }
    updateProduct({ ...product, stock: product.stock + qty });
    setRestockMap(prev => ({ ...prev, [product.id]: "" }));
    toast.success(`Restocked ${product.name}`, { description: `+${qty} units � New total: ${product.stock + qty}` });
  };

  return (
    <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k, i) => (
              <div key={i} className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${k.alert && k.value > 0 ? "border-red-200" : "border-gray-100"}`}>
                <div className={`p-2.5 rounded-lg ${k.bg} shrink-0`}>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{k.label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${k.alert && k.value > 0 ? "text-red-600" : "text-gray-900"}`}>{k.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">Stock Distribution</p>
              <p className="text-sm font-bold text-gray-900">{total} <span className="font-normal text-gray-400 text-xs">total units</span></p>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-px bg-gray-100">
              {healthy.length  > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(healthy.length  / products.length) * 100}%` }} />}
              {lowish.length   > 0 && <div className="bg-amber-400 transition-all"   style={{ width: `${(lowish.length   / products.length) * 100}%` }} />}
              {low.length      > 0 && <div className="bg-orange-500 transition-all"  style={{ width: `${(low.length      / products.length) * 100}%` }} />}
              {critical.length > 0 && <div className="bg-red-500 transition-all"     style={{ width: `${(critical.length / products.length) * 100}%` }} />}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-gray-400">
              {[
                { dot: "bg-emerald-500", label: `Healthy (${healthy.length})`   },
                { dot: "bg-amber-400",   label: `Low (${lowish.length})`        },
                { dot: "bg-orange-500",  label: `Critical (${low.length})`      },
                { dot: "bg-red-500",     label: `Out of Stock (${critical.length})` },
              ].map((l, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${l.dot}`} /> {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Inventory table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Table header / filters */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-100 flex-wrap">
              <p className="text-sm font-semibold text-gray-800">
                Inventory <span className="font-normal text-gray-400 ml-1">({filtered.length})</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {["all", "fruit", "vegetable"].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      typeFilter === t
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-700"
                    }`}>
                    {t === "fruit"     && <Apple  className="h-3 w-3 shrink-0" />}
                    {t === "vegetable" && <Leaf   className="h-3 w-3 shrink-0" />}
                    {t === "all"       && <Filter className="h-3 w-3 shrink-0" />}
                    {t === "all" ? "All" : t === "fruit" ? "Fruits" : "Vegetables"}
                  </button>
                ))}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 w-40" />
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <p className="text-center py-12 text-sm text-gray-400">No products match your filters.</p>
              ) : (
                filtered.map(p => {
                  const s = stockLevel(p.stock);
                  return (
                    <div key={p.id} className={`flex items-center gap-3 px-5 py-3 border-l-2 hover:bg-gray-50/60 transition-colors ${s.border}`}>
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                        <span className="text-sm font-semibold text-gray-700">{p.stock} units</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden md:inline-flex ${s.badge}`}>{s.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number" min={1} placeholder="Qty"
                          value={restockMap[p.id] || ""}
                          onChange={e => setRestockMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-16 h-8 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                        />
                        <button onClick={() => handleRestock(p)}
                          className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                          <RefreshCw className="h-3 w-3 shrink-0" />
                          <span className="hidden sm:inline">Restock</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
    </div>
  );
}
