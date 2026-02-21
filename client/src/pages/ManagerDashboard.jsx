import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Store, Package, Tag, AlertTriangle, CheckCircle, Leaf, Star, BarChart3, TrendingUp, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CategoryIcon from '@/components/CategoryIcon';
import { categories } from '@/data/vegetables';
import { formatPrice } from '@/lib/utils';

const COLORS = ['hsl(145,63%,42%)', 'hsl(204,70%,53%)', 'hsl(280,60%,55%)', 'hsl(45,90%,50%)', 'hsl(0,79%,58%)', 'hsl(170,50%,45%)'];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { products } = useProducts();

  const categoryData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (!map[p.category]) map[p.category] = { count: 0, value: 0 };
      map[p.category].count++;
      map[p.category].value += p.price * p.stock;
    });
    return Object.entries(map).map(([name, d]) => ({ name, count: d.count, value: Math.round(d.value) }));
  }, [products]);

  if (user?.role !== 'manager') return <Navigate to="/" replace />;

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= 5).length;
  const organic = products.filter(p => p.organic).length;
  const discounted = products.filter(p => p.discount > 0).length;

  return (
    <div className="py-8">
      <div className="container space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Store className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Store Manager</h1>
            <p className="text-muted-foreground">Product catalog & store analytics</p>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, label: 'Total Products', value: products.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: IndianRupee, label: 'Inventory Value', value: formatPrice(totalValue), color: 'text-secondary', bg: 'bg-secondary/10' },
            { icon: AlertTriangle, label: 'Low Stock', value: lowStock, color: 'text-accent', bg: 'bg-accent/10' },
            { icon: Tag, label: 'On Discount', value: discounted, color: 'text-purple-600', bg: 'bg-purple-100' },
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="rounded-full h-10">
            <TabsTrigger value="overview" className="rounded-full gap-1.5"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full gap-1.5"><Package className="h-4 w-4" /> Products</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, count }) => `${name} (${count})`}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} products`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading flex items-center gap-2"><TrendingUp className="h-4 w-4 text-secondary" /> Value by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [formatPrice(v), 'Value']} />
                      <Bar dataKey="value" fill="hsl(145,63%,42%)" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <Leaf className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">{organic}</p>
                    <p className="text-sm text-muted-foreground">Organic Products</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-secondary/20 bg-secondary/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <Star className="h-8 w-8 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold text-secondary">
                      {products.length ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1) : '0'}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Product Rating</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Product Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Organic</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-medium text-sm">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <CategoryIcon name={categories.find(c => c.name === p.category)?.icon || 'leaf'} className="h-3 w-3" />
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(p.price)}</TableCell>
                        <TableCell>
                          {p.discount > 0
                            ? <Badge variant="outline" className="text-accent border-accent/30">{p.discount}% off</Badge>
                            : <span className="text-muted-foreground text-xs">—</span>
                          }
                        </TableCell>
                        <TableCell>
                          <span className={p.stock <= 5 ? 'text-accent font-medium flex items-center gap-1' : ''}>
                            {p.stock <= 5 && <AlertTriangle className="h-3 w-3" />} {p.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.organic ? <CheckCircle className="h-4 w-4 text-primary" /> : <span className="text-muted-foreground/30">—</span>}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {p.rating}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}