
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/client-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const PUBLIC_ROUTES = ['/landing', '/login', '/signup', '/forgot-password', '/reset-password'];
const ONBOARDING_ROUTE = '/onboarding';

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (loading) return;

    if (user) {
      // User is authenticated
      if (!user.completedOnboarding && pathname !== ONBOARDING_ROUTE) {
        // Force onboarding if not completed
        router.push(ONBOARDING_ROUTE);
      } else if (user.completedOnboarding && PUBLIC_ROUTES.includes(pathname)) {
        // Redirect to dashboard if trying to access public routes when authenticated
        router.push('/dashboard');
      }
    } else {
      // User is not authenticated
      if (!PUBLIC_ROUTES.includes(pathname) && pathname !== ONBOARDING_ROUTE) {
        router.push('/landing');
      }
    }
  }, [user, loading, pathname, router]);

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    if (!userData.completedOnboarding) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/landing');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout
    }}>
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
