import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Leaf, Truck, Shield, Award, Star, ArrowRight, ChevronLeft, ChevronRight,
  Carrot, TreeDeciduous, Bean, Sprout,
  Package, Clock, CheckCircle, Users, ShoppingBag, MapPin, Send,
} from 'lucide-react';
import { testimonials } from '../data/vegetables';
import Footer from '../components/Footer';
import heroVideo from '../assets/hero-farm.mp4';

export default function Index() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
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
        <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/30 to-transparent" />
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
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-gray-100">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-2 py-2">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-2xl md:text-3xl font-heading font-bold text-gray-900">{s.value}</span>
                  <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-16 bg-[#f8fdf9]">
        <div className="container">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 mb-3">Why Frutify</span>
            <h2 className="font-heading text-3xl font-bold text-gray-900">Everything You Need, Fresh</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-start gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-800 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="mt-auto w-8 h-0.5 bg-green-200 group-hover:w-16 group-hover:bg-green-500 transition-all duration-300 rounded-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 mb-3">Simple Process</span>
            <h2 className="font-heading text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">Get fresh fruits &amp; vegetables in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-transparent via-green-200 to-transparent" />
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative flex flex-col items-center text-center gap-4 group">
                  <div className="relative z-10 w-20 h-20 rounded-2xl bg-white border-2 border-green-100 flex items-center justify-center shadow-sm group-hover:border-green-500 group-hover:shadow-md transition-all duration-300">
                    <Icon className="h-8 w-8 text-green-600" />
                    <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shadow">
                      {s.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-800 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-40 mx-auto">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 mb-3">Reviews</span>
            <h2 className="font-heading text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          </div>
          <div className="max-w-lg mx-auto">
            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
              {/* Quote accent */}
              <div className="absolute top-6 right-8 text-6xl font-serif text-green-100 leading-none select-none">&ldquo;</div>
              <div className="flex flex-col items-center text-center gap-5">
                <img
                  src={testimonials[testimonialIdx].avatar}
                  alt={testimonials[testimonialIdx].name}
                  className="w-16 h-16 rounded-full ring-4 ring-green-100 object-cover"
                />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed text-sm max-w-sm">"{testimonials[testimonialIdx].text}"</p>
                <div>
                  <p className="font-heading font-bold text-gray-800">{testimonials[testimonialIdx].name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{testimonials[testimonialIdx].role}</p>
                </div>
              </div>
              {/* Controls */}
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-green-400 hover:text-green-600 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      className={`rounded-full transition-all duration-300 ${i === testimonialIdx ? 'bg-green-500 w-5 h-2' : 'bg-gray-200 w-2 h-2 hover:bg-gray-300'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-green-400 hover:text-green-600 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-[#f8fdf9]">
        <div className="container">
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-green-100 shadow-lg p-10 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900">Stay Updated</h2>
              <p className="text-sm text-gray-500 mt-1.5">Subscribe for new arrivals, seasonal offers &amp; healthy recipes.</p>
            </div>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input placeholder="Your email address" className="rounded-full border-gray-200 focus:border-green-400 flex-1" />
              <Button className="rounded-full px-5 bg-green-600 hover:bg-green-700 shrink-0">Subscribe</Button>
            </div>
            <p className="text-[11px] text-gray-400">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}