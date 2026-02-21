import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import {
  Leaf, Truck, Shield, Award, Star, ArrowRight, ChevronLeft, ChevronRight,
  Carrot, TreeDeciduous, Bean, Sprout,
  Package, Clock, CheckCircle, Users, ShoppingBag, MapPin, Send,
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { categories, testimonials } from '../data/vegetables';
import CategoryIcon from '../components/CategoryIcon';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import Footer from '../components/Footer';
import heroVideo from '../assets/hero-farm.mp4';

export default function Index() {
  const { products } = useProducts();
  const [quickView, setQuickView] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const newArrivals = [...products].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 4);

  const features = [
    { icon: Leaf, title: '100% Organic', desc: 'Certified organic fruits &amp; vegetables from trusted farms' },
    { icon: Truck, title: 'Free Delivery', desc: 'Free shipping on all orders, no minimum' },
    { icon: Shield, title: 'Quality Guarantee', desc: 'Not satisfied? Full refund, no questions asked' },
    { icon: Award, title: 'Premium Quality', desc: 'Hand-picked for freshness every single day' },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers', icon: Users },
    { value: '500+', label: 'Products Delivered', icon: ShoppingBag },
    { value: '50+', label: 'Local Farms', icon: MapPin },
    { value: '24/7', label: 'Customer Support', icon: Clock },
  ];

  const steps = [
    { step: 1, title: 'Browse Products', desc: 'Explore our wide range of fresh organic fruits and vegetables', icon: Sprout },
    { step: 2, title: 'Add to Cart', desc: 'Select your favorites and add them to your cart', icon: ShoppingBag },
    { step: 3, title: 'Quick Checkout', desc: 'Pay securely with card or online payment', icon: CheckCircle },
    { step: 4, title: 'Fast Delivery', desc: 'Get your order delivered fresh to your door', icon: Package },
  ];

  return (
    <div>
      {/* Hero with Video & Parallax */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Soft gradient overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/30 to-transparent" />

        {/* Parallax floating icons */}
        <div className="absolute top-16 right-16 hidden lg:block" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
          <Sprout className="h-24 w-24 text-white/15" />
        </div>
        <div className="absolute top-40 right-52 hidden lg:block" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
          <TreeDeciduous className="h-16 w-16 text-white/12" />
        </div>
        <div className="absolute bottom-28 right-20 hidden lg:block" style={{ transform: `translateY(${scrollY * -0.2}px)` }}>
          <Leaf className="h-28 w-28 text-white/10" />
        </div>
        <div className="absolute bottom-40 right-72 hidden lg:block" style={{ transform: `translateY(${scrollY * -0.12}px)` }}>
          <Carrot className="h-14 w-14 text-white/12" />
        </div>

        {/* Content with parallax */}
        <div className="container relative z-10 pl-12 md:pl-20 lg:pl-32 pr-8" style={{ transform: `translateY(${scrollY * -0.15}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
          <div className="max-w-2xl space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg">
              <Leaf className="h-4 w-4" />
              Farm Fresh &amp; Organic
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-white">
              Fresh <span className="text-primary">Fruits &amp; Veggies</span> Delivered to You
            </h1>
            <p className="text-lg text-white/70 max-w-lg leading-relaxed">
              Discover the finest organic fruits and vegetables sourced directly from local farms.
              Fresh, healthy, and delivered right to your doorstep.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-8 shadow-lg">
                <Link to="/products">Shop Now <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" className="rounded-full px-8 bg-foreground/80 text-background hover:bg-foreground shadow-lg border-0">
                <Link to="/products">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <s.icon className="h-6 w-6 opacity-80" />
                <span className="text-2xl md:text-3xl font-heading font-bold">{s.value}</span>
                <span className="text-sm opacity-80">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="text-center border-none shadow-none bg-transparent group hover:bg-card hover:shadow-lg transition-all duration-300 rounded-2xl">
                <CardContent className="pt-8 pb-6 space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <f.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="font-heading font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="font-heading text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Our top-rated farm-fresh fruits &amp; vegetables</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/products">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Get fresh fruits &amp; vegetables in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative text-center space-y-4 group">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                  <s.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-heading font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {s.step < 4 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground">Browse fruits, veggies &amp; more by category</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.filter(c => c.type !== 'all').map(c => (
              <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border bg-card hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <CategoryIcon name={c.icon} className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-center">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="container space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="font-heading text-3xl font-bold">New Arrivals</h2>
              <p className="text-muted-foreground">Just added to our collection</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/products">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(p => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-3xl font-bold">What Our Customers Say</h2>
            <p className="text-muted-foreground">Real reviews from real customers</p>
          </div>
          <div className="max-w-xl mx-auto">
            <Card className="text-center rounded-2xl shadow-lg border-0">
              <CardContent className="pt-8 pb-6 space-y-4">
                <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name}
                  className="w-16 h-16 rounded-full mx-auto ring-4 ring-primary/10" />
                <div className="flex justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic leading-relaxed">"{testimonials[testimonialIdx].text}"</p>
                <div>
                  <p className="font-heading font-semibold">{testimonials[testimonialIdx].name}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[testimonialIdx].role}</p>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1.5">
                    {testimonials.map((_, i) => (
                      <button key={i} onClick={() => setTestimonialIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-primary w-6' : 'bg-muted w-2'}`} />
                    ))}
                  </div>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold">Stay Updated</h2>
            <p className="text-muted-foreground">Subscribe to get updates on new arrivals, seasonal offers, and healthy recipes.</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="rounded-full" />
              <Button className="rounded-full px-6">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-linear-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Ready to Eat Fresh?</h2>
          <p className="text-primary-foreground/80 max-w-md mx-auto">
            Join thousands of happy customers enjoying farm-fresh fruits &amp; vegetables delivered daily.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-8 shadow-lg">
            <Link to="/products">Start Shopping <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      <Footer />

      <ProductDetailModal product={quickView} open={!!quickView} onOpenChange={v => !v && setQuickView(null)} />
    </div>
  );
}