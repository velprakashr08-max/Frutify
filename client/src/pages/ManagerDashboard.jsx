import{useState,useMemo} from "react";
import{Navigate,useSearchParams} from "react-router-dom";
import{useAuth} from "@/contexts/AuthContext";
import{useProducts} from "@/contexts/ProductContext";
import{AlertTriangle,CheckCircle,Leaf,Star,Apple,TrendingUp,Search,ShoppingBag,Tag,IndianRupee,ArrowUpRight} from "lucide-react";
import{BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Cell} from "recharts";
import{formatPrice} from "@/lib/utils";
const BAR_COLORS=["#16a34a","#15803d","#166534","#4ade80","#22c55e","#86efac","#bbf7d0","#dcfce7","#d1fae5","#a7f3d0"];
const CustomTooltip=({active,payload,label})=>{
  if (!active||!payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-green-600 font-bold">{formatPrice(payload[0].value)}</p>
    </div>
  );
};
export default function ManagerDashboard() {
  const{user}=useAuth();
  const{products}=useProducts();
  const[searchParams]=useSearchParams();
  const activeTab=searchParams.get("tab")||"overview";
  const[search,setSearch]=useState("");
  const fruits=useMemo(()=>products.filter(p=>p.type ==="fruit"),[products]);
  const veggies=useMemo(()=>products.filter(p=>p.type ==="vegetable"),[products]);
  const categoryData=useMemo(()=>{
    const map ={};
    products.forEach(p=>{
      if (!map[p.category])map[p.category]={count:0,value:0};
      map[p.category].count++;
      map[p.category].value +=p.price*p.stock;
    });
    return Object.entries(map)
      .map(([name,d]) => ({
        name:name.length >12?name.slice(0,12) + "..." :name,
        fullName:name,
        count:d.count,
        value:Math.round(d.value),
      }))
      .sort((a,b)=>b.value -a.value);
  },[products]);

  const filtered = useMemo(()=>
    products.filter(p=>
      p.name.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase())),
  [products,search]);
  if (user?.role !=="manager") return <Navigate to="/" replace />;

  const totalValue=products.reduce((s,p) =>s +p.price *p.stock,0);
  const lowStock=products.filter(p=>p.stock<= 5).length;
  const outOfStock=products.filter(p=>p.stock===0).length;
  const organic=products.filter(p=>p.organic).length;
  const discounted=products.filter(p=>p.discount >0).length;
  const avgRating=products.length
    ? (products.reduce((s,p)=>s +p.rating,0) /products.length).toFixed(1):"0";
  const maxCatValue=categoryData[0]?.value ||1;
  const kpis=[
    {label:"Total Products",value:products.length,sub:`${fruits.length} fruits - ${veggies.length} veggies`,icon:ShoppingBag,color:"text-blue-600",bg:"bg-blue-50",border:"border-blue-100"},
    {label:"Inventory Value",value:formatPrice(totalValue),sub:`${organic} organic items`,icon:IndianRupee,color:"text-green-600",bg:"bg-green-50",border:"border-green-100"},
    {label:"Avg Rating",value:avgRating,sub:"across all products",icon:Star,color:"text-amber-500",bg:"bg-amber-50",border:"border-amber-100",suffix:"star"},
    {label:"Active Discounts",value:discounted,sub:"promotional offers",icon:Tag,color:"text-purple-600",bg:"bg-purple-50",border:"border-purple-100" },
    {label:"Need Attention",value:lowStock,sub:outOfStock >0?`${outOfStock} out of stock`:"monitor closely",icon:AlertTriangle,color:lowStock > 0 ? "text-red-500" : "text-gray-400", bg: lowStock > 0 ? "bg-red-50" : "bg-gray-50", border: lowStock > 0 ? "border-red-100" : "border-gray-100", alert: true },
  ];
  return (
    <div className="p-6 space-y-6">
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((k,i) => {
              const Icon =k.icon;
              return (
                <div key={i} className={`bg-white rounded-2xl border ${k.border} p-4 flex flex-col gap-3 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${k.bg}`}>
                      <Icon className={`h-4 w-4 ${k.color}`} />
                    </div>
                    <ArrowUpRight className={`h-4 w-4 ${k.alert && k.value > 0 ? "text-red-400" : "text-gray-200"}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${k.alert && k.value > 0 ?"text-red-600":"text-gray-900"}`}>
                      {k.value}{k.suffix && <span className="text-sm text-amber-400 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{k.label}</p>
                    <p className="text-[11px] text-gray-300 mt-0.5 truncate">{k.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Inventory Value by Category</p>
                  <p className="text-xs text-gray-400 mt-0.5">Stock value across all categories</p>
                </div>
                <span className="text-xs font-medium bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
                  {categoryData.length} categories
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{left:0,right:8,bottom:28}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:10,fill:"#9ca3af"}} tickFormatter={v=>`Rs.${(v /1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: "#f0fdf4"}} />
                  <Bar dataKey="value" radius={[6,6,0,0]} maxBarSize={40}>
                    {categoryData.map((_,idx) => (
                      <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">Quick Breakdown</p>
              <div className="space-y-3">
                {[
                  {label:"Fruits",value:fruits.length,pct:Math.round(fruits.length /(products.length || 1) *100),icon:Apple,     color: "text-orange-500",  bar: "bg-orange-400"  },
                  {label:"Vegetables",value:veggies.length,pct:Math.round(veggies.length/(products.length || 1) *100),icon:Leaf,          color: "text-emerald-600", bar: "bg-emerald-500" },
                  {label:"Organic",value:organic,pct:Math.round(organic/(products.length || 1) *100), icon:CheckCircle,color:"text-green-600",   bar: "bg-green-500"   },
                  {label:"Discounted",value:discounted,pct:Math.round(discounted/(products.length || 1) *100),icon:TrendingUp,color:"text-blue-500",    bar: "bg-blue-400"    },
                  {label:"Low Stock",value:lowStock,pct:Math.round(lowStock/(products.length || 1) *100),icon:AlertTriangle,color:lowStock > 0 ? "text-red-500" : "text-gray-300", bar: lowStock > 0 ? "bg-red-400" : "bg-gray-200" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-xs text-gray-600">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${s.color}`} />
                          {s.label}
                        </span>
                        <span className="text-xs font-bold text-gray-800">{s.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.bar} transition-all`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Top 3 by Value</p>
                {categoryData.slice(0,3).map((c,i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? "bg-green-500" : i === 1 ? "bg-green-400" : "bg-green-300"}`}>
                        {i + 1}
                      </span>
                      <span className="text-xs text-gray-600">{c.fullName}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{formatPrice(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-800">Category Breakdown</p>
                <p className="text-xs text-gray-400 mt-0.5">Full breakdown with inventory values</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                {categoryData.length} categories
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {categoryData.map((c,i)=>(
                <div key={i} className="flex items-center px-6 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center text-[10px] font-bold text-green-600 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">{c.fullName}</span>
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-center">{c.count} SKUs</span>
                  <div className="flex items-center gap-3 w-44 justify-end">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-20">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round(c.value / maxCatValue * 100)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-20 text-right">{formatPrice(c.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {activeTab === "catalog" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-800">Product Catalog</p>
              <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {products.length} products</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                placeholder="Search products or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 w-56 transition"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 w-64">Product</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-36">Category</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-24">Type</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-28">Price</th>
                  <th className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-24">Discount</th>
                  <th className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-24">Stock</th>
                  <th className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-24">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                      No products found for &quot;{search}&quot;
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0 group-hover:scale-105 transition-transform" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">{p.name}</p>
                          {p.organic && (
                            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                              <CheckCircle className="h-2.5 w-2.5 shrink-0" /> Organic
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        p.type === "fruit"
                          ? "bg-orange-50 text-orange-600 border border-orange-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        {p.type === "fruit" ? <Apple className="h-2.5 w-2.5 shrink-0" /> : <Leaf className="h-2.5 w-2.5 shrink-0" />}
                        {p.type === "fruit" ? "Fruit" : "Veg"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-sm text-gray-800">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.discount > 0
                        ? <span className="inline-flex items-center text-[11px] font-semibold text-white bg-blue-500 px-2 py-0.5 rounded-full">{p.discount}% off</span>
                        : <span className="text-gray-300">-</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        p.stock === 0        ? "bg-red-50 text-red-600 border border-red-100"
                        : p.stock <= 5       ? "bg-orange-50 text-orange-600 border border-orange-100"
                        :                      "bg-gray-50 text-gray-600 border border-gray-100"
                      }`}>
                        {p.stock === 0 ? "Out" : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        {p.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
              <span>Showing {filtered.length} products</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Fruit: {fruits.length}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Veg: {veggies.length}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Low stock: {lowStock}</span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}