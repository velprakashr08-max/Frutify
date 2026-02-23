import {useState,useMemo}from'react';
import {Navigate,useSearchParams}from'react-router-dom';
import {useAuth}from'../contexts/AuthContext';
import {useProducts}from'../contexts/ProductContext';
import {Button}from'../components/ui/Button';
import {Input}from'../components/ui/Input';
import {Label}from'../components/ui/Label';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue}from'../components/ui/Select';
import {Switch}from'../components/ui/Switch';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow}from'../components/ui/Table';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter}from'../components/ui/Dialog';
import {Package,AlertTriangle,Plus,Pencil,Trash2,Upload,BarChart3,Leaf,CheckCircle,XCircle,Star,X,Apple,ShieldAlert,Search}from'lucide-react';
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,AreaChart,Area,}from'recharts';
import {categories}from'../data/vegetables';
import CategoryIcon from'../components/CategoryIcon';
import {formatPrice} from'../lib/utils';
import {toast}from'sonner';
import {TrendingDown,Layers}from'lucide-react';
const productCategories=categories.filter(c =>c.type!=='all');
const emptyProduct ={name:'',slug:'',category:'Root Vegetables',type:'vegetable',
  price:0,originalPrice:0,stock:0,
  image:'',gallery:[],description:'',
  nutrition:{calories:0,carbs:'0g',protein:'0g',fat:'0g',fiber:'0g'},
  organic:false,rating:4.0,reviews:0,discount:0,tags:[],dateAdded:new Date().toISOString().slice(0,10),
};
export default function Admin() {
  const {user}=useAuth();
  const {products,addProduct,updateProduct,deleteProduct}=useProducts();
  const [searchParams,setSearchParams]=useSearchParams();
  const activeTab=searchParams.get('tab')||'overview';
  const [editProduct,setEditProduct]=useState(null);
  const [isNew,setIsNew]=useState(false);
  const [deleteId,setDeleteId]=useState(null);
  const [imagePreview,setImagePreview]=useState('');
  const [search,setSearch]=useState('');
  const categoryData = useMemo(()=>{
    const map={};
    products.forEach(p=>{
      if (!map[p.category])map[p.category]={count:0,value:0};
      map[p.category].count++;
      map[p.category].value +=p.price*p.stock;
    });
    return Object.entries(map)
      .map(([name,d])=>({name:name.length > 14 ?name.slice(0,13) +'...':name,count:d.count,value:Math.round(d.value)}))
      .sort((a,b)=>b.value-a.value);
  },[products]);

  const stockTrend=useMemo(()=>
    [...products]
      .sort((a,b) =>a.stock -b.stock)
      .slice(0,12)
      .map(p=>({name:p.name.length >10 ?p.name.slice(0,9) +'...':p.name,stock:p.stock})),
  [products]);

  if (!user?.isAdmin) return <Navigate to="/" replace />;
  const totalValue=products.reduce((s,p) => s + p.price*p.stock,0);
  const lowStock=products.filter(p => p.stock <=5);
  const totalStock=products.reduce((s,p) => s + p.stock,0);
  const avgRating =products.length ? (products.reduce((s,p) => s + p.rating, 0)/products.length).toFixed(1) :'0';
  const organicCount=products.filter(p =>p.organic).length;

  const kpis = [
    { label:'Total SKUs',value:products.length,sub:`${organicCount} organic`,icon:Layers,color:'text-blue-500',bg:'bg-blue-50'    },
    { label:'Inventory Value',value:formatPrice(totalValue),sub:`${totalStock} units total`,icon:BarChart3,color:'text-green-600',bg:'bg-green-50'},
    { label:'Avg Rating',value:`${avgRating} ★`,sub:'across all products',icon:Star,color:'text-amber-500',bg:'bg-amber-50'},
    { label:'Low/Out',value:lowStock.length,sub:'need restocking',icon:TrendingDown,color:'text-red-500',bg:'bg-red-50',alert:true},
  ];
const openNew=()=>{setEditProduct({...emptyProduct,id:Date.now() });setIsNew(true);setImagePreview('');};
const openEdit=(p)=>{setEditProduct({...p});setIsNew(false);setImagePreview(p.image);};
const handleSave =()=>{
if(!editProduct) return;
  const p={...editProduct,slug:editProduct.name.toLowerCase().replace(/\s+/g, '-')};
    if(p.discount>0)p.originalPrice=+(p.price/(1-p.discount/100)).toFixed(2);
    else p.originalPrice=p.price;
    if(isNew)addProduct(p);else updateProduct(p);
    toast.success(isNew ?'Product added!':'Product updated!');
    setEditProduct(null);
  };
  const handleImageUpload =(e)=>{
    const file=e.target.files?.[0];
    if (!file||!editProduct) return;
    const reader=new FileReader();
    reader.onload=()=>{
      setImagePreview(reader.result);
      setEditProduct({...editProduct,image:reader.result,gallery:[reader.result]});};
    reader.readAsDataURL(file)};
const handleDelete =()=>{if (deleteId!==null){deleteProduct(deleteId); 
  toast.success('Product deleted'); setDeleteId(null);}
  };

  const filteredProducts=useMemo(()=>
    products.filter(p=>
      p.name.toLowerCase().includes(search.toLowerCase())||
      p.category.toLowerCase().includes(search.toLowerCase())
    ),
  [products,search]);
  return (
    <>
    <div className="p-6 space-y-6">
    {activeTab === 'overview' && (
    <>
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k,i)=>(
      <div key={i} className={`bg-white rounded-xl border p-5 flex items-start gap-4 ${k.alert && k.value > 0 ? 'border-red-200' : 'border-gray-100'}`}>
      <div className={`p-2.5 rounded-lg ${k.bg} shrink-0`}>
      <k.icon className={`h-4 w-4 ${k.color}`} />
      </div>
      <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{k.label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${k.alert && k.value > 0 ? 'text-red-600' : 'text-gray-900'}`}>{k.value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
      </div>
      </div>
      ))}
      </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="bg-white rounded-xl border border-gray-100 p-5">
    <p className="text-sm font-semibold text-gray-800 mb-4">Inventory Value by Category</p>
     <ResponsiveContainer width="100%" height={220}>
     <BarChart data={categoryData} margin={{ left: -10, bottom: 30 }}>
     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
     <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" interval={0} />
     <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `Rs.${(v / 1000).toFixed(0)}k`} />
     <Tooltip contentStyle={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 8, fontSize: 12 }}
      formatter={v => [formatPrice(v), 'Value']} />
      <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
      </BarChart>
      </ResponsiveContainer>
  </div>
 <div className="bg-white rounded-xl border border-gray-100 p-5">
  <p className="text-sm font-semibold text-gray-800 mb-4">Lowest Stock Products</p>
  <ResponsiveContainer width="100%" height={220}>
  <AreaChart data={stockTrend} margin={{ left: -10, bottom: 30 }}>
  <defs>
  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="stock" stroke="#16a34a" strokeWidth={2} fill="url(#stockGrad)" dot={{ r: 3, fill: '#16a34a' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-800">Category Breakdown</p>
                  <span className="text-xs text-gray-400">{categoryData.length} categories</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">SKUs</th>
                      <th className="px-5 py-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categoryData.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-500">{c.name}</td>
                        <td className="px-5 py-3 text-right text-gray-500">{c.count}</td>
                        <td className="px-5 py-3 text-right font-semibold text-gray-800">{formatPrice(c.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  Product Inventory <span className="font-normal text-gray-400 ml-1">({filteredProducts.length})</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 w-48" />
                  </div>
                  <Button size="sm" onClick={openNew} className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs px-4 h-8">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Product
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-56">Product</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36">Category</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right w-24">Price</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right w-20">Stock</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center w-20">Organic</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right w-20">Rating</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map(p => (
                      <TableRow key={p.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                            <span className="font-medium text-sm text-gray-800">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{p.category}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            p.type === 'fruit' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {p.type === 'fruit' ? <Apple className="h-3 w-3 shrink-0" /> : <Leaf className="h-3 w-3 shrink-0" />}
                            {p.type === 'fruit' ? 'Fruit' : 'Vegetable'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm text-gray-800">{formatPrice(p.price)}</TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {p.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {p.organic
                              ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                              : <XCircle className="h-4 w-4 text-gray-200" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-gray-600 inline-flex items-center justify-end gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" /> {p.rating}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(p.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {lowStock.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">All products are well stocked</p>
                  <p className="text-xs text-gray-400 mt-1">No items below the low-stock threshold of 5 units.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-5 py-3">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{lowStock.length} product{lowStock.length > 1 ? 's' : ''} need restocking</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs text-gray-400 font-semibold uppercase tracking-wide">
                          <th className="px-5 py-3">Product</th>
                          <th className="px-5 py-3">Category</th>
                          <th className="px-5 py-3 text-right">Stock</th>
                          <th className="px-5 py-3 text-right">Status</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {lowStock.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                                <span className="font-medium text-gray-800">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-gray-500">{p.category}</td>
                            <td className="px-5 py-3 text-right">
                              <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>{p.stock}</span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                              }`}>{p.stock === 0 ? 'Out of Stock' : 'Critical'}</span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => { openEdit(p); setSearchParams({ tab: 'products' }); }}
                                className="text-xs font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2 transition-colors">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

      </div>
      <Dialog open={!!editProduct} onOpenChange={v => !v && setEditProduct(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-0">
          <div className="sticky top-0 z-10 bg-white border-b px-6 pt-5 pb-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                {isNew ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                {isNew ? 'Add New Product' : 'Edit Product'}
              </DialogTitle>
            </DialogHeader>
          </div>
          {editProduct && (
            <div className="px-6 py-4 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product Image</Label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <label className="cursor-pointer flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full text-sm font-medium shadow">
                        <Upload className="h-4 w-4" /> Change
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <button onClick={() => { setImagePreview(''); setEditProduct({ ...editProduct, image: '', gallery: [] }); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white/90 hover:bg-red-50 hover:text-red-600 shadow transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <Upload className="h-6 w-6 text-gray-300" />
                    <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product Name</Label>
                <Input placeholder="e.g. Organic Carrots" value={editProduct.name}
                  onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</Label>
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
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price (?)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</Label>
                  <Input type="number" placeholder="0" value={editProduct.stock}
                    onChange={e => setEditProduct({ ...editProduct, stock: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount %</Label>
                  <Input type="number" max={99} placeholder="0" value={editProduct.discount}
                    onChange={e => setEditProduct({ ...editProduct, discount: +e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
                <textarea className="flex min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Describe your product..."
                  value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-100 bg-gray-50">
                <Label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <Leaf className="h-4 w-4 text-emerald-500" /> Organic Product
                </Label>
                <Switch checked={editProduct.organic}
                  onCheckedChange={v => setEditProduct({ ...editProduct, organic: v })} />
              </div>
            </div>
          )}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4">
            <DialogFooter>
              <Button variant="outline" className="rounded-lg" onClick={() => setEditProduct(null)}>Cancel</Button>
              <Button className="rounded-lg bg-gray-900 hover:bg-gray-800" onClick={handleSave}>
                {isNew ? <><Plus className="h-4 w-4 mr-1.5" /> Add Product</> : <><CheckCircle className="h-4 w-4 mr-1.5" /> Save Changes</>}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This cannot be undone. The product will be permanently removed.</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button className="rounded-lg bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
