import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold">Frutify</span>
            </div>
            <p className="text-sm text-background/60">
              Farm-fresh organic vegetables delivered right to your doorstep. Quality you can taste.
            </p>
          </div>
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">Order History</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Contact Us</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> hello@frutify.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 123 Farm Lane, Green City</li>
            </ul>
          </div>

        </div>
        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-background/40">
          <p>© {new Date().getFullYear()} Frutify. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}