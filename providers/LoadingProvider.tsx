'use client';

import { createContext, useContext, useState } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      <main style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        {children}
      </main>
    </LoadingContext.Provider>
  );
}