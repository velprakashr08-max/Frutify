import React, {createContext,useContext,useState,useCallback } from 'react';
import {getCart,saveCart} from'@/lib/storage';
const CartContext=createContext(null);
export const useCart=()=>useContext(CartContext);
export function CartProvider({children}) {
  const[items,setItems]=useState(getCart);
  const[showCart,setShowCart]=useState(false);

  const addItem=useCallback((productId,qty=1) => {
    setItems(prev => {
      const exists=prev.find(i =>i.productId===productId);
      const updated=exists
        ? prev.map(i=>i.productId===productId ? {...i,quantity:i.quantity + qty}:i)
        : [...prev,{productId,quantity:qty }];
      saveCart(updated);
      return updated;
    });
  }, []);

  const removeItem=useCallback((productId)=>{
    setItems(prev=>{
      const u=prev.filter(i=>i.productId !== productId);
      saveCart(u);
      return u;
    });
  },[]);

  const updateQty =useCallback((productId,qty) => {
    if (qty<= 0) return;
    setItems(prev=> {
      const u=prev.map(i =>i.productId === productId ?{...i,quantity:qty}:i);
      saveCart(u);
      return u;
    });
  },[]);

  const clearCart =useCallback(()=>{
    setItems([]);
    saveCart([]);
  },[]);

  const totalItems =items.reduce((s,i) =>s +i.quantity,0);

  return (
    <CartContext.Provider value={{items,addItem,removeItem,updateQty,clearCart,totalItems,showCart,setShowCart}}>
      {children}
    </CartContext.Provider>
  );
}