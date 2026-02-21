import React, { createContext, useContext, useState, useCallback } from 'react';
import { getProducts, saveProducts, getReviews } from '@/lib/storage';

const ProductContext = createContext(null);
export const useProducts = () => useContext(ProductContext);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(getProducts);
  const [reviews, setReviews] = useState(getReviews);

  const addProduct = useCallback((p) => {
    setProducts(prev => {
      const u = [...prev, p];
      saveProducts(u);
      return u;
    });
  }, []);

  const updateProduct = useCallback((p) => {
    setProducts(prev => {
      const u = prev.map(x => x.id === p.id ? p : x);
      saveProducts(u);
      return u;
    });
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => {
      const u = prev.filter(x => x.id !== id);
      saveProducts(u);
      return u;
    });
  }, []);

  const addReview = useCallback((r) => {
    setReviews(prev => {
      const u = [...prev, r];
      localStorage.setItem('freshveg_reviews', JSON.stringify(u));
      return u;
    });
  }, []);

  const refresh = useCallback(() => setProducts(getProducts()), []);

  return (
    <ProductContext.Provider value={{ products, reviews, addProduct, updateProduct, deleteProduct, addReview, refresh }}>
      {children}
    </ProductContext.Provider>
  );
}