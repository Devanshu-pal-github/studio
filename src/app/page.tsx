
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingClient from './landing/LandingClient';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // If user is authenticated, check if they've completed onboarding
      // For now, redirect to onboarding (later we can check their profile)
      router.push('/onboarding');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show landing page
  return <LandingClient />;
}
