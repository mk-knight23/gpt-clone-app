import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangleIcon,
  ClockIcon,
  RefreshCwIcon,
  ZapIcon,
  ShieldIcon,
  InfoIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  isBlocked: boolean;
  lastRequestTime: number;
}

interface RateLimitFallbackProps {
  rateLimitInfo: RateLimitInfo;
  onRetry?: () => void;
  onUpgrade?: () => void;
  onWait?: () => void;
  className?: string;
  compact?: boolean;
}

export function RateLimitFallback({
  rateLimitInfo,
  onRetry,
  onUpgrade,
  onWait,
  className,
  compact = false
}: RateLimitFallbackProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<number>(0);
  const [timeUntilRetry, setTimeUntilRetry] = useState<number>(0);
  const [isWaiting, setIsWaiting] = useState(false);

  // Calculate time until reset
  useEffect(() => {
    const calculateTimeUntilReset = () => {
      const now = Date.now();
      const resetTime = rateLimitInfo.resetTime * 1000; // Convert to milliseconds
      const timeLeft = Math.max(0, resetTime - now);
      setTimeUntilReset(Math.ceil(timeLeft / 1000)); // Convert to seconds
    };

    calculateTimeUntilReset();
    const interval = setInterval(calculateTimeUntilReset, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo.resetTime]);

  // Calculate time until retry
  useEffect(() => {
    if (!rateLimitInfo.retryAfter) return;

    const calculateTimeUntilRetry = () => {
      const now = Date.now();
      const retryTime = rateLimitInfo.lastRequestTime + (rateLimitInfo.retryAfter * 1000);
      const timeLeft = Math.max(0, retryTime - now);
      setTimeUntilRetry(Math.ceil(timeLeft / 1000));
    };

    calculateTimeUntilRetry();
    const interval = setInterval(calculateTimeUntilRetry, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo.retryAfter, rateLimitInfo.lastRequestTime]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const usagePercentage = ((rateLimitInfo.limit - rateLimitInfo.remaining) / rateLimitInfo.limit) * 100;

  const getStatusColor = () => {
    if (rateLimitInfo.isBlocked) return 'destructive';
    if (usagePercentage > 90) return 'destructive';
    if (usagePercentage > 70) return 'default';
    return 'secondary';
  };

  const getStatusIcon = () => {
    if (rateLimitInfo.isBlocked) return <XCircleIcon className="w-4 h-4" />;
    if (usagePercentage > 90) return <AlertTriangleIcon className="w-4 h-4" />;
    if (usagePercentage > 70) return <ClockIcon className="w-4 h-4" />;
    return <CheckCircleIcon className="w-4 h-4" />;
  };

  const handleWait = () => {
    setIsWaiting(true);
    onWait?.();

    // Auto-retry when time is up
    if (rateLimitInfo.retryAfter) {
      const retryTime = rateLimitInfo.lastRequestTime + (rateLimitInfo.retryAfter * 1000);
      const waitTime = retryTime - Date.now();

      if (waitTime > 0) {
        setTimeout(() => {
          setIsWaiting(false);
          onRetry?.();
        }, waitTime);
      }
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2 p-2 bg-muted/50 rounded-lg", className)}>
        <AlertTriangleIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Rate limit exceeded</p>
          <p className="text-xs text-muted-foreground">
            {timeUntilReset > 0 ? `Resets in ${formatTime(timeUntilReset)}` : 'Try again'}
          </p>
        </div>
        {timeUntilRetry <= 0 && (
          <Button size="sm" variant="outline" onClick={onRetry} className="h-7">
            <RefreshCwIcon className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
          <ShieldIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <CardTitle className="text-xl">Rate Limit Exceeded</CardTitle>
        <CardDescription>
          You've reached the maximum number of requests allowed in this time period.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Usage Statistics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>API Usage</span>
            <Badge variant={getStatusColor()}>
              {rateLimitInfo.remaining}/{rateLimitInfo.limit}
            </Badge>
          </div>

          <Progress
            value={usagePercentage}
            className={cn(
              "h-2",
              usagePercentage > 90 && "bg-red-100 dark:bg-red-900/20"
            )}
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(usagePercentage)}% used</span>
            <span>
              {getStatusIcon()}
              <span className="ml-1">
                {rateLimitInfo.isBlocked ? 'Blocked' :
                 usagePercentage > 90 ? 'Critical' :
                 usagePercentage > 70 ? 'High' : 'Normal'}
              </span>
            </span>
          </div>
        </div>

        {/* Reset Timer */}
        {timeUntilReset > 0 && (
          <Alert>
            <ClockIcon className="h-4 w-4" />
            <AlertDescription>
              Rate limit resets in <strong>{formatTime(timeUntilReset)}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Retry Timer */}
        {timeUntilRetry > 0 && (
          <Alert>
            <RefreshCwIcon className="h-4 w-4" />
            <AlertDescription>
              You can retry in <strong>{formatTime(timeUntilRetry)}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {timeUntilRetry <= 0 && !isWaiting && (
            <Button onClick={onRetry} className="w-full btn-primary">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Try Again Now
            </Button>
          )}

          {timeUntilRetry > 0 && !isWaiting && (
            <Button onClick={handleWait} variant="outline" className="w-full">
              <ClockIcon className="w-4 h-4 mr-2" />
              Wait and Retry ({formatTime(timeUntilRetry)})
            </Button>
          )}

          {isWaiting && (
            <Button disabled className="w-full">
              <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
              Waiting to retry...
            </Button>
          )}

          {onUpgrade && (
            <Button onClick={onUpgrade} variant="outline" className="w-full">
              <ZapIcon className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>

        {/* Information */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <InfoIcon className="w-4 h-4" />
            <span>Rate limits help ensure fair usage for all users</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Need higher limits? Consider upgrading your plan or contact support.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for managing rate limit state
export function useRateLimit() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    limit: 100,
    remaining: 100,
    resetTime: 0,
    isBlocked: false,
    lastRequestTime: 0
  });

  const updateRateLimit = (headers: Headers) => {
    const limit = parseInt(headers.get('x-ratelimit-limit') || '100');
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '100');
    const resetTime = parseInt(headers.get('x-ratelimit-reset') || '0');
    const retryAfter = parseInt(headers.get('retry-after') || '0');

    setRateLimitInfo({
      limit,
      remaining,
      resetTime,
      retryAfter: retryAfter > 0 ? retryAfter : undefined,
      isBlocked: remaining === 0,
      lastRequestTime: Date.now()
    });
  };

  const isRateLimited = () => {
    return rateLimitInfo.isBlocked || rateLimitInfo.remaining === 0;
  };

  const getTimeUntilRetry = () => {
    if (!rateLimitInfo.retryAfter) return 0;
    const retryTime = rateLimitInfo.lastRequestTime + (rateLimitInfo.retryAfter * 1000);
    return Math.max(0, retryTime - Date.now());
  };

  return {
    rateLimitInfo,
    updateRateLimit,
    isRateLimited,
    getTimeUntilRetry
  };
}
