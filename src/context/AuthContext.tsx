
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/client-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const PUBLIC_ROUTES = ['/', '/landing', '/login', '/signup', '/forgot-password', '/reset-password'];
const ONBOARDING_ROUTE = '/onboarding';
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/onboarding'];

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: () => {},
  logout: () => {},
  verifyToken: async () => false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Debug logging
  useEffect(() => {
    console.log('AuthContext Debug:', {
      user: user ? 'authenticated' : 'not authenticated',
      loading,
      pathname,
      completedOnboarding: user?.completedOnboarding
    });
  }, [user, loading, pathname]);

  // Verify JWT token with server
  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  // Load user and verify token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Verify token with server
          const isValid = await verifyToken();
          if (!isValid) {
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Simple routing logic - only redirect for protected routes when not authenticated
  useEffect(() => {
    if (loading) return;

    // If user is not authenticated and trying to access protected route
    if (!user && PROTECTED_ROUTES.includes(pathname)) {
      console.log('Redirecting to login for protected route:', pathname);
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const login = async (userData: User, token: string) => {
    console.log('Login called with user:', userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Simple redirect logic
    if (!userData.completedOnboarding) {
      console.log('Redirecting to onboarding after login');
      router.push('/onboarding');
    } else {
      console.log('Redirecting to dashboard after login');
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      verifyToken
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
