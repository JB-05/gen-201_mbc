'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useLoading } from '@/providers/LoadingProvider';

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setIsLoading } = useLoading();

  // Show loading screen only on initial load
  useEffect(() => {
    if (pathname === '/') {
      setIsLoading(true);
    }
  }, []); // Empty dependency array for initial load only

  return <>{children}</>;
}