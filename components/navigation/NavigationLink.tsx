'use client';

import { useRouter } from 'next/navigation';
import { useLoading } from '@/providers/LoadingProvider';

interface NavigationLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: 'link' | 'button';
  onClick?: () => void;
}

export function NavigationLink({ 
  href, 
  className, 
  children, 
  variant = 'link',
  onClick 
}: NavigationLinkProps) {
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    
    // Execute any additional onClick handler
    onClick?.();
    
    // Show loading screen
    setIsLoading(true);
    
    // Small delay to ensure loading screen appears
    await new Promise(resolve => setTimeout(resolve, 50));
    router.push(href);
  };

  const linkClassName = variant === 'button' 
    ? `inline-block ${className}`
    : className;

  return (
    <a href={href} onClick={handleClick} className={linkClassName}>
      {children}
    </a>
  );
}