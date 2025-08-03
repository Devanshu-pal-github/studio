'use client';

import { usePathname } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import NavigationBar from '@/components/NavigationBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isAuthPage = ['/login', '/signup'].includes(pathname);
  
  // Show navigation bar for most pages except auth pages
  const showNavigation = !isAuthPage;
  
  // Add padding top for pages with navigation bar
  const addPaddingTop = showNavigation;
  
  // Show sidebar for authenticated pages (dashboard, profile, etc)
  const showSidebar = !['/landing', '/login', '/signup', '/', '/onboarding'].includes(pathname);

  if (showSidebar) {
    return (
      <>
        {showNavigation && <NavigationBar />}
        <MainLayout>{children}</MainLayout>
      </>
    );
  } else {
    return (
      <>
        {showNavigation && <NavigationBar />}
        <div className={addPaddingTop ? 'pt-16' : ''}>{children}</div>
      </>
    );
  }
}
