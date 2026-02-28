import {useState, useEffect} from 'react';
import {Link, useLocation, useSearchParams} from 'react-router-dom';
import {ShoppingCart,User,LogOut,Menu,X,Leaf,Heart,Crown,BarChart3,Package,ShieldAlert,Warehouse,Truck} from 'lucide-react';
import {useAuth} from '@/contexts/AuthContext';
import {useCart} from '@/contexts/CartContext';
import {useWishlist} from '@/contexts/WishlistContext';
import {useProducts} from '@/contexts/ProductContext';
import {Button} from '@/components/ui/button';
import LoginModal from '@/components/LoginModal';
import CartSidebar from '@/components/CartSidebar';
import PageTransition from '@/components/PageTransition';
const INTERNAL_ROUTES =['/admin','/manager','/warehouse','/delivery'];
const SIDEBAR_NAV ={
  admin: [
    {key:'overview',icon:BarChart3,label:'Overview'},
    {key:'products',icon:Package,label:'Products'},
    {key:'alerts',icon:ShieldAlert,label:'Alerts'},
  ],
  manager: [
    { key:'overview',icon:BarChart3,label:'Overview' },
    { key:'catalog',icon:Package,label:'Catalog'  },
  ],
  warehouse:[{key:null,icon:Warehouse,label:'Inventory'}],
  delivery:[{key:null,icon:Truck,label:'My Orders'}],
};
const ROLE_TITLE ={
  admin:'Admin Panel',
  manager:'Manager',
  warehouse:'Warehouse',
  delivery:'Delivery',
};
const TAB_LABELS ={
  overview:'Overview',
  products:'Products',
  alerts:'Stock Alerts',
  catalog:'Catalog',
};
export default function Layout({children}){
  const {user,logout,showLogin,setShowLogin}=useAuth();
  const {totalItems,setShowCart} =useCart();
  const {wishlist}=useWishlist();
  const {products}=useProducts();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [scrolled, setScrolled]=useState(false);
  const location =useLocation();
  const [searchParams]=useSearchParams();
  const activeTab=searchParams.get('tab');
  useEffect(()=>{
    const handleScroll=()=>setScrolled(window.scrollY >20);
    window.addEventListener('scroll',handleScroll, {passive:true });
    return ()=>window.removeEventListener('scroll',handleScroll);
  },[]);
  useEffect(()=>setMobileOpen(false),[location.pathname]);
  const isInternal=INTERNAL_ROUTES.includes(location.pathname);
  const role=user?.isAdmin?'admin':user?.role;
  const sidebarNav=SIDEBAR_NAV[role]||[];
  const roleTitle=ROLE_TITLE[role]||'';
  const pageTitle=TAB_LABELS[activeTab]||sidebarNav[0]?.label||roleTitle;
  const lowStockCount=products?.filter(p=>p.stock<= 5).length ?? 0;
  const roleLabel=user?.isAdmin?'Admin':user?.role==='manager' ?'Manager':user?.role==='warehouse'?'Warehouse':user?.role==='delivery'?'Delivery':'Customer';
  const links = [{to:'/',label:'Home'},{to:'/products',label:'Products'},{to:'/wishlist',label:'Wishlist'},{to:'/orders',label:'Orders'},
    ...(user?.isAdmin?[{to:'/admin',label:'Admin'}]:[]),
    ...(user?.role==='manager'?[{to:'/manager',label:'Manager Dashboard'}]:[]),
    ...(user?.role==='warehouse'?[{to:'/warehouse',label:'Warehouse Dashboard'}]:[]),
    ...(user?.role==='delivery'?[{to:'/delivery',label:'Delivery Dashboard'}]:[]),
  ];
  if (isInternal){
    return(
      <div className="h-screen flex overflow-hidden bg-[#f7f8fa]">
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-100 bg-white">
          <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
            <Leaf className="h-6 w-6 text-green-600"/>
            <span className="font-bold text-gray-900 text-base">Frutify</span>
          </div>
          <nav className="flex-1 py-5 px-3 flex flex-col gap-0.5">
            <p className="text-[10px] font-bold tracking-widest text-green-600 uppercase px-2 mb-2">
              {roleTitle}
            </p>
            {sidebarNav.map(item=>{
              const isActive =item.key ?activeTab===item.key||(!activeTab && item.key ===sidebarNav[0]?.key):true;
              const Icon=item.icon;    
              return(
                <Link
                  key={item.key ?? item.label}
                  to={item.key ? `?tab=${item.key}`:location.pathname}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ?'bg-green-600 text-white shadow-sm':'text-gray-500 hover:bg-green-50 hover:text-green-700'
                  }`}     
                >      
                  <Icon className="h-4 w-4 shrink-0 flex-none" />
                  {item.label}   
                  {item.key ==='alerts' && lowStockCount > 0 &&(
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {lowStockCount}     
                    </span>  
                  )}       
                </Link>   
              );
            })}              
          </nav>      
          {user && (         
            <div className="border-t border-gray-100 p-4">   
              <div className="flex items-center gap-2.5">         
                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full ring-2 ring-gray-100" />
                <div className="flex-1 min-w-0">      
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400">{roleLabel}</p>   
                </div>   
                <button onClick={logout} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
                  <LogOut className="h-4 w-4" />       
                </button>   
              </div>
            </div>    
          )}    
        </aside>
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="hidden lg:flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-10">
            <div>    
              <h1 className="text-base font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-[11px] text-green-600 font-semibold uppercase tracking-wide mt-0.5">{roleTitle}</p>
            </div>    
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {user?.name}     
            </div>    
          </div>
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600"/>
              <span className="font-bold text-gray-900">Frutify</span>
            </div>
            <div className="flex items-center gap-1">
              {sidebarNav.map(item=>{
                const Icon =item.icon;
                const isAct =item.key?activeTab ===item.key ||(!activeTab &&item.key ===sidebarNav[0]?.key):true;
                return (
                  <Link
                    key={item.key ?? item.label}
                    to={item.key ?`?tab=${item.key}`:location.pathname}
                    className={`p-2 rounded-lg transition-colors ${
                      isAct ?'bg-green-600 text-white':'text-gray-400 hover:bg-gray-50'
                    }`}>
                    <Icon className="h-4 w-4" />
                  </Link>);})}
              {user &&(
             <button onClick={logout} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 ml-1">
               <LogOut className="h-4 w-4"/>
              </button>
              )}
            </div>
          </div>
          <div className="flex-1">{children}</div>
        </div>
        <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <header className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled ?'bg-background/95 backdrop-blur-xl shadow-md border-b':'bg-background/80 backdrop-blur-sm border-b border-transparent'
      }`}>
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary transition-transform duration-300 hover:scale-105">
            <Leaf className="h-7 w-7" /> Frutify
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l=>(
              <Link key={l.to} to={l.to}
             className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
              location.pathname === l.to ? 'text-primary bg-primary/10':'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 &&(
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>)}
            </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={()=>user ?setShowCart(true):setShowLogin(true)}
              title={user ?'Shopping Cart':'Login to access cart'}  >
              <ShoppingCart className={`h-5 w-5 ${!user ? 'opacity-50' : ''}`} />
              {user && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold animate-scale-in">
             {totalItems}
              </span>
              )}
            </Button>
            {user ?(
            <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l">
             <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full ring-2 ring-primary/20" />
             <div className="flex flex-col">
             <span className="text-sm font-medium leading-tight">{user.name}</span>
             <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-0.5">
             {user.isAdmin ?<><Crown className="h-3 w-3"/> Admin</>:<><ShoppingCart className="h-3 w-3" />{roleLabel}</>}
            </span>
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}><LogOut className="h-4 w-4"/></Button>
              </div>
            ):(
              <Button size="sm" className="hidden md:inline-flex ml-2 rounded-full" onClick={()=>setShowLogin(true)}>
                <User className="h-4 w-4 mr-1"/> Login
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={()=>setMobileOpen(!mobileOpen)}>
              <div className="relative w-5 h-5">
                <Menu className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                <X className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
              </div>
            </Button>
          </div>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
          mobileOpen ?'max-h-96 border-t' : 'max-h-0'
        }`}>
       <nav className="container py-4 flex flex-col gap-1">
           {links.map(l=>(
        <Link key={l.to} to={l.to} className={`text-sm font-medium py-2.5 px-3 rounded-lg transition-all ${ location.pathname ===l.to ? 'text-primary bg-primary/10':'text-muted-foreground hover:bg-muted' }`}>
       {l.label}
       </Link>))}
        {user ?(
        <div className="flex items-center gap-3 pt-3 mt-2 border-t">
         <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full ring-2 ring-primary/20" />
        <div className="flex-1">
        <span className="text-sm font-medium block">{user.name}</span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
       {user.isAdmin ? <><Crown className="h-3 w-3" /> Admin</>:<><ShoppingCart className="h-3 w-3" /> {roleLabel}</>}
       </span>
       </div>
       <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
       </div>
        ):(
        <Button size="sm" className="mt-2" onClick={()=>setShowLogin(true)}>
       <User className="h-4 w-4 mr-1"/>Login
       </Button>)}
      </nav>
      </div>
      </header>
      <main className="flex-1">
      <PageTransition>{children}</PageTransition>
      </main>
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <CartSidebar/>
    </div>
  );
}
