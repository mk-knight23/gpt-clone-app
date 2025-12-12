import React, { createContext, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  EyeIcon, 
  KeyboardIcon, 
  Volume2Icon, 
  SettingsIcon,
  XIcon,
  CheckIcon,
  AlertCircleIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindFriendly: boolean;
  voiceCommands: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceToScreenReader: (message: string) => void;
  focusElement: (selector: string) => void;
  skipToContent: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindFriendly: false,
    voiceCommands: false
  });

  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chutes-accessibility-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error);
      }
    }

    // Detect system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    // Check for screen reader
    const isScreenReader = window.navigator.userAgent.includes('NVDA') || 
                          window.navigator.userAgent.includes('JAWS') ||
                          window.speechSynthesis;
    if (isScreenReader) {
      setSettings(prev => ({ ...prev, screenReader: true }));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Color blind friendly
    if (settings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }

    // Save settings
    localStorage.setItem('chutes-accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard navigation
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A: Open accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowAccessibilityPanel(true);
      }

      // Alt + C: Skip to content
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        skipToContent();
      }

      // Escape: Close panels
      if (e.key === 'Escape') {
        setShowAccessibilityPanel(false);
      }

      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [settings.keyboardNavigation]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announceToScreenReader = (message: string) => {
    // Create announcement element
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    // Also add to announcements array for debugging
    setAnnouncements(prev => [...prev.slice(-4), message]);
  };

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const skipToContent = () => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Skipped to main content');
    }
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    focusElement,
    skipToContent
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Accessibility Panel */}
      {showAccessibilityPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 glass-card animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Accessibility Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAccessibilityPanel(false)}
                  aria-label="Close accessibility panel"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">High Contrast</span>
                  </div>
                  <Button
                    variant={settings.highContrast ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('highContrast', !settings.highContrast)}
                    aria-pressed={settings.highContrast}
                  >
                    {settings.highContrast ? <CheckIcon className="w-4 h-4" /> : 'Off'}
                  </Button>
                </div>

                {/* Large Text */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Large Text</span>
                  </div>
                  <Button
                    variant={settings.largeText ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('largeText', !settings.largeText)}
                    aria-pressed={settings.largeText}
                  >
                    {settings.largeText ? <CheckIcon className="w-4 h-4" /> : 'Off'}
                  </Button>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Reduced Motion</span>
                  </div>
                  <Button
                    variant={settings.reducedMotion ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                    aria-pressed={settings.reducedMotion}
                  >
                    {settings.reducedMotion ? <CheckIcon className="w-4 h-4" /> : 'Off'}
                  </Button>
                </div>

                {/* Focus Indicators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyboardIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Enhanced Focus</span>
                  </div>
                  <Button
                    variant={settings.focusIndicators ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('focusIndicators', !settings.focusIndicators)}
                    aria-pressed={settings.focusIndicators}
                  >
                    {settings.focusIndicators ? <CheckIcon className="w-4 h-4" /> : 'Off'}
                  </Button>
                </div>

                {/* Color Blind Friendly */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Color Blind Friendly</span>
                  </div>
                  <Button
                    variant={settings.colorBlindFriendly ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('colorBlindFriendly', !settings.colorBlindFriendly)}
                    aria-pressed={settings.colorBlindFriendly}
                  >
                    {settings.colorBlindFriendly ? <CheckIcon className="w-4 h-4" /> : 'Off'}
                  </Button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><kbd className="px-1 py-0.5 bg-muted rounded">Alt + A</kbd> Open this panel</p>
                  <p><kbd className="px-1 py-0.5 bg-muted rounded">Alt + C</kbd> Skip to content</p>
                  <p><kbd className="px-1 py-0.5 bg-muted rounded">Tab</kbd> Navigate elements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accessibility Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-40 glass-card"
        onClick={() => setShowAccessibilityPanel(true)}
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Alt + A)"
      >
        <SettingsIcon className="w-4 h-4" />
      </Button>

      {/* Screen Reader Announcements (for debugging) */}
      {process.env.NODE_ENV === 'development' && announcements.length > 0 && (
        <div className="fixed top-4 right-4 z-40 max-w-sm">
          <Card className="glass-card">
            <CardContent className="p-3">
              <h3 className="text-sm font-medium mb-2">Screen Reader Announcements</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {announcements.map((announcement, index) => (
                  <div key={index} className="text-xs text-muted-foreground p-1 bg-muted/50 rounded">
                    {announcement}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AccessibilityContext.Provider>
  );
}

// Skip to content link component
export function SkipToContent() {
  const { skipToContent } = useAccessibility();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
      onClick={(e) => {
        e.preventDefault();
        skipToContent();
      }}
    >
      Skip to main content
    </a>
  );
}

// Focus trap component for modals
interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  onEscape?: () => void;
}

export function FocusTrap({ children, active, onEscape }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      } else if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscape]);

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
}