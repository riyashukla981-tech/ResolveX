// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, enrollment_number?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, enrollment_number: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'rx_token';
const USER_KEY = 'rx_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (token && userRaw) {
      try {
        const user: User = JSON.parse(userRaw);
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string, enrollment_number?: string) => {
    try {
      const { data } = await api.post('/auth/login', { email: email || undefined, enrollment_number: enrollment_number || undefined, password });
      if (data.success) {
        const { user, token } = data.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  }, []);

  const register = useCallback(async (name: string, enrollment_number: string, email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/register', { name, enrollment_number, email, password });
      if (data.success) {
        const { user, token } = data.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setState({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Registration failed.',
      };
    }
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};