import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';
import { getUser, getRole } from '@/lib/auth';
import type { User } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rt_token') || localStorage.getItem('renttrack_token');
    if (token) {
      apiClient.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('rt_token');
          localStorage.removeItem('renttrack_token');
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    localStorage.setItem('rt_token', response.token);
    localStorage.setItem('renttrack_token', response.token);
    setUser(response.user);
    return response; // Return response for Login.tsx
  };

  const logout = () => {
    localStorage.removeItem('rt_token');
    localStorage.removeItem('renttrack_token');
    localStorage.removeItem('token');
    localStorage.removeItem('renttrack_user');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
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