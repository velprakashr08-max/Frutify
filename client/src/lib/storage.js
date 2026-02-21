import { defaultVegetables, defaultReviews } from '@/data/vegetables';

const KEYS = {
  PRODUCTS: 'freshveg_products',
  CART: 'freshveg_cart',
  USER: 'freshveg_user',
  ORDERS: 'freshveg_orders',
  LOYALTY: 'freshveg_loyalty',
};

export function getLoyalty() {
  const stored = localStorage.getItem(KEYS.LOYALTY);
  return stored ? JSON.parse(stored) : { points: 0, totalEarned: 0, tier: 'Bronze' };
}

export function saveLoyalty(data) {
  localStorage.setItem(KEYS.LOYALTY, JSON.stringify(data));
}

export function addLoyaltyPoints(amount) {
  const data = getLoyalty();
  const earned = Math.floor(amount / 10); // 1 point per ₹10
  data.points += earned;
  data.totalEarned += earned;
  // Tier thresholds
  if (data.totalEarned >= 500) data.tier = 'Platinum';
  else if (data.totalEarned >= 200) data.tier = 'Gold';
  else if (data.totalEarned >= 50) data.tier = 'Silver';
  else data.tier = 'Bronze';
  saveLoyalty(data);
  return earned;
}

export function getProducts() {  
  const stored = localStorage.getItem(KEYS.PRODUCTS);   
  if (stored) return JSON.parse(stored);   
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(defaultVegetables));   
  return defaultVegetables;   
}
   
export function saveProducts(products) {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));   
}

export function getReviews() {   
  const stored = localStorage.getItem('freshveg_reviews');   
  if (stored) return JSON.parse(stored);   
  localStorage.setItem('freshveg_reviews', JSON.stringify(defaultReviews));   
  return defaultReviews;   
}   

export function getCart() {   
  const stored = localStorage.getItem(KEYS.CART);   
  return stored ? JSON.parse(stored) : [];   
}
   
export function saveCart(cart) {
  localStorage.setItem(KEYS.CART, JSON.stringify(cart));   
} 
        
export function getUser() {     
  const stored = localStorage.getItem(KEYS.USER);   
  return stored ? JSON.parse(stored) : null;    
}                     
   
export function saveUser(user) {       
  if (user) localStorage.setItem(KEYS.USER, JSON.stringify(user));      
  else localStorage.removeItem(KEYS.USER);       
}                                       