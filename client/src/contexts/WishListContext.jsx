import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'freshveg_wishlist';

function getWishlist() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveWishlist(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(getWishlist);

  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      saveWishlist(updated);
      return updated;
    });
  }, []);

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}