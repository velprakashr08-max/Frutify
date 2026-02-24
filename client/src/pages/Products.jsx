import {useState,useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Search,X,SearchX,SlidersHorizontal,Apple,Leaf,Filter,ChevronDown,ChevronUp} from 'lucide-react';
import {Input} from '../components/ui/Input';
import {Button} from '../components/ui/Button';
import {Badge} from '../components/ui/Badge';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '../components/ui/Select';
import {Switch} from '../components/ui/Switch';
import {Label} from '../components/ui/Label';
import {Slider} from '../components/ui/Slide';
import {useProducts} from '../contexts/ProductContext';
import {categories} from '../data/vegetables';
import CategoryIcon from '../components/CategoryIcon';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import {formatPrice} from '../lib/utils';
const TYPE_TABS = [
  {id:'all',label:'All',icon:SlidersHorizontal,color:'bg-primary text-primary-foreground',outline:'border-primary text-primary' },
  {id:'fruit',label:'Fruits',icon:Apple,color:'bg-orange-500 text-white',outline:'border-orange-400 text-orange-600' },
  {id:'vegetable',label:'Vegetables', icon:Leaf,color:'bg-emerald-600 text-white',outline:'border-emerald-500 text-emerald-700' },
];
export default function Products() {
  const {products}=useProducts();
  const [searchParams]=useSearchParams();
  const [search,setSearch]=useState('');
  const [typeFilter,setTypeFilter]=useState('all');
  const [category,setCategory]=useState(searchParams.get('category')||'All');
  const [priceRange,setPriceRange]=useState([25]);
  const [organicOnly,setOrganicOnly]=useState(false);
  const [sort,setSort]=useState('popular');
  const [quickView,setQuickView]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const visibleCategories =useMemo(()=>{
    const all={id: 0,name:'All',icon:'leaf',type:'all'};
    if (typeFilter==='all') return[all,...categories.filter(c =>c.type !=='all')];
    return [all,...categories.filter(c => c.type===typeFilter)];
  },[typeFilter]);
  const handleTypeChange =(t)=>{setTypeFilter(t);setCategory('All');};
  const filtered= useMemo(()=>{
    let result=[...products];
    if (search){
      const q=search.toLowerCase();
      result=result.filter(p =>p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (typeFilter !=='all') result=result.filter(p => p.type === typeFilter);
    if (category !=='All')result=result.filter(p => p.category === category);
    result =result.filter(p =>p.price <=priceRange[0]);
    if (organicOnly) result= result.filter(p => p.organic);
    switch (sort) {
      case 'price-asc':result.sort((a,b)=>a.price-b.price); break;
      case 'price-desc':result.sort((a,b)=>b.price-a.price); break;
      case 'rating':result.sort((a,b)=>b.rating -a.rating); break;
      case 'newest':result.sort((a,b)=>new Date(b.dateAdded) - new Date(a.dateAdded)); break;
      default:result.sort((a,b)=>b.reviews-a.reviews); break;
    }
    return result;
  }, [products,search,typeFilter,category,priceRange,organicOnly,sort]);

  const activeFiltersCount=[typeFilter !== 'all',category!=='All',priceRange[0]<25,organicOnly].filter(Boolean).length;
  const clearAll =()=>{setSearch('');setTypeFilter('all');setCategory('All');setPriceRange([25]);setOrganicOnly(false); };

  return (
    <div className="min-h-screen bg-muted/20 py-6">
      <div className="container space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold">Shop Fresh</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Fruits &amp; Vegetables delivered to your door</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10 bg-background" value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_TABS.map(t=>{
            const Icon=t.icon;
            const active=typeFilter ===t.id;
            return (
              <button
                key={t.id}
                onClick={()=>handleTypeChange(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  active ? t.color + ' border-transparent shadow-md scale-105' : 'bg-background ' + t.outline + ' hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.id !=='all'&&(
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-muted'}`}>
                    {products.filter(p =>p.type ===t.id).length}
                  </span>
                )}
              </button>   
            );
          })}
          {activeFiltersCount > 0&&(   
            <button
              onClick={clearAll}
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed rounded-full px-3 py-1.5 transition-colors"
            >
              <X className="h-3 w-3" /> Clear all
              <Badge variant="destructive" className="h-4 w-4 p-0 text-[10px] flex items-center justify-center rounded-full">{activeFiltersCount}</Badge>
            </button>
          )}
        </div>
        <div className="flex gap-6 items-start">
          <aside className="hidden lg:block w-60 shrink-0 sticky top-4 self-start">
            <div className="rounded-2xl border bg-background shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Filters
                </span>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Reset</button>
                )}
              </div>
              <div className="p-4 border-b space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</p>
                <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                  {visibleCategories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.name)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                        category === c.name
                          ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {c.type !=='all' && <CategoryIcon name={c.icon} className="h-3.5 w-3.5 shrink-0" />}
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className={`text-xs tabular-nums ${category === c.name ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {c.name==='All'?products.filter(p =>typeFilter ==='all'||p.type === typeFilter).length:products.filter(p =>p.category ===c.name).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Max Price</p>
                  <span className="text-sm font-bold text-primary">{formatPrice(priceRange[0])}</span>
                </div>
                <Slider value={priceRange} onValueChange={v => setPriceRange(v)} max={25} step={0.5} min={0.5} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPrice(0.5)}</span><span>{formatPrice(25)}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="organic-sb" className="text-sm font-medium cursor-pointer">Organic Only</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{products.filter(p => p.organic).length} products</p>
                  </div>
                  <Switch id="organic-sb" checked={organicOnly} onCheckedChange={setOrganicOnly} />
                </div>
              </div>
            </div>
          </aside>
          <div className="flex-1 min-w-0 space-y-4">
            <div className="lg:hidden space-y-3">
              <button
                onClick={()=>setSidebarOpen(v=>!v)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border bg-background text-sm font-medium shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Filters
                  {activeFiltersCount > 0 && <Badge variant="destructive" className="h-5 min-w-5 text-[10px] px-1">{activeFiltersCount}</Badge>}
                </span>
                {sidebarOpen ?<ChevronUp className="h-4 w-4" />:<ChevronDown className="h-4 w-4" />}
              </button>
              {sidebarOpen &&(
                <div className="rounded-xl border bg-background p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 shadow-sm">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {visibleCategories.map(c=><SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Max Price <span className="text-primary normal-case">{formatPrice(priceRange[0])}</span>
                    </Label>
                    <Slider value={priceRange} onValueChange={setPriceRange} max={25} step={0.5} min={0.5} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="org-mob" checked={organicOnly} onCheckedChange={setOrganicOnly} />
                    <Label htmlFor="org-mob" className="text-sm cursor-pointer">Organic Only</Label>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> products
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {typeFilter !== 'all' &&(
                  <Badge variant="secondary" className="gap-1 pr-1 cursor-pointer" onClick={()=> handleTypeChange('all')}>
                    {typeFilter ==='fruit' ? <Apple className="h-3 w-3" />:<Leaf className="h-3 w-3" />}
                    {typeFilter ==='fruit' ?'Fruits':'Vegetables'}
                    <X className="h-3 w-3 ml-0.5" />
                  </Badge>
                )}
                {category !== 'All'&&(
                  <Badge variant="secondary" className="gap-1 pr-1 cursor-pointer" onClick={()=>setCategory('All')}>
                    {category} <X className="h-3 w-3 ml-0.5" />
                  </Badge>
                )}
                {organicOnly &&(
                  <Badge variant="secondary" className="gap-1 pr-1 cursor-pointer text-emerald-700 bg-emerald-50 border-emerald-200" onClick={() => setOrganicOnly(false)}>
                    <Leaf className="h-3 w-3"/> Organic <X className="h-3 w-3 ml-0.5" />
                  </Badge>
                )}
              </div>
            </div>
            {filtered.length === 0?(
              <div className="text-center py-24 space-y-4 rounded-2xl border bg-background">
                <SearchX className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                <h3 className="font-heading text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
                <Button variant="outline" onClick={clearAll}><X className="h-4 w-4 mr-2" /> Clear All Filters</Button>
              </div>
            ):(
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickView} compact />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <ProductDetailModal product={quickView} open={!!quickView} onOpenChange={v => !v && setQuickView(null)} />
    </div>
  );
}
