/**
 * CHUTES AI Chat v4 - Rate Limiter & Circuit Breaker
 *
 * Implements token bucket algorithm for rate limiting
 * and circuit breaker pattern for fault tolerance
 */

import { ProviderId } from '@/features/models';

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  tokensPerMinute: number;
  burstAllowance?: number; // Allow bursting up to this multiplier
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  recoveryTimeout: number; // Time in ms before attempting recovery
  monitoringPeriod: number; // Time window in ms for failure counting
}

export interface RateLimitState {
  requests: number[];
  tokens: number[];
  lastReset: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttemptTime: number;
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillRate = refillRatePerSecond / 1000; // Convert to per millisecond
  }

  refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  consume(tokens: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  getTimeToNextToken(): number {
    if (this.tokens >= 1) return 0;
    return (1 - this.tokens) / this.refillRate;
  }
}

export class ProviderRateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // Check if a request is allowed
  checkLimit(key: string, tokens: number = 1): { allowed: boolean; resetTime?: number } {
    const bucket = this.getOrCreateBucket(key);

    if (bucket.consume(tokens)) {
      return { allowed: true };
    }

    const resetTime = Date.now() + bucket.getTimeToNextToken();
    return { allowed: false, resetTime };
  }

  // Get current rate limit status
  getStatus(key: string): { remaining: number; resetTime: number; limit: number } {
    const bucket = this.getOrCreateBucket(key);
    return {
      remaining: Math.floor(bucket.getAvailableTokens()),
      resetTime: Date.now() + bucket.getTimeToNextToken(),
      limit: this.config.requestsPerMinute,
    };
  }

  private getOrCreateBucket(key: string): TokenBucket {
    if (!this.buckets.has(key)) {
      // Create bucket for requests per minute
      const capacity = this.config.requestsPerMinute * (this.config.burstAllowance || 1.2);
      const refillRate = this.config.requestsPerMinute / 60; // per second
      this.buckets.set(key, new TokenBucket(capacity, refillRate));
    }
    return this.buckets.get(key)!;
  }

  // Clean up old buckets (optional memory management)
  cleanup(maxAge: number = 3600000): void { // 1 hour default
    const cutoff = Date.now() - maxAge;
    for (const [key, bucket] of this.buckets.entries()) {
      if ((bucket as any).lastRefill < cutoff) {
        this.buckets.delete(key);
      }
    }
  }
}

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
    this.state = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
      nextAttemptTime: 0,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'open') {
      if (Date.now() < this.state.nextAttemptTime) {
        throw new Error('Circuit breaker is open');
      }
      this.state.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failures = 0;
    this.state.state = 'closed';
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.config.failureThreshold) {
      this.state.state = 'open';
      this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
      nextAttemptTime: 0,
    };
  }
}

// Global rate limiter instances per provider
const rateLimiters = new Map<ProviderId, ProviderRateLimiter>();

// Global circuit breakers per provider
const circuitBreakers = new Map<ProviderId, CircuitBreaker>();

export function getProviderRateLimiter(
  providerId: ProviderId,
  config: RateLimitConfig
): ProviderRateLimiter {
  if (!rateLimiters.has(providerId)) {
    rateLimiters.set(providerId, new ProviderRateLimiter(config));
  }
  return rateLimiters.get(providerId)!;
}

export function getProviderCircuitBreaker(
  providerId: ProviderId,
  config: CircuitBreakerConfig
): CircuitBreaker {
  if (!circuitBreakers.has(providerId)) {
    circuitBreakers.set(providerId, new CircuitBreaker(config));
  }
  return circuitBreakers.get(providerId)!;
}

// Utility functions for rate limiting
export async function withRateLimit<T>(
  providerId: ProviderId,
  config: RateLimitConfig,
  key: string,
  operation: () => Promise<T>,
  tokens: number = 1
): Promise<T> {
  const limiter = getProviderRateLimiter(providerId, config);
  const limitCheck = limiter.checkLimit(key, tokens);

  if (!limitCheck.allowed) {
    const resetTime = limitCheck.resetTime!;
    const waitTime = resetTime - Date.now();

    throw new Error(
      `Rate limit exceeded for ${providerId}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
    );
  }

  return operation();
}

// Utility functions for circuit breaker
export async function withCircuitBreaker<T>(
  providerId: ProviderId,
  config: CircuitBreakerConfig,
  operation: () => Promise<T>
): Promise<T> {
  const breaker = getProviderCircuitBreaker(providerId, config);
  return breaker.execute(operation);
}

// Combined rate limiting and circuit breaker
export async function withFaultTolerance<T>(
  providerId: ProviderId,
  rateLimitConfig: RateLimitConfig,
  circuitBreakerConfig: CircuitBreakerConfig,
  key: string,
  operation: () => Promise<T>,
  tokens: number = 1
): Promise<T> {
  // First check rate limit
  const limiter = getProviderRateLimiter(providerId, rateLimitConfig);
  const limitCheck = limiter.checkLimit(key, tokens);

  if (!limitCheck.allowed) {
    const resetTime = limitCheck.resetTime!;
    const waitTime = resetTime - Date.now();

    throw new Error(
      `Rate limit exceeded for ${providerId}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
    );
  }

  // Then execute with circuit breaker
  const breaker = getProviderCircuitBreaker(providerId, circuitBreakerConfig);
  return breaker.execute(operation);
}

// Get rate limit status for UI display
export function getRateLimitStatus(providerId: ProviderId, key: string): {
  remaining: number;
  resetTime: number;
  limit: number;
} | null {
  const limiter = rateLimiters.get(providerId);
  if (!limiter) return null;

  return limiter.getStatus(key);
}

// Get circuit breaker status for UI display
export function getCircuitBreakerStatus(providerId: ProviderId): CircuitBreakerState | null {
  const breaker = circuitBreakers.get(providerId);
  if (!breaker) return null;

  return breaker.getState();
}

// Cleanup function for memory management
export function cleanupRateLimiters(maxAge: number = 3600000): void {
  for (const limiter of rateLimiters.values()) {
    limiter.cleanup(maxAge);
  }
}

// Periodic cleanup (call this in your app initialization)
setInterval(() => {
  cleanupRateLimiters();
}, 300000); // Clean up every 5 minutes
