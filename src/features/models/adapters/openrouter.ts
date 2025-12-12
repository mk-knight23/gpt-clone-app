/**
 * OpenRouter Adapter for CHUTES AI Chat v4
 *
 * Supports models from multiple providers through OpenRouter's unified API:
 * - x-ai/grok-4.1-fast
 * - z-ai/glm-4.5-air
 * - deepseek/deepseek-chat-v3-0324
 * - qwen/qwen3-coder
 * - openai/gpt-oss-20b
 * - google/gemini-2.0-flash-exp
 */

import {
  ModelAdapter,
  ModelRequest,
  ModelResponse,
  ProviderHealth,
  ProviderError,
  RateLimitError,
  AuthError,
  RetryConfig,
} from '../index';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  jitter: true,
};

export class OpenRouterAdapter implements ModelAdapter {
  readonly providerId = 'openrouter';
  readonly baseUrl = 'https://openrouter.ai/api/v1';
  readonly apiKey: string;

  private retryConfig: RetryConfig;

  constructor(apiKey?: string, retryConfig: Partial<RetryConfig> = {}) {
    this.apiKey = apiKey || this.getApiKey();
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  private getApiKey(): string {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!key) {
      throw new AuthError('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY environment variable.');
    }
    return key;
  }

  async models(): Promise<string[]> {
    try {
      const response = await this.makeRequest('/models', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new ProviderError(
          `Failed to fetch models: ${response.statusText}`,
          'models_fetch_failed',
          'server',
          true,
          response.status
        );
      }

      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(
        `Network error fetching models: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'network_error',
        'network',
        true
      );
    }
  }

  async request(params: ModelRequest): Promise<ModelResponse> {
    return this.withRetry(async () => {
      const openRouterRequest = this.transformRequest(params);

      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openRouterRequest),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return this.transformResponse(data, params.model);
    });
  }

  async stream(
    params: ModelRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return this.withRetry(async () => {
      const openRouterRequest = {
        ...this.transformRequest(params),
        stream: true,
      };

      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openRouterRequest),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new ProviderError(
          'Response body is not readable',
          'stream_error',
          'server',
          true
        );
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                // Skip invalid JSON
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    });
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      const response = await this.makeRequest('/models', {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        return {
          status: 'unhealthy',
          latency,
          lastChecked: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Check rate limit headers
      const remaining = response.headers.get('x-ratelimit-remaining');
      const resetTime = response.headers.get('x-ratelimit-reset');

      return {
        status: 'healthy',
        latency,
        lastChecked: new Date(),
        rateLimit: remaining ? {
          remaining: parseInt(remaining),
          resetTime: resetTime ? parseInt(resetTime) * 1000 : undefined,
        } : undefined,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/auth/key', {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getRateLimit(): Promise<{ remaining: number; resetTime?: number }> {
    try {
      const response = await this.makeRequest('/auth/key', {
        method: 'GET',
      });

      const remaining = response.headers.get('x-ratelimit-remaining');
      const resetTime = response.headers.get('x-ratelimit-reset');

      return {
        remaining: remaining ? parseInt(remaining) : 0,
        resetTime: resetTime ? parseInt(resetTime) * 1000 : undefined,
      };
    } catch {
      return { remaining: 0 };
    }
  }

  supportsStreaming(): boolean {
    return true;
  }

  supportsAttachments(): boolean {
    return true; // OpenRouter supports vision models
  }

  private transformRequest(params: ModelRequest): any {
    const messages = params.messages.map(msg => ({
      role: msg.role,
      content: msg.attachments?.length
        ? [
            { type: 'text', text: msg.content },
            ...msg.attachments.map(att => ({
              type: att.type === 'image' ? 'image_url' : 'text',
              image_url: att.type === 'image' ? { url: att.data || att.url } : undefined,
              text: att.type !== 'image' ? att.data || att.name : undefined,
            })),
          ]
        : msg.content,
    }));

    return {
      model: params.model || 'openai/gpt-4o-mini', // default fallback
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1024,
      top_p: params.topP ?? 0.9,
      frequency_penalty: params.frequencyPenalty ?? 0,
      presence_penalty: params.presencePenalty ?? 0,
      stream: false, // handled separately in stream method
    };
  }

  private transformResponse(data: any, requestedModel?: string): ModelResponse {
    const choice = data.choices?.[0];
    if (!choice) {
      throw new ProviderError(
        'Invalid response format from OpenRouter',
        'invalid_response',
        'server',
        false
      );
    }

    const usage = data.usage;
    const rateLimit = this.extractRateLimit(data);

    return {
      text: choice.message?.content || '',
      tokens: usage ? {
        input: usage.prompt_tokens || 0,
        output: usage.completion_tokens || 0,
        total: usage.total_tokens || 0,
      } : undefined,
      metadata: {
        model: data.model || requestedModel || 'unknown',
        provider: 'openrouter',
        finishReason: choice.finish_reason,
        usage: data.usage,
        rateLimit,
      },
    };
  }

  private extractRateLimit(data: any): ModelResponse['metadata']['rateLimit'] {
    // OpenRouter includes rate limit info in response headers, but for now we'll use defaults
    return undefined;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse errors
    }

    const message = errorData.error?.message || response.statusText;
    const code = errorData.error?.code || `http_${response.status}`;

    if (response.status === 401 || response.status === 403) {
      throw new AuthError(message);
    }

    if (response.status === 429) {
      const resetTime = response.headers.get('retry-after');
      throw new RateLimitError(message, resetTime ? parseInt(resetTime) * 1000 : undefined);
    }

    if (response.status >= 500) {
      throw new ProviderError(message, code, 'server', true, response.status);
    }

    throw new ProviderError(message, code, 'unknown', false, response.status);
  }

  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    // Handle server-side rendering and testing environments
    const referer = typeof window !== 'undefined' && window.location
      ? window.location.origin
      : 'https://chutes-ai.dev';

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': 'CHUTES AI Chat v4',
        ...options.headers,
      },
    });
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry non-retryable errors
        if (error instanceof ProviderError && !error.retryable) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const baseDelay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1);
        const jitter = this.retryConfig.jitter ? Math.random() * 0.1 * baseDelay : 0;
        const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}
