'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthService } from '@/lib/sdk';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const login = async () => {
    try {
      const authResponse = await AuthService.loginWithPopup();
      setUser(authResponse.user);
      toast.success('Successfully logged in with Discord!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      if (errorMessage.includes('Popup authentication not supported') || 
          errorMessage.includes('Failed to open popup')) {
        toast.error('Popup blocked. Redirecting to Discord...');
        try {
          await AuthService.loginWithRedirect();
        } catch {
          toast.error('Login failed. Please try again.');
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      toast.success('Successfully logged out');
    } catch {
      toast.error('Logout failed');
    }
  };

  // Handle OAuth redirect callback
  const handleAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const userData = {
            id: payload.user_id,
            username: payload.username,
            avatar: payload.avatar
          };
          
          localStorage.setItem('auth_token', token);
          setUser(userData);
          toast.success('Successfully logged in with Discord!');
        }
      } catch {
        toast.error('Login failed. Please try again.');
      }
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());
    } else if (error) {
      toast.error('Login failed. Please try again.');
      
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Handle redirect callback first
      handleAuthCallback();
      
      // Then check for existing authentication
      if (AuthService.isAuthenticated()) {
        await refreshUser();
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Periodic token validation
  useEffect(() => {
    if (!user) return;

    const checkTokenValidity = () => {
      if (!AuthService.isAuthenticated()) {
        setUser(null);
        toast.info('Session expired. Please log in again.');
      }
    };

    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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