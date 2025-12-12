// Analytics and Monitoring System for CHUTES AI Chat

export interface AnalyticsEvent {
  name: string;
  category: 'engagement' | 'performance' | 'error' | 'feature' | 'pwa';
  label?: string;
  value?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private events: AnalyticsEvent[] = [];
  private errors: ErrorReport[] = [];
  private sessionId: string;
  private userId?: string;
  private performanceObserver?: PerformanceObserver;
  private isEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceMonitoring();
    this.initializeErrorTracking();
    this.loadStoredData();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  // Event Tracking
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.storeEvent(fullEvent);

    // Send to analytics service if available
    this.sendToAnalyticsService(fullEvent);

    console.log('📊 Analytics Event:', fullEvent);
  }

  // Performance Monitoring
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformanceEntry(entry);
        }
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackEvent({
            name: 'page_load_time',
            category: 'performance',
            value: navigation.loadEventEnd - navigation.fetchStart,
            metadata: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              timeToInteractive: navigation.domInteractive - navigation.fetchStart
            }
          });
        }
      }, 0);
    });
  }

  private trackPerformanceEntry(entry: PerformanceEntry): void {
    const metrics: Partial<PerformanceMetrics> = {};

    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
          this.trackEvent({
            name: 'first_contentful_paint',
            category: 'performance',
            value: entry.startTime
          });
        }
        break;
      case 'largest-contentful-paint':
        metrics.largestContentfulPaint = entry.startTime;
        this.trackEvent({
          name: 'largest_contentful_paint',
          category: 'performance',
          value: entry.startTime
        });
        break;
      case 'first-input':
        metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        this.trackEvent({
          name: 'first_input_delay',
          category: 'performance',
          value: metrics.firstInputDelay
        });
        break;
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          metrics.cumulativeLayoutShift = (entry as any).value;
          this.trackEvent({
            name: 'cumulative_layout_shift',
            category: 'performance',
            value: metrics.cumulativeLayoutShift
          });
        }
        break;
    }
  }

  // Error Tracking
  private initializeErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        severity: 'medium'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'high'
      });
    });

    // Network error tracking
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.trackEvent({
            name: 'api_error',
            category: 'error',
            label: response.status.toString(),
            metadata: {
              url: args[0],
              status: response.status,
              statusText: response.statusText
            }
          });
        }
        return response;
      } catch (error) {
        this.reportError({
          message: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          stack: error instanceof Error ? error.stack : undefined,
          url: typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || 'unknown',
          severity: 'high'
        });
        throw error;
      }
    };
  }

  reportError(errorData: Partial<ErrorReport>): void {
    if (!this.isEnabled) return;

    const error: ErrorReport = {
      id: this.generateErrorId(),
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      url: errorData.url || window.location.href,
      lineNumber: errorData.lineNumber,
      columnNumber: errorData.columnNumber,
      timestamp: new Date(),
      severity: errorData.severity || 'medium',
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: errorData.metadata
    };

    this.errors.push(error);
    this.storeError(error);

    // Send critical errors immediately
    if (error.severity === 'critical') {
      this.sendErrorAlert(error);
    }

    console.error('🚨 Error Report:', error);
  }

  // Feature Usage Tracking
  trackFeatureUsage(feature: string, action: 'used' | 'completed' | 'failed', metadata?: Record<string, any>): void {
    this.trackEvent({
      name: `feature_${feature}_${action}`,
      category: 'feature',
      label: feature,
      metadata
    });
  }

  trackChatInteraction(action: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      name: `chat_${action}`,
      category: 'engagement',
      metadata
    });
  }

  trackPWAEvent(event: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      name: `pwa_${event}`,
      category: 'pwa',
      metadata
    });
  }

  // User Session Management
  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('chutes-analytics-user-id', userId);
  }

  // Data Management
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private storeEvent(event: AnalyticsEvent): void {
    try {
      const stored = localStorage.getItem('chutes-analytics-events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem('chutes-analytics-events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  private storeError(error: ErrorReport): void {
    try {
      const stored = localStorage.getItem('chutes-analytics-errors');
      const errors = stored ? JSON.parse(stored) : [];
      errors.push(error);
      
      // Keep only last 100 errors
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }
      
      localStorage.setItem('chutes-analytics-errors', JSON.stringify(errors));
    } catch (error) {
      console.warn('Failed to store error report:', error);
    }
  }

  private loadStoredData(): void {
    try {
      const storedEvents = localStorage.getItem('chutes-analytics-events');
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }

      const storedErrors = localStorage.getItem('chutes-analytics-errors');
      if (storedErrors) {
        this.errors = JSON.parse(storedErrors);
      }

      const storedUserId = localStorage.getItem('chutes-analytics-user-id');
      if (storedUserId) {
        this.userId = storedUserId;
      }
    } catch (error) {
      console.warn('Failed to load stored analytics data:', error);
    }
  }

  // Analytics Service Integration
  private sendToAnalyticsService(event: AnalyticsEvent): void {
    // Google Analytics 4 integration
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', event.name, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_map: event.metadata
      });
    }

    // Custom analytics endpoint
    if (process.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(process.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(error => {
        console.warn('Failed to send analytics event:', error);
      });
    }
  }

  private sendErrorAlert(error: ErrorReport): void {
    // Send critical errors to monitoring service
    if (process.env.VITE_ERROR_MONITORING_ENDPOINT) {
      fetch(process.env.VITE_ERROR_MONITORING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      }).catch(error => {
        console.warn('Failed to send error alert:', error);
      });
    }
  }

  // Public API
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getSessionStats(): {
    totalEvents: number;
    totalErrors: number;
    sessionDuration: number;
    errorRate: number;
  } {
    const now = Date.now();
    const sessionStart = parseInt(this.sessionId.split('-')[1]);
    const sessionDuration = now - sessionStart;

    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() > sessionStart
    );

    const recentErrors = this.errors.filter(error => 
      new Date(error.timestamp).getTime() > sessionStart
    );

    return {
      totalEvents: recentEvents.length,
      totalErrors: recentErrors.length,
      sessionDuration,
      errorRate: recentEvents.length > 0 ? (recentErrors.length / recentEvents.length) * 100 : 0
    };
  }

  clearData(): void {
    this.events = [];
    this.errors = [];
    localStorage.removeItem('chutes-analytics-events');
    localStorage.removeItem('chutes-analytics-errors');
  }

  exportData(): string {
    return JSON.stringify({
      events: this.events,
      errors: this.errors,
      sessionId: this.sessionId,
      userId: this.userId,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  disable(): void {
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
  }
}

export const analytics = AnalyticsManager.getInstance();

// React Hook for Analytics
export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackChatInteraction: analytics.trackChatInteraction.bind(analytics),
    trackPWAEvent: analytics.trackPWAEvent.bind(analytics),
    reportError: analytics.reportError.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getEvents: analytics.getEvents.bind(analytics),
    getErrors: analytics.getErrors.bind(analytics),
    getSessionStats: analytics.getSessionStats.bind(analytics),
    exportData: analytics.exportData.bind(analytics)
  };
}