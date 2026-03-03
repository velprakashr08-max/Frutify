import {useState,useEffect,useRef} from 'react';
import{Link} from 'react-router-dom';
import{Button} from '../components/ui/Button';
import{Input} from '../components/ui/Input';
import {Leaf,Truck,Shield,Award,Star,ArrowRight,ChevronLeft,ChevronRight,Carrot,TreeDeciduous,Bean,Sprout,Package,Clock,CheckCircle,Users, ShoppingBag, MapPin,Send} from 'lucide-react';
import {testimonials} from '../data/vegetables';
import Footer from '../components/Footer';
import heroVideo from '../assets/hero-farm.mp4';

export default function Index() {
  const [testimonialIdx,setTestimonialIdx] =useState(0);
  const [scrollY,setScrollY] =useState(0);
  const heroRef=useRef(null);
  useEffect(()=>{
    const handleScroll =()=>setScrollY(window.scrollY);
    window.addEventListener('scroll',handleScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',handleScroll);
  },[]);

  const features = [
    {icon:Leaf,title:'100% Organic',desc:'Certified organic fruits &amp; vegetables from trusted farms'},
    {icon:Truck,title:'Free Delivery',desc:'Free shipping on all orders, no minimum'},
    {icon:Shield,title:'Quality Guarantee',desc:'Not satisfied? Full refund, no questions asked'},
    {icon:Award,title:'Premium Quality',desc:'Hand-picked for freshness every single day'},
  ];
  const stats = [
    { value:'10K+',label:'Happy Customers',icon:Users},
    { value:'500+',label:'Products Delivered',icon:ShoppingBag},
    { value:'50+',label:'Local Farms',icon:MapPin},
    { value:'24/7',label:'Customer Support',icon:Clock},
  ];
  const steps=[
    {step:1,title:'Browse Products',desc:'Explore our wide range of fresh organic fruits and vegetables',icon:Sprout},
    {step:2,title:'Add to Cart',desc:'Select your favorites and add them to your cart',icon:ShoppingBag},
    {step:3,title:'Quick Checkout',desc:'Pay securely with card or online payment',icon:CheckCircle},
    {step:4,title:'Fast Delivery',desc:'Get your order delivered fresh to your door',icon:Package},
  ];
  return (
    <div className="bg-white">
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[55vh] flex items-center">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/30 to-transparent" />
        <div className="absolute top-16 right-16 hidden lg:block" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
          <Sprout className="h-24 w-24 text-white/10" />
        </div>
        <div className="absolute bottom-28 right-20 hidden lg:block" style={{ transform: `translateY(${scrollY * -0.2}px)` }}>
          <Leaf className="h-28 w-28 text-white/8" />
        </div>
        <div className="container relative z-10 pl-12 md:pl-20 lg:pl-32 pr-8" style={{ transform: `translateY(${scrollY * -0.15}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-medium" style={{background:'#16a34a'}}>
              <Leaf className="h-4 w-4" />
              Farm Fresh &amp; Organic
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] text-white">
              Fresh <span style={{color:'#fbbf18'}}>Fruits &amp; Veggies</span> Delivered to You
            </h1>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-8 shadow-lg border-0 text-white hover:opacity-90" style={{background:'#16a34a'}}>
                <Link to="/products">Shop Now <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" className="rounded-full px-8 bg-white/20 text-white hover:bg-white/30 shadow-lg border-0 backdrop-blur-sm">
                <Link to="/products">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1 py-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-lg md:text-xl font-heading font-bold text-gray-900">{s.value}</span>
                  <span className="text-[11px] text-gray-400 font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Frutify */}
      <section className="py-8 bg-gray-50">
        <div className="container">
          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-1">Why Frutify</p>
            <h2 className="font-heading text-2xl font-bold text-gray-900">Everything You Need, Fresh</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group bg-white rounded-xl p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all duration-200">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-400 transition-colors duration-200">
                    <Icon className="h-5 w-5 text-amber-400 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-800 text-sm mb-0.5">{f.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-8 bg-white">
        <div className="container">
          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-amber-500 mb-1">Reviews</p>
            <h2 className="font-heading text-2xl font-bold text-gray-900">What Our Customers Say</h2>
          </div>
          <div className="max-w-md mx-auto">
            <div className="relative bg-gray-50 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <img
                  src={testimonials[testimonialIdx].avatar}
                  alt={testimonials[testimonialIdx].name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-amber-300"
                />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm max-w-sm leading-relaxed">"{testimonials[testimonialIdx].text}"</p>
                <div>
                  <p className="font-heading font-bold text-gray-800 text-sm">{testimonials[testimonialIdx].name}</p>
                  <p className="text-xs text-gray-400">{testimonials[testimonialIdx].role}</p>
                </div>
              </div>
              <div className="flex justify-center items-center gap-2 mt-4">
                <button onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors shadow-sm">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => setTestimonialIdx(i)} className={`rounded-full transition-all duration-300 ${i === testimonialIdx ? 'bg-amber-400 w-5 h-2' : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'}`} />
                  ))}
                </div>
                <button onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-amber-500 transition-colors shadow-sm">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}