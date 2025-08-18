
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/client-auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
}

const PUBLIC_ROUTES = ['/', '/landing', '/login', '/signup', '/forgot-password', '/reset-password'];
const ONBOARDING_ROUTE = '/onboarding';
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/onboarding'];

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: async () => {},
  logout: async () => {},
  verifyToken: async () => false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Debug logging
  useEffect(() => {
    console.log('🔍 AuthContext Debug:', {
      user: user ? { id: user._id, name: user.name, completedOnboarding: user.completedOnboarding } : 'not authenticated',
      loading,
      pathname,
      isPublicRoute: PUBLIC_ROUTES.includes(pathname),
      isProtectedRoute: PROTECTED_ROUTES.includes(pathname)
    });
  }, [user, loading, pathname]);

  // Verify JWT token with server
  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch('/api/auth/verify-simple', {
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

    console.log('🚀 Routing Logic:', { user: !!user, pathname, loading });

    // If user is not authenticated and trying to access protected route
    if (!user && PROTECTED_ROUTES.includes(pathname)) {
      console.log('❌ Redirecting to login for protected route:', pathname);
      router.push('/login');
      return;
    }

    // If user is authenticated and on public auth pages, redirect appropriately
    if (user && (pathname === '/login' || pathname === '/signup')) {
      if (!user.completedOnboarding) {
        console.log('📝 Redirecting authenticated user to onboarding');
        router.push('/onboarding');
      } else {
        console.log('📊 Redirecting authenticated user to dashboard');
        router.push('/dashboard');
      }
      return;
    }
  }, [user, loading, pathname, router]);

  const login = async (userData: User, token: string) => {
    console.log('🔐 Login called with user:', {
      id: userData._id,
      name: userData.name,
      completedOnboarding: userData.completedOnboarding
    });
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Let the useEffect handle the redirect to avoid double redirects
    console.log('✅ User set in context, useEffect will handle redirect');
  };

  const logout = async () => {
    console.log('🚪 Logout called');
    try {
      // Call logout API to invalidate token on server (optional for simple demo)
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
    console.log('🏠 Redirecting to home after logout');
    router.push('/');
  };

  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    verifyToken
  }), [user, loading]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
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
