import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  User, Tractor, ShieldCheck, Truck, Store, Warehouse, LogIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ROLES = [
  { name: 'customer',  label: 'Customer',  icon: User,        desc: 'Shop & track orders'   },
  { name: 'farmer',    label: 'Farmer',    icon: Tractor,     desc: 'List & sell produce'   },
  { name: 'admin',     label: 'Admin',     icon: ShieldCheck, desc: 'Full platform control'  },
  { name: 'delivery',  label: 'Delivery',  icon: Truck,       desc: 'Manage deliveries'     },
  { name: 'manager',   label: 'Manager',   icon: Store,       desc: 'Analytics & reports'   },
  { name: 'warehouse', label: 'Warehouse', icon: Warehouse,   desc: 'Inventory management'  },
];

const ROLE_ROUTES = {
  admin: '/admin',
  manager: '/manager',
  warehouse: '/warehouse',
  farmer: '/farmer',
  delivery: '/delivery',
};

export default function LoginModal({ open, onOpenChange }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [focused, setFocused] = useState(false);

  const doLoginAndNavigate = (userName, role) => {
    login(userName || role);
    setName('');
    onOpenChange(false);
    const route = ROLE_ROUTES[role];
    if (route) navigate(route);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    doLoginAndNavigate(name, selectedRole);
  };

  const activeRole = ROLES.find(r => r.name === selectedRole);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-6 gap-0 rounded-2xl border border-gray-200 shadow-xl bg-white">
        <DialogTitle className="text-xl font-bold text-gray-900 mb-1">
          Welcome to Frutify
        </DialogTitle>
        <p className="text-sm text-gray-500 mb-5">Enter your name and choose your role to get started.</p>

        {/* Role grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {ROLES.map(({ name: rName, label, icon: Icon }) => {
            const active = selectedRole === rName;
            return (
              <button
                key={rName}
                type="button"
                onClick={() => setSelectedRole(rName)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium ${
                  active
                    ? 'border-amber-400 bg-amber-50 text-gray-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-amber-200 hover:bg-amber-50/40'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-amber-500' : 'text-gray-500'}`} />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Role description */}
        {activeRole && (
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-4 text-sm text-gray-700">
            <activeRole.icon className="w-4 h-4 text-gray-500 shrink-0" />
            <span><span className="font-semibold">{activeRole.label}:</span> {activeRole.desc}</span>
          </div>
        )}

        {/* Name input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name..."
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            required
            className={`w-full h-11 px-4 rounded-xl border-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
              focused ? 'border-amber-400 shadow-sm shadow-amber-100' : 'border-gray-200'
            }`}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            Continue as {activeRole?.label ?? 'Guest'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}