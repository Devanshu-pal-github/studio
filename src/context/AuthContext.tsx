
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const PUBLIC_ROUTES = ['/landing', '/login'];
const ONBOARDING_ROUTE = '/onboarding';

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Effect 1: Handles setting up the Firebase auth listener ONCE.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Effect 2: Handles all routing logic based on auth state and path.
  useEffect(() => {
    // Don't run routing logic until auth state is determined
    if (loading) {
      return;
    }

    if (user) {
      // User is authenticated
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(userDoc => {
        const hasCompletedOnboarding = userDoc.exists() && userDoc.data()?.completedOnboarding;

        if (hasCompletedOnboarding) {
          if (PUBLIC_ROUTES.includes(pathname) || pathname === ONBOARDING_ROUTE) {
            router.push('/');
          }
        } else {
          if (pathname !== ONBOARDING_ROUTE) {
            router.push(ONBOARDING_ROUTE);
          }
        }
      });
    } else {
      // User is not authenticated
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
