import React, { createContext, useContext, useState, useCallback } from 'react';
import { getUser, saveUser } from '@/lib/storage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser);
  const [showLogin, setShowLogin] = useState(false);

  const login = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const isAdmin    = lower === 'admin';
    const role       = ['admin', 'manager', 'delivery', 'warehouse'].includes(lower) ? lower : 'customer';
    const bgColor    = isAdmin ? '27ae60' : lower === 'manager' ? '8b5cf6' : lower === 'delivery' ? 'f59e0b' : lower === 'warehouse' ? 'f97316' : '27ae60';
    const u = {
      name: trimmed,
      isAdmin,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmed)}&background=${bgColor}&color=fff&bold=true`,
    };
    saveUser(u);
    setUser(u);
    setShowLogin(false);
  }, []);

  const logout = useCallback(() => {
    saveUser(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, showLogin, setShowLogin }}>
      {children}
    </AuthContext.Provider>
  );
}