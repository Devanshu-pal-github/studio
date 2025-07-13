'use client';

import { usePathname } from 'next/navigation';
import MainLayout from '@/components/MainLayout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !['/landing', '/login'].includes(pathname);

  if (showSidebar) {
    return <MainLayout>{children}</MainLayout>;
  } else {
    return <>{children}</>;
  }
}
