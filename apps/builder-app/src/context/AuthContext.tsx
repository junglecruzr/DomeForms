import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@domeforms/core';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ user: any; token: string }>;
  register: (name: string, email: string, password: string) => Promise<{ user: any; token: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await api.getMe(savedToken);
          setUser(res.user);
        } catch {
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data; // Return the data so it can be used with .then()
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register({ name, email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data; // Return the data so it can be used with .then()
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe(token || undefined);
      setUser(res.user);
    } catch {
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
