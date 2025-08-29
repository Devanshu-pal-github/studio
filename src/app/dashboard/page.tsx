'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardClient from '@/components/DashboardClient';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // If not authenticated, redirect to landing page
      router.push('/');
    } else if (!loading && user && !user.completedOnboarding) {
      // If authenticated but onboarding not complete, redirect to onboarding
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

  if (!user) {
    return null; // Will redirect
  }

  // If authenticated, show dashboard
  return <DashboardClient />;
}
