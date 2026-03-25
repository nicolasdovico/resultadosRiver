'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  roles?: { name: string }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    
    // Set cookie for middleware (expires in 7 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const isPremiumUser = newUser.roles?.some(r => r.name === 'PREMIUM' || r.name === 'SUPER ADMIN') ?? false;
    
    document.cookie = `auth_token=${newToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `user_role=${isPremiumUser ? 'premium' : 'registered'}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    
    router.push('/');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Remove cookies
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    router.push('/auth/login');
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const isPremium = user?.roles?.some(r => r.name === 'PREMIUM' || r.name === 'SUPER ADMIN') ?? false;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
