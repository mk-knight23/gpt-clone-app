import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DownloadIcon, 
  SmartphoneIcon, 
  WifiIcon, 
  CheckIcon,
  XIcon,
  SparklesIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "installed" | "error">("idle");

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      
      // Show install prompt after a delay if not already installed
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setInstallStatus("installed");
      
      // Track installation
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'app_installed'
        });
      }
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallStatus("installing");
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
        setInstallStatus("idle");
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Error during app installation:', error);
      setInstallStatus("error");
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setShowInstallPrompt(false);
    }
  }, []);

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="glass-card p-3 animate-bounce-in">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">App Installed</p>
              <p className="text-xs text-muted-foreground">CHUTES AI Chat</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in-up">
      <Card className="glass-card w-80 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Install CHUTES AI</CardTitle>
                <CardDescription>Get the full app experience</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="w-6 h-6"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <SmartphoneIcon className="w-4 h-4 text-primary" />
              <span>Works offline</span>
              <Badge variant="secondary" className="text-xs">PWA</Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <DownloadIcon className="w-4 h-4 text-primary" />
              <span>Install on home screen</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <WifiIcon className={cn(
                "w-4 h-4",
                isOnline ? "text-green-500" : "text-orange-500"
              )} />
              <span>{isOnline ? "Online" : "Offline ready"}</span>
            </div>
          </div>

          {/* Install Button */}
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              disabled={installStatus === "installing"}
              className="flex-1 btn-primary"
            >
              {installStatus === "installing" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Installing...
                </>
              ) : (
                <>
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Install App
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="px-3"
            >
              Later
            </Button>
          </div>

          {/* Error State */}
          {installStatus === "error" && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              Installation failed. Please try again.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Service Worker Registration Hook
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg);
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (registration) {
        registration.unregister();
      }
    };
  }, [registration]);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    registration,
    isSupported,
    updateAvailable,
    updateServiceWorker
  };
}
