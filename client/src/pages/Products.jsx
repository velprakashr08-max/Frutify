import {useState,useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Search,X,SearchX,Leaf,Apple,ChevronLeft,ChevronRight} from 'lucide-react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '../components/ui/Select';
import {useProducts} from '../contexts/ProductContext';
import {categories} from '../data/vegetables';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

const PAGE_SIZE = 20;

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-30 hover:border-amber-400 hover:text-amber-500 transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${
            p === page
              ? 'bg-amber-400 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-500'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-30 hover:border-amber-400 hover:text-amber-500 transition-all"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProductSection({ title, icon: Icon, iconClass, items, onQuickView }) {
  const [page, setPage] = useState(1);
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconClass}`} />
        <h2 className="font-heading font-bold text-gray-800 text-base">{title}</h2>
        <span className="text-xs text-gray-400 font-medium">{items.length} items</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {paged.map(p => <ProductCard key={p.id} product={p} onQuickView={onQuickView} compact />)}
      </div>
      <Pagination page={page} total={items.length} pageSize={PAGE_SIZE} onChange={p => { setPage(p); window.scrollTo({top:0,behavior:'smooth'}); }} />
    </div>
  );
}

export default function Products() {
  const {products} = useProducts();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sort, setSort] = useState('popular');
  const [quickView, setQuickView] = useState(null);
  const [page, setPage] = useState(1);

  const visibleCategories = useMemo(() => {
    const all = {id:0, name:'All', icon:'leaf', type:'all'};
    if (typeFilter === 'all') return [all, ...categories.filter(c => c.type !== 'all')];
    return [all, ...categories.filter(c => c.type === typeFilter)];
  }, [typeFilter]);

  const handleTypeChange = (t) => { setTypeFilter(t); setCategory('All'); setPage(1); };

  const applySort = (arr) => {
    const result = [...arr];
    switch (sort) {
      case 'price-asc': result.sort((a,b) => a.price - b.price); break;
      case 'price-desc': result.sort((a,b) => b.price - a.price); break;
      case 'rating': result.sort((a,b) => b.rating - a.rating); break;
      case 'newest': result.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
      default: result.sort((a,b) => b.reviews - a.reviews); break;
    }
    return result;
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') result = result.filter(p => p.type === typeFilter);
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (organicOnly) result = result.filter(p => p.organic);
    return applySort(result);
  }, [products, search, typeFilter, category, organicOnly, sort]);

  const fruits = useMemo(() => applySort(
    filtered.filter(p => p.type === 'fruit')
  ), [filtered]);

  const vegetables = useMemo(() => applySort(
    filtered.filter(p => p.type === 'vegetable')
  ), [filtered]);

  const clearAll = () => { setSearch(''); setTypeFilter('all'); setCategory('All'); setOrganicOnly(false); setPage(1); };
  const activeCount = [typeFilter !== 'all', category !== 'All', organicOnly].filter(Boolean).length;

  const showSplit = typeFilter === 'all' && category === 'All' && !search;
  const pagedFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar — sticky just below the h-16 navbar */}
      <div className="bg-white sticky top-16 z-20">
        <div className="container">

          {/* Row 1: title + search + sort — fixed height 52px */}
          <div className="h-[52px] flex items-center gap-3">
            <h1 className="font-heading text-lg font-bold text-gray-900 shrink-0">Shop Fresh</h1>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-8 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Select value={sort} onValueChange={v => { setSort(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-40 text-xs bg-gray-50 border-gray-200 rounded-full">
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
              {/* Always rendered — invisible when no active filters to prevent layout jump */}
              <button
                onClick={clearAll}
                className={`h-8 px-3 text-xs bg-gray-50 border border-gray-200 rounded-full flex items-center gap-1 transition-all ${
                  activeCount > 0
                    ? 'text-gray-500 hover:text-red-500 opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <X className="h-3 w-3" /> Clear ({activeCount})
              </button>
            </div>
          </div>

          {/* Row 2: filters — fixed height 44px */}
          <div className="h-[44px] flex items-center gap-2">
            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-8 w-36 text-xs bg-gray-50 border-gray-200 rounded-full shrink-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fruit">Fruits</SelectItem>
                <SelectItem value="vegetable">Vegetables</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={v => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-44 text-xs bg-gray-50 border-gray-200 rounded-full shrink-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {visibleCategories.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setOrganicOnly(v => !v)}
              className={`h-8 flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                organicOnly ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
              }`}
            >
              <Leaf className="h-3.5 w-3.5" /> Organic only
            </button>

            <span className="ml-auto text-xs text-gray-400 shrink-0">
              <span className="font-semibold text-gray-700">{filtered.length}</span> products
            </span>
          </div>

        </div>
      </div>

      {/* Product content */}
      <div className="container py-5 space-y-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24 space-y-3 bg-white rounded-2xl">
            <SearchX className="h-14 w-14 text-gray-300 mx-auto" />
            <h3 className="font-heading text-lg font-semibold text-gray-700">No products found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            <button onClick={clearAll} className="mt-2 px-5 py-2 rounded-full bg-gray-100 text-sm text-gray-600 hover:bg-gray-200 transition-colors">
              Clear all filters
            </button>
          </div>
        ) : showSplit ? (
          <>
            {fruits.length > 0 && (
              <ProductSection title="Fruits" icon={Apple} iconClass="text-orange-400" items={fruits} onQuickView={setQuickView} />
            )}
            {vegetables.length > 0 && (
              <ProductSection title="Vegetables" icon={Leaf} iconClass="text-green-500" items={vegetables} onQuickView={setQuickView} />
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {pagedFiltered.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickView} compact />)}
            </div>
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={p => { setPage(p); window.scrollTo({top:0,behavior:'smooth'}); }} />
          </>
        )}
      </div>

      <ProductDetailModal product={quickView} open={!!quickView} onOpenChange={v => !v && setQuickView(null)} />
    </div>
  );
}
