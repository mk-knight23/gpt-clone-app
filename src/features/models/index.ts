/**
 * CHUTES AI Chat v4 - Model Adapter Layer
 *
 * Unified interface for multiple AI providers with:
 * - Normalized request/response shapes
 * - Provider-specific error handling
 * - Rate limiting and retry logic
 * - Streaming support
 * - Health monitoring
 */

export interface ModelRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    attachments?: Array<{
      type: 'image' | 'document' | 'code' | 'other';
      url?: string;
      data?: string; // base64 for images
      name: string;
      mimeType?: string;
    }>;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  systemPrompt?: string;
  model?: string; // provider-specific model ID
}

export interface ModelResponse {
  text: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  metadata?: {
    model: string;
    provider: string;
    finishReason?: string;
    usage?: any;
    rateLimit?: {
      remaining: number;
      resetTime?: number;
      limit?: number;
    };
  };
  error?: {
    code: string;
    message: string;
    type: 'rate_limit' | 'auth' | 'server' | 'network' | 'validation' | 'unknown';
    retryable: boolean;
  };
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  latency?: number; // in milliseconds
  lastChecked: Date;
  error?: string;
  rateLimit?: {
    remaining: number;
    resetTime?: number;
  };
}

export interface ModelAdapter {
  readonly providerId: string;
  readonly baseUrl: string;
  readonly apiKey: string;

  // Core methods
  models(): Promise<string[]>;
  request(params: ModelRequest): Promise<ModelResponse>;
  stream?(params: ModelRequest, onChunk: (chunk: string) => void): Promise<void>;
  healthCheck(): Promise<ProviderHealth>;

  // Optional capabilities
  validateApiKey?(): Promise<boolean>;
  getRateLimit?(): Promise<{ remaining: number; resetTime?: number }>;
  supportsStreaming?(): boolean;
  supportsAttachments?(): boolean;
}

// Provider configuration
export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKeyEnvVar: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    maxTokens: number;
    capabilities: string[];
    pricing?: {
      input: number; // per 1K tokens
      output: number;
    };
  }>;
  features: {
    streaming: boolean;
    attachments: boolean;
    functionCalling: boolean;
    vision: boolean;
  };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    tokensPerMinute: number;
  };
}

// Model registry entry
export interface ModelRegistryEntry {
  id: string;
  name: string;
  provider: string;
  providerId: string;
  description: string;
  contextWindow: number;
  maxTokens: number;
  capabilities: string[];
  status: 'available' | 'maintenance' | 'deprecated';
  pricing?: {
    input: number;
    output: number;
  };
  icon: string; // lucide icon name
  tags: string[];
  priority: number; // for fallback ordering
}

// Error types
export class ProviderError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: ModelResponse['error']['type'],
    public retryable: boolean = false,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(message: string, public resetTime?: number) {
    super(message, 'rate_limit_exceeded', 'rate_limit', true);
    this.name = 'RateLimitError';
  }
}

export class AuthError extends ProviderError {
  constructor(message: string) {
    super(message, 'authentication_failed', 'auth', false);
    this.name = 'AuthError';
  }
}

// Utility types
export type ProviderId = 'openrouter' | 'megallm' | 'agentrouter' | 'routeway';

export interface StreamingChunk {
  text: string;
  done: boolean;
  metadata?: Partial<ModelResponse['metadata']>;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}
