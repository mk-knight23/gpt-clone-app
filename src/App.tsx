import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstaller, useServiceWorker } from "@/components/PWAInstaller";
import { AccessibilityProvider, SkipToContent } from "@/components/AccessibilityProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// PWA Update Notification Component
function PWAUpdateNotification() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (updateAvailable) {
      // Show update notification
      const shouldUpdate = window.confirm(
        'A new version of CHUTES AI Chat is available. Would you like to update now?'
      );
      
      if (shouldUpdate) {
        updateServiceWorker();
      }
    }
  }, [updateAvailable, updateServiceWorker]);

  return null;
}

const App = () => {
  const { isSupported } = useServiceWorker();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <SkipToContent />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          
          {/* PWA Components */}
          {isSupported && (
            <>
              <PWAInstaller />
              <PWAUpdateNotification />
            </>
          )}
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
