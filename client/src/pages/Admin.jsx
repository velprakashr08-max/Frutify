import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import {
  Package, IndianRupee, AlertTriangle, Plus, Pencil, Trash2, Upload, ImagePlus,
  BarChart3, TrendingUp, ShoppingCart, Users, Leaf, CheckCircle, XCircle,
  ArrowUpRight, ArrowDownRight, Box, Star, Tag, X, Apple,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { categories } from '../data/vegetables';
import CategoryIcon from '../components/CategoryIcon';
import { formatPrice } from '../lib/utils';
import { toast } from 'sonner';

const productCategories = categories.filter(c => c.type !== 'all');

const emptyProduct = {
  name: '', slug: '', category: 'Root Vegetables', type: 'vegetable',
  price: 0, originalPrice: 0, stock: 0,
  image: '', gallery: [], description: '',
  nutrition: { calories: 0, carbs: '0g', protein: '0g', fat: '0g', fiber: '0g' },
  organic: false, rating: 4.0, reviews: 0, discount: 0, tags: [], dateAdded: new Date().toISOString().slice(0, 10),
};

const COLORS = ['hsl(145, 63%, 42%)', 'hsl(204, 70%, 53%)', 'hsl(0, 79%, 58%)', 'hsl(45, 90%, 50%)', 'hsl(280, 60%, 55%)', 'hsl(170, 50%, 45%)'];

export default function Admin() {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [editProduct, setEditProduct] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Chart data (must be before early return for hooks rules)
  const categoryData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (!map[p.category]) map[p.category] = { count: 0, value: 0 };
      map[p.category].count++;
      map[p.category].value += p.price * p.stock;
    });
    return Object.entries(map).map(([name, d]) => ({ name, count: d.count, value: Math.round(d.value) }));
  }, [products]);

  const stockData = useMemo(() =>
    products.map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name, stock: p.stock, price: p.price })),
  [products]);

  const ratingData = useMemo(() =>
    products.map(p => ({ name: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name, rating: p.rating, reviews: p.reviews })),
  [products]);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= 5).length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const avgRating = products.length ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1) : '0';
  const organicCount = products.filter(p => p.organic).length;

  const openNew = () => {
    setEditProduct({ ...emptyProduct, id: Date.now() });
    setIsNew(true);
    setImagePreview('');
  };

  const openEdit = (p) => {
    setEditProduct({ ...p });
    setIsNew(false);
    setImagePreview(p.image);
  };

  const handleSave = () => {
    if (!editProduct) return;
    const p = { ...editProduct, slug: editProduct.name.toLowerCase().replace(/\s+/g, '-') };
    if (p.discount > 0) p.originalPrice = +(p.price / (1 - p.discount / 100)).toFixed(2);
    else p.originalPrice = p.price;

    if (isNew) addProduct(p);
    else updateProduct(p);
    toast.success(isNew ? 'Product added!' : 'Product updated!');
    setEditProduct(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      setEditProduct({ ...editProduct, image: base64, gallery: [base64] });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteProduct(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
    }
  };

  const stats = [
    { icon: Package, label: 'Total Products', value: products.length, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: IndianRupee, label: 'Inventory Value', value: formatPrice(totalValue), color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: AlertTriangle, label: 'Low Stock', value: lowStock, color: 'text-accent', bg: 'bg-accent/10' },
    { icon: Box, label: 'Total Stock', value: totalStock, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Star, label: 'Avg Rating', value: avgRating, color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: Leaf, label: 'Organic', value: organicCount, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Apple, label: 'Fruits', value: products.filter(p => p.type === 'fruit').length, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="py-8 bg-muted/20 min-h-screen">
      <div className="container space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <BarChart3 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage products & track analytics</p>
            </div>
          </div>
          <Button onClick={openNew} className="rounded-full shadow-md"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="rounded-full h-11 p-1 bg-muted/60 shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-full gap-1.5 data-[state=active]:shadow-md"><BarChart3 className="h-4 w-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full gap-1.5 data-[state=active]:shadow-md"><Package className="h-4 w-4" /> Products</TabsTrigger>
          </TabsList>

          {/* ─── Dashboard Tab ─── */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {stats.map((s, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <CardContent className="flex flex-col items-center gap-2.5 pt-6 pb-5 text-center">
                    <div className={`p-3 rounded-2xl ${s.bg} shadow-sm`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-sm font-semibold flex items-center gap-2"><div className="p-1.5 rounded-lg bg-primary/10"><Tag className="h-3.5 w-3.5 text-primary" /></div> Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, count }) => `${name} (${count})`}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} products`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inventory Value by Category */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-sm font-semibold flex items-center gap-2"><div className="p-1.5 rounded-lg bg-secondary/10"><IndianRupee className="h-3.5 w-3.5 text-secondary" /></div> Inventory Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [formatPrice(v), 'Value']} />
                      <Bar dataKey="value" fill="hsl(145, 63%, 42%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stock Levels */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-sm font-semibold flex items-center gap-2"><div className="p-1.5 rounded-lg bg-primary/10"><Box className="h-3.5 w-3.5 text-primary" /></div> Stock Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stockData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="stock" fill="hsl(204, 70%, 53%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ratings */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-sm font-semibold flex items-center gap-2"><div className="p-1.5 rounded-lg bg-secondary/10"><Star className="h-3.5 w-3.5 text-secondary" /></div> Product Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={ratingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rating" stroke="hsl(145, 63%, 42%)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Alerts */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-sm font-semibold flex items-center gap-2"><div className="p-1.5 rounded-lg bg-accent/10"><AlertTriangle className="h-3.5 w-3.5 text-accent" /></div> Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {products.filter(p => p.stock <= 5).length === 0 ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> All products have healthy stock levels.</p>
                ) : (
                  <div className="space-y-2">
                    {products.filter(p => p.stock <= 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border bg-accent/5">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-accent border-accent/30 gap-1">
                          <AlertTriangle className="h-3 w-3" /> {p.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Products Tab ─── */}
          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle className="font-heading flex items-center gap-2"><div className="p-1.5 rounded-lg bg-primary/10"><Package className="h-4 w-4 text-primary" /></div> Product Inventory</CardTitle>
                <Badge variant="outline" className="text-xs font-medium">{products.length} items</Badge>
              </CardHeader>
              <CardContent className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Organic</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell><img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover shadow-sm" /></TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <CategoryIcon name={categories.find(c => c.name === p.category)?.icon || 'leaf'} className="h-3 w-3" />
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(p.price)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 ${p.stock <= 5 ? 'text-accent font-medium' : ''}`}>
                            {p.stock <= 5 && <AlertTriangle className="h-3 w-3" />}
                            {p.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.organic ? <CheckCircle className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {p.rating}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      {/* Add/Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={v => !v && setEditProduct(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg flex items-center gap-2">
                <div className={`p-2 rounded-lg ${isNew ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                  {isNew ? <Plus className="h-4 w-4 text-primary" /> : <Pencil className="h-4 w-4 text-secondary" />}
                </div>
                {isNew ? 'Add New Product' : 'Edit Product'}
              </DialogTitle>
            </DialogHeader>
          </div>

          {editProduct && (
            <div className="px-6 pb-2 space-y-5">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <ImagePlus className="h-3.5 w-3.5 text-primary" /> Product Image
                </Label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/20">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <label className="cursor-pointer flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        <Upload className="h-4 w-4" /> Change Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <button
                      onClick={() => { setImagePreview(''); setEditProduct({ ...editProduct, image: '', gallery: [] }); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 backdrop-blur-sm shadow-md hover:bg-destructive hover:text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Product Name</Label>
                <Input placeholder="e.g. Organic Carrots" value={editProduct.name}
                  onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Category</Label>
                <Select value={editProduct.category} onValueChange={v => {
                  const cat = productCategories.find(c => c.name === v);
                  setEditProduct({ ...editProduct, category: v, type: cat?.type || 'vegetable' });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {productCategories.map(c => (
                      <SelectItem key={c.id} value={c.name}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon name={c.icon} className="h-4 w-4" /> {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price, Stock & Discount Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" /> Price
                  </Label>
                  <Input type="number" step="0.01" placeholder="0.00" value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Box className="h-3 w-3" /> Stock
                  </Label>
                  <Input type="number" placeholder="0" value={editProduct.stock}
                    onChange={e => setEditProduct({ ...editProduct, stock: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Discount %
                  </Label>
                  <Input type="number" max={99} placeholder="0" value={editProduct.discount}
                    onChange={e => setEditProduct({ ...editProduct, discount: +e.target.value })} />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <textarea className="flex min-h-20 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Describe your product..."
                  value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>

              {/* Organic Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Organic Product</span>
                </Label>
                <Switch checked={editProduct.organic}
                  onCheckedChange={v => setEditProduct({ ...editProduct, organic: v })} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t px-6 py-4">
            <DialogFooter>
              <Button variant="outline" className="rounded-full" onClick={() => setEditProduct(null)}>Cancel</Button>
              <Button className="rounded-full" onClick={handleSave}>
                {isNew ? <><Plus className="h-4 w-4 mr-1.5" /> Add Product</> : <><CheckCircle className="h-4 w-4 mr-1.5" /> Save Changes</>}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              Delete Product?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. The product will be permanently removed from your inventory.</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-full" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}