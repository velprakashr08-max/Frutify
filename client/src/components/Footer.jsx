import {Link} from 'react-router-dom';
import {Leaf,Mail,Phone,MapPin} from 'lucide-react';
export default function Footer(){
  return(
    <footer className="bg-white border-t border-gray-100 text-gray-700">
      <div className="container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="space-y-2 sm:pr-5">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span className="font-heading text-base font-bold text-gray-900">Frutify</span>
            </div>
            <p className="text-xs text-gray-500">
              Farm-fresh organic vegetables delivered right to your doorstep. Quality you can taste.
            </p>
          </div>
          <div className="space-y-2 sm:px-5 pt-3 sm:pt-0">
            <ul className="space-y-1 text-xs text-gray-500">
              <li><Link to="/products" className="hover:text-green-600 transition-colors">All Products</Link></li>
              <li><Link to="/wishlist" className="hover:text-green-600 transition-colors">Wishlist</Link></li>
              <li><Link to="/orders" className="hover:text-green-600 transition-colors">Order History</Link></li>
            </ul>
          </div>
          <div className="space-y-2 sm:pl-5 pt-3 sm:pt-0">
            <ul className="space-y-1 text-xs text-gray-500">
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-green-600" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-green-600" /> hello@frutify.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-green-600" /> 123 Farm Lane, Green City</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>©{new Date().getFullYear()} Frutify.All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>    
      </div>
    </footer>
  );    
}