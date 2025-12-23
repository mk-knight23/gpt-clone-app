import { describe, it, expect } from 'vitest';
import { envSchema } from '@/lib/env';

describe('Environment Validation', () => {
  it('should validate required environment variables', () => {
    // Test with valid environment
    expect(() => {
      envSchema.parse({
        VITE_CHUTES_API_TOKEN: 'test-token'
      });
    }).not.toThrow();
  });

  it('should throw error for missing required variables', () => {
    // Test with missing required variable
    expect(() => {
      envSchema.parse({
        // Missing VITE_CHUTES_API_TOKEN
      });
    }).toThrow();
  });

  it('should handle optional variables correctly', () => {
    const result = envSchema.parse({
      VITE_CHUTES_API_TOKEN: 'test-token',
      VITE_OPENROUTER_API_KEY: 'optional-key'
    });

    expect(result.VITE_OPENROUTER_API_KEY).toBe('optional-key');
  });
});
