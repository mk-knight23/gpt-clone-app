/**
 * Unit tests for OpenRouter Adapter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterAdapter } from '@/features/models/adapters/openrouter';
import { ModelRequest, ProviderError, AuthError, RateLimitError } from '@/features/models';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('OpenRouterAdapter', () => {
  let adapter: OpenRouterAdapter;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    vi.stubEnv('VITE_OPENROUTER_API_KEY', mockApiKey);
    adapter = new OpenRouterAdapter();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('initialization', () => {
    it('should initialize with API key from environment', () => {
      expect(adapter.providerId).toBe('openrouter');
      expect(adapter.baseUrl).toBe('https://openrouter.ai/api/v1');
      expect(adapter.apiKey).toBe(mockApiKey);
    });

    it('should throw AuthError when API key is missing', () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', undefined);
      expect(() => new OpenRouterAdapter()).toThrow(AuthError);
    });

    it('should accept custom API key', () => {
      const customKey = 'custom-key';
      const customAdapter = new OpenRouterAdapter(customKey);
      expect(customAdapter.apiKey).toBe(customKey);
    });
  });

  describe('models()', () => {
    it('should fetch available models successfully', async () => {
      const mockModels = {
        data: [
          { id: 'model1', name: 'Model 1' },
          { id: 'model2', name: 'Model 2' }
        ]
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModels)
      });

      const models = await adapter.models();
      expect(models).toEqual(['model1', 'model2']);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );
    });

    it('should handle API errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(adapter.models()).rejects.toThrow(ProviderError);
    });

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(adapter.models()).rejects.toThrow(ProviderError);
    });
  });

  describe('request()', () => {
    const mockRequest: ModelRequest = {
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      temperature: 0.7,
      maxTokens: 100
    };

    it('should send request successfully', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-3.5-turbo',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you?'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await adapter.request(mockRequest);

      expect(result).toEqual({
        text: 'Hello! How can I help you?',
        tokens: {
          input: 10,
          output: 20,
          total: 30
        },
        metadata: {
          model: 'gpt-3.5-turbo',
          provider: 'openrouter',
          finishReason: 'stop',
          usage: mockResponse.usage,
          rateLimit: undefined
        }
      });
    });

    it('should handle authentication errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
      });

      await expect(adapter.request(mockRequest)).rejects.toThrow(AuthError);
    });

    it('should handle rate limit errors', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: 'Rate limit exceeded' } }), {
          status: 429,
          statusText: 'Too Many Requests',
          headers: { 'retry-after': '60' }
        })
      );

      await expect(adapter.request(mockRequest)).rejects.toThrow(RateLimitError);
    });

    it('should retry on server errors', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Success' } }],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
          })
        });

      const result = await adapter.request(mockRequest);
      expect(result.text).toBe('Success');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should transform request correctly', async () => {
      const complexRequest: ModelRequest = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello', attachments: [{ type: 'image', data: 'base64data', name: 'image.png' }] }
        ],
        temperature: 0.8,
        maxTokens: 200,
        model: 'gpt-4'
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Response' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        })
      });

      await adapter.request(complexRequest);

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.model).toBe('gpt-4');
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe('system');
      expect(body.temperature).toBe(0.8);
      expect(body.max_tokens).toBe(200);
    });
  });

  describe('stream()', () => {
    const mockRequest: ModelRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      stream: true
    };

    it('should handle streaming responses', async () => {
      const mockChunks = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n',
        'data: [DONE]\n'
      ];

      const response = new Response(
        new ReadableStream({
          start(controller) {
            mockChunks.forEach(chunk => {
              controller.enqueue(new TextEncoder().encode(chunk));
            });
            controller.close();
          }
        })
      );

      fetchMock.mockResolvedValueOnce(response);

      const onChunk = vi.fn();
      await adapter.stream(mockRequest, onChunk);

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
      expect(onChunk).toHaveBeenNthCalledWith(2, ' world');
    });

    it('should handle streaming errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'retry-after': '60' }),
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      });

      const onChunk = vi.fn();
      await expect(adapter.stream(mockRequest, onChunk)).rejects.toThrow(RateLimitError);
    });
  });

  describe('healthCheck()', () => {
    it('should return healthy status', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'x-ratelimit-remaining': '100',
          'x-ratelimit-reset': '1640995200'
        })
      });

      const health = await adapter.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.latency).toBeGreaterThanOrEqual(0);
      expect(health.lastChecked).toBeInstanceOf(Date);
      expect(health.rateLimit).toEqual({
        remaining: 100,
        resetTime: 1640995200000
      });
    });

    it('should return unhealthy status on error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const health = await adapter.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.error).toBe('Network error');
    });
  });

  describe('capabilities', () => {
    it('should support streaming', () => {
      expect(adapter.supportsStreaming()).toBe(true);
    });

    it('should support attachments', () => {
      expect(adapter.supportsAttachments()).toBe(true);
    });
  });
});
