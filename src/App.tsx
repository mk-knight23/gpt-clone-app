import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstaller, useServiceWorker } from "@/components/PWAInstaller";
import { AccessibilityProvider, SkipToContent } from "@/components/AccessibilityProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Initialize React Query client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * PWA Update Notification Component
 */
function PWAUpdateNotification() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (updateAvailable) {
      const shouldUpdate = window.confirm(
        'A new version of AI Chat is available. Would you like to update now?'
      );

      if (shouldUpdate) {
        updateServiceWorker();
      }
    }
  }, [updateAvailable, updateServiceWorker]);

  return null;
}

/**
 * AI Chat Application - Multi-Provider AI Platform
 * 
 * Production-ready app with:
 * - Multiple AI Providers (OpenRouter integration)
 * - Real-time streaming
 * - Clean interface
 * - PWA support
 */
const App = () => {
  const { isSupported } = useServiceWorker();

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <SkipToContent />
        <Toaster />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {isSupported && (
          <>
            <PWAInstaller />
            <PWAUpdateNotification />
          </>
        )}
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};

export default App;
