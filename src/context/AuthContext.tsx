import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, 'displayName' | 'bio' | 'status' | 'profileImage'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('akyva_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('akyva_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('akyva_auth_expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('akyva_token');
      if (storedToken) {
        try {
          const profile = await userApi.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('akyva_token');
          localStorage.removeItem('akyva_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ usernameOrEmail, password });
      localStorage.setItem('akyva_token', res.token);
      localStorage.setItem('akyva_refresh_token', res.refreshToken);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, displayName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ username, displayName, email, password });
      localStorage.setItem('akyva_token', res.token);
      localStorage.setItem('akyva_refresh_token', res.refreshToken);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('akyva_token');
    localStorage.removeItem('akyva_refresh_token');
    localStorage.removeItem('akyva_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<Pick<User, 'displayName' | 'bio' | 'status' | 'profileImage'>>) => {
    const updated = await userApi.updateMe(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
