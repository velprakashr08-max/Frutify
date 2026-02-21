import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Leaf, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginModal({ open, onOpenChange }) {
  const { login } = useAuth();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(name);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <Leaf className="h-6 w-6 text-primary" /> Welcome to Frutify
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Enter your name to start shopping.</p>
          <Input
            placeholder="Your name..."
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            <LogIn className="h-4 w-4 mr-2" /> Continue
          </Button>
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-foreground">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">admin</span><span>Admin Panel</span>
              <span className="font-medium text-foreground">manager</span><span>Store Manager</span>
              <span className="font-medium text-foreground">delivery</span><span>Delivery Agent</span>
              <span className="font-medium text-foreground">warehouse</span><span>Warehouse Staff</span>
              <span className="font-medium text-foreground">any name</span><span>Customer</span>
            </div>
            <p className="text-[10px] text-muted-foreground/70 pt-1">No password required — just type a name and continue.</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}