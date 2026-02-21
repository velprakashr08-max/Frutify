import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SearchX } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Switch } from '../components/ui/Switch';
import { Label } from '../components/ui/Label';
import { Slider } from '../components/ui/Slide';
import { useProducts } from '../contexts/ProductContext';
import { categories } from '../data/vegetables';
import CategoryIcon from '../components/CategoryIcon';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { formatPrice } from '../lib/utils';

export default function Products() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All Vegetables');
  const [priceRange, setPriceRange] = useState([10]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sort, setSort] = useState('popular');
  const [quickView, setQuickView] = useState(null);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (category !== 'All Vegetables') {
      result = result.filter(p => p.category === category);
    }

    result = result.filter(p => p.price <= priceRange[0]);

    if (organicOnly) result = result.filter(p => p.organic);

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()); break;
      default: result.sort((a, b) => b.reviews - a.reviews); break;
    }

    return result;
  }, [products, search, category, priceRange, organicOnly, sort]);

  return (
    <div className="py-8">
      <div className="container space-y-6">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground">Browse our selection of farm-fresh vegetables</p>
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vegetables..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inline Filters Row */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border bg-muted/30">
          {/* Categories */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Category:</span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Price slider */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Max: {formatPrice(priceRange[0])}</span>
            <Slider value={priceRange} onValueChange={v => setPriceRange(v)} max={10} step={0.5} min={0.5} className="w-28" />
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Organic toggle */}
          <div className="flex items-center gap-2">
            <Switch id="organic" checked={organicOnly} onCheckedChange={setOrganicOnly} />
            <Label htmlFor="organic" className="text-sm">Organic Only</Label>
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <SearchX className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="font-heading text-xl font-semibold">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={() => { setSearch(''); setCategory('All Vegetables'); setPriceRange([10]); setOrganicOnly(false); }}>
              <X className="h-4 w-4 mr-2" /> Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{filtered.length} products found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
              ))}
            </div>
          </>
        )}
      </div>

      <ProductDetailModal product={quickView} open={!!quickView} onOpenChange={v => !v && setQuickView(null)} />
    </div>
  );
}