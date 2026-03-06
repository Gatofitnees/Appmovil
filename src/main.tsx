
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncPersister } from '@/lib/queryPersister';
import { SplashScreen } from '@capacitor/splash-screen';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncPersister }}
      onSuccess={() => {
        setTimeout(async () => {
          try {
            await SplashScreen.hide();
          } catch (e) {
            console.error("Error hiding splash screen:", e);
          }
        }, 50);
      }}
    >
      <App />
      <Toaster />
    </PersistQueryClientProvider>
  </React.StrictMode>
);
