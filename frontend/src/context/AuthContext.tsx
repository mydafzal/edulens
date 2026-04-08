'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile, UserRole } from '@/types/edulens';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hasCompletedOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('edulens-user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('edulens-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // Mock login — accepts any credentials
    await new Promise(resolve => setTimeout(resolve, 800));
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newUser: UserProfile = {
      email,
      name,
      role: 'teacher', // default, will be overwritten by role selection
    };
    setUser(newUser);
    localStorage.setItem('edulens-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edulens-user');
    localStorage.removeItem('edulens-chat-history');
    localStorage.removeItem('edulens-role-selected');
    window.location.href = '/';
  };

  const setRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('edulens-user', JSON.stringify(updated));
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('edulens-user', JSON.stringify(updated));
    }
  };

  const hasCompletedOnboarding = !!user?.role && user.role !== 'teacher' || (!!user?.role && !!user?.subjects?.length);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setRole,
        updateProfile,
        hasCompletedOnboarding: !!user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
