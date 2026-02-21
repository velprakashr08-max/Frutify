import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import {
  Store, Package, Tag, AlertTriangle, CheckCircle, Leaf, Star,
  BarChart3, TrendingUp, IndianRupee, Apple, ShoppingBag,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import CategoryIcon from "@/components/CategoryIcon";
import { categories } from "@/data/vegetables";
import { formatPrice } from "@/lib/utils";

const COLORS = [
  "hsl(145,63%,42%)", "hsl(204,70%,53%)", "hsl(280,60%,55%)",
  "hsl(45,90%,50%)",  "hsl(0,79%,58%)",   "hsl(170,50%,45%)",
  "hsl(25,90%,55%)",  "hsl(320,60%,55%)",  "hsl(160,60%,45%)",
  "hsl(240,60%,55%)",
];

export default function ManagerDashboard() {
  const { user }      = useAuth();
  const { products }  = useProducts();

  const fruits = useMemo(() => products.filter(p => p.type === "fruit"),     [products]);
  const veggies = useMemo(() => products.filter(p => p.type === "vegetable"), [products]);

  const categoryData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (!map[p.category]) map[p.category] = { count: 0, value: 0 };
      map[p.category].count++;
      map[p.category].value += p.price * p.stock;
    });
    return Object.entries(map).map(([name, d]) => ({ name, count: d.count, value: Math.round(d.value) }));
  }, [products]);

  const typeBreakdown = useMemo(() => [
    { name: "Fruits",     value: fruits.length,  fill: "hsl(25,90%,55%)"  },
    { name: "Vegetables", value: veggies.length, fill: "hsl(145,63%,42%)" },
  ], [fruits, veggies]);

  if (user?.role !== "manager") return <Navigate to="/" replace />;

  const totalValue  = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock    = products.filter(p => p.stock <= 5).length;
  const organic     = products.filter(p => p.organic).length;
  const discounted  = products.filter(p => p.discount > 0).length;
  const avgRating   = products.length
    ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1)
    : "0";

  const stats = [
    { icon: ShoppingBag,  label: "Total Products",   value: products.length,      color: "text-primary",    bg: "bg-primary/10 border-primary/20"     },
    { icon: IndianRupee,  label: "Inventory Value",  value: formatPrice(totalValue), color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
    { icon: AlertTriangle,label: "Low Stock",        value: lowStock,             color: "text-accent",     bg: "bg-accent/10 border-accent/20"       },
    { icon: Tag,          label: "On Discount",      value: discounted,           color: "text-purple-600", bg: "bg-purple-50 border-purple-200"      },
    { icon: Apple,        label: "Fruit SKUs",       value: fruits.length,        color: "text-orange-600", bg: "bg-orange-50 border-orange-200"      },
    { icon: Leaf,         label: "Vegetable SKUs",   value: veggies.length,       color: "text-emerald-600",bg: "bg-emerald-50 border-emerald-200"    },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center shadow-sm">
            <Store className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Store Manager</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Product catalog analytics &amp; inventory insights</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, i) => (
            <Card key={i} className={`border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${s.bg}`}>
              <CardContent className="flex flex-col items-center gap-2 pt-5 pb-4 text-center">
                <div className="p-2.5 rounded-xl bg-white/70 shadow-sm">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium leading-snug">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="rounded-full h-11 p-1 bg-muted/60 shadow-sm">
            <TabsTrigger value="overview"  className="rounded-full gap-1.5 data-[state=active]:shadow-md"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="products"  className="rounded-full gap-1.5 data-[state=active]:shadow-md"><Package className="h-4 w-4" /> Products</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Category distribution */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Category Value Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={categoryData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip formatter={v => [formatPrice(v), "Value"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Fruit vs Vegetable pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Tag className="h-4 w-4 text-secondary" /> Product Mix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={typeBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={4}
                        label={({ name, value }) => `${value}`}
                        labelLine={false}
                      >
                        {typeBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v, n) => [`${v} products`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Highlights row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Leaf,     label: "Organic",     value: organic,      color: "text-primary",    bg: "bg-primary/5   border-primary/20"     },
                { icon: Star,     label: "Avg Rating",  value: avgRating +" ★", color: "text-secondary",  bg: "bg-secondary/5 border-secondary/20"  },
                { icon: CheckCircle, label: "Discounted", value: discounted,  color: "text-purple-600", bg: "bg-purple-50   border-purple-200"     },
                { icon: AlertTriangle, label: "Low Stock", value: lowStock,   color: "text-accent",     bg: "bg-accent/5    border-accent/20"      },
              ].map((m, i) => (
                <Card key={i} className={`border ${m.bg}`}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <m.icon className={`h-7 w-7 ${m.color} shrink-0`} />
                    <div>
                      <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Products Tab ── */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Full Product Catalog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
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
                        <TableRow key={p.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border" />
                              <span className="font-medium text-sm">{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={p.type === "fruit" ? "border-orange-300 text-orange-600 bg-orange-50" : "border-emerald-300 text-emerald-700 bg-emerald-50"}
                            >
                              {p.type === "fruit" ? <Apple className="h-3 w-3 mr-1" /> : <Leaf className="h-3 w-3 mr-1" />}
                              {p.type === "fruit" ? "Fruit" : "Vegetable"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1 text-xs">
                              <CategoryIcon name={categories.find(c => c.name === p.category)?.icon || "leaf"} className="h-3 w-3" />
                              {p.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{formatPrice(p.price)}</TableCell>
                          <TableCell>
                            {p.discount > 0
                              ? <Badge variant="outline" className="text-accent border-accent/30">{p.discount}% off</Badge>
                              : <span className="text-muted-foreground/40 text-xs">—</span>
                            }
                          </TableCell>
                          <TableCell>
                            <span className={`flex items-center gap-1 text-sm font-medium ${p.stock <= 5 ? "text-accent" : ""}`}>
                              {p.stock <= 5 && <AlertTriangle className="h-3 w-3" />}
                              {p.stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            {p.organic
                              ? <CheckCircle className="h-4 w-4 text-primary" />
                              : <span className="text-muted-foreground/30 text-xs">—</span>
                            }
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
