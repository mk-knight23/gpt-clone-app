/**
 * Vitest setup file
 */

import { vi } from 'vitest';

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: { origin: 'https://test.chutes-ai.dev' },
  writable: true,
});

// Mock crypto for secure storage tests
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      deriveKey: vi.fn(),
    },
    getRandomValues: vi.fn(),
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch globally
global.fetch = vi.fn();
