import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Dialog,DialogContent,DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Leaf,LogIn,Crown,Package,Warehouse,Truck,ShoppingBag,Sprout,ArrowRight} from 'lucide-react';
import {useAuth} from '@/contexts/AuthContext';
const DEMO_ACCOUNTS =[
  { name:'admin',label:'Admin',desc:'Full control',icon: Crown,color:'text-purple-600',bg:'bg-purple-50',ring:'ring-purple-200',dot:'bg-purple-400'},
  { name:'manager',label:'Manager',desc:'Analytics',icon: Package,color:'text-blue-600',bg:'bg-blue-50',ring:'ring-blue-200',dot:'bg-blue-400'},
  { name:'warehouse',label:'Warehouse',desc:'Inventory',icon: Warehouse,color:'text-amber-600',bg:'bg-amber-50',ring:'ring-amber-200',dot:'bg-amber-400'},
  { name:'delivery',label:'Delivery',desc:'Orders',icon: Truck,color:'text-emerald-600',bg:'bg-emerald-50',ring:'ring-emerald-200',dot:'bg-emerald-400'},
];
const ROLE_ROUTES ={admin:'/admin',manager:'/manager',warehouse:'/warehouse',delivery:'/delivery'};
export default function LoginModal({open,onOpenChange}){
  const {login} =useAuth();
  const navigate=useNavigate();
  const [name,setName]=useState('');
  const [focused,setFocused]=useState(false);
  const doLoginAndNavigate=(accountName)=>{
    login(accountName);
    setName('');
    onOpenChange(false);
    const lower =accountName.trim().toLowerCase();
    const route =ROLE_ROUTES[lower];
    if (route) navigate(route);
  };
  const handleSubmit =(e)=>{
    e.preventDefault();
    if (!name.trim()) return;
    doLoginAndNavigate(name);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 rounded-3xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Login to Frutify</DialogTitle>
        <div className="relative overflow-hidden bg-linear-to-br from-green-700 via-green-600 to-emerald-500 px-8 pt-8 pb-10">
          <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute top-2 right-8 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-black/10" />
          <Leaf className="absolute top-4 right-12 h-8 w-8 text-white/10 rotate-45" />
          <Sprout className="absolute bottom-8 right-4 h-12 w-12 text-white/10 -rotate-12" />
          <Leaf className="absolute top-10 right-3 h-5 w-5 text-white/15 -rotate-30" />
          <Leaf className="absolute bottom-4 left-16 h-6 w-6 text-white/10 rotate-12" />
          <div className="relative z-10 flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-white"/>
            </div>
            <div>
              <p className="text-white font-extrabold text-xl leading-none tracking-tight">Frutify</p>
              <p className="text-green-200 text-xs mt-0.5 font-medium">Farm-fresh · Organic · Fast delivery</p>
            </div>
          </div>
          <div className="relative z-10 space-y-1">
            <h2 className="text-white font-extrabold text-2xl leading-tight">Welcome back! 👋</h2>
            <p className="text-green-100/80 text-sm">Sign in to start fresh shopping</p>
          </div>
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 24" fill="none" preserveAspectRatio="none">
            <path d="M0 24 Q100 0 200 12 Q300 24 400 8 L400 24 Z" fill="white" />
          </svg>
        </div>
        <div className="bg-white px-7 pt-5 pb-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Your Name</label>
              <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${focused ? 'border-green-500 shadow-sm shadow-green-100' : 'border-gray-100 bg-gray-50'}`}>
                <ShoppingBag className="absolute left-3.5 h-4 w-4 text-gray-300 pointer-events-none" />
                <Input
                  placeholder="Enter your name…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoFocus
                  required
                  className="border-0 bg-transparent pl-10 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 text-gray-800 font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full h-11 rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-green-200 active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4" /> Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">demo accounts</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map(acc => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.name}
                  onClick={() => doLoginAndNavigate(acc.name)}
                  className={`group relative flex items-center gap-2.5 p-3 rounded-2xl border-2 border-transparent ring-1 ${acc.ring} ${acc.bg} hover:border-current hover:shadow-md transition-all duration-200 text-left active:scale-95`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center shrink-0 ${acc.color} shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold leading-none ${acc.color}`}>{acc.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-none">{acc.desc}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${acc.dot} shrink-0`} />
                </button>
              );
            })}
          </div>
          <button
            onClick={() => doLoginAndNavigate('Guest')}
            className="w-full py-2.5 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-medium hover:border-green-300 hover:text-green-600 hover:bg-green-50/50 transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <Leaf className="h-3.5 w-3.5" /> Continue as Guest
          </button>
          <p className="text-center text-[10px] text-gray-300 font-medium">No password required · Demo app</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}