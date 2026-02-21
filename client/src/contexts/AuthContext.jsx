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
    const isAdmin = trimmed.toLowerCase() === 'admin';
    const u = {
      name: trimmed,
      isAdmin,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmed)}&background=27ae60&color=fff&bold=true`,
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