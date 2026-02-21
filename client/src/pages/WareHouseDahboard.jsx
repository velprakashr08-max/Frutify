import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Warehouse, AlertTriangle, Package, CheckCircle, TrendingDown, RefreshCw, Search, Box } from 'lucide-react';
import { toast } from 'sonner';

export default function WarehouseDashboard() {
  const { user } = useAuth();
  const { products, updateProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [restockMap, setRestockMap] = useState({});

  if (user?.role !== 'warehouse') return <Navigate to="/" replace />;

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const critical = products.filter(p => p.stock === 0);
  const low = products.filter(p => p.stock > 0 && p.stock <= 5);
  const healthy = products.filter(p => p.stock > 5);

  const handleRestock = (product) => {
    const qty = restockMap[product.id] || 20;
    updateProduct({ ...product, stock: product.stock + qty });
    setRestockMap(prev => ({ ...prev, [product.id]: 0 }));
    toast.success(`Restocked ${product.name} by +${qty} units`);
  };

  const stockLevel = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', badge: 'text-destructive border-destructive/40' };
    if (stock <= 5) return { label: 'Critical', color: 'text-accent', bg: 'bg-accent/5 border-accent/20', badge: 'text-accent border-accent/40' };
    if (stock <= 15) return { label: 'Low', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', badge: 'text-amber-600 border-amber-300' };
    return { label: 'Healthy', color: 'text-primary', bg: 'bg-primary/5 border-primary/20', badge: 'text-primary border-primary/40' };
  };

  return (
    <div className="py-8">
      <div className="container space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <Warehouse className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Warehouse Staff</h1>
            <p className="text-muted-foreground">Monitor stock levels and restock inventory</p>
          </div>
        </div>

        {/* Alert Banner */}
        {(critical.length > 0 || low.length > 0) && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <AlertTriangle className="h-5 w-5 text-accent shrink-0" />
            <p className="text-sm">
              <strong>{critical.length} item(s) out of stock</strong> and <strong>{low.length} item(s) critically low</strong> — immediate restocking needed.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: 'Total SKUs', value: products.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: CheckCircle, label: 'Healthy Stock', value: healthy.length, color: 'text-green-600', bg: 'bg-green-100' },
            { icon: TrendingDown, label: 'Low Stock', value: low.length, color: 'text-amber-600', bg: 'bg-amber-100' },
            { icon: AlertTriangle, label: 'Out of Stock', value: critical.length, color: 'text-destructive', bg: 'bg-destructive/10' },
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

        {/* Total stock bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-1.5"><Box className="h-4 w-4 text-muted-foreground" /> Total Inventory</span>
              <span className="font-bold">{products.reduce((s, p) => s + p.stock, 0)} units</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {healthy.length > 0 && <div className="bg-primary transition-all" style={{ width: `${(healthy.length / products.length) * 100}%` }} title="Healthy" />}
              {low.length > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(low.length / products.length) * 100}%` }} title="Low" />}
              {critical.length > 0 && <div className="bg-destructive transition-all" style={{ width: `${(critical.length / products.length) * 100}%` }} title="Critical" />}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Healthy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Low</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Out of Stock</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory list */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="font-heading flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Inventory Management</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filtered.map(p => {
              const s = stockLevel(p.stock);
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border ${s.bg}`}>
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs shrink-0 ${s.badge}`}>
                    {p.stock === 0 ? <AlertTriangle className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                    {p.stock} units · {s.label}
                  </Badge>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={restockMap[p.id] || ''}
                      onChange={e => setRestockMap(prev => ({ ...prev, [p.id]: +e.target.value }))}
                      className="w-16 h-8 text-xs text-center"
                    />
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleRestock(p)}>
                      <RefreshCw className="h-3 w-3" /> Restock
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}