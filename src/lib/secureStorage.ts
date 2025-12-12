/**
 * Secure Storage Utilities for CHUTES AI Chat
 *
 * Provides encrypted local storage with AES encryption,
 * secure token management, and data integrity verification.
 */

export interface SecureStorageConfig {
  encryptionKey?: string;
  keyDerivationRounds?: number;
  enableCompression?: boolean;
  maxStorageSize?: number; // in MB
}

export interface StorageItem {
  data: any;
  timestamp: number;
  checksum: string;
  version: string;
  expiresAt?: number;
}

export interface SessionToken {
  token: string;
  userId?: string;
  expiresAt: number;
  permissions: string[];
  metadata?: Record<string, any>;
}

class SecureStorageManager {
  private static instance: SecureStorageManager;
  private config: SecureStorageConfig;
  private encryptionKey: CryptoKey | null = null;
  private isInitialized = false;

  constructor() {
    this.config = {
      keyDerivationRounds: 100000,
      enableCompression: true,
      maxStorageSize: 50 // 50MB
    };
  }

  static getInstance(): SecureStorageManager {
    if (!SecureStorageManager.instance) {
      SecureStorageManager.instance = new SecureStorageManager();
    }
    return SecureStorageManager.instance;
  }

  /**
   * Initialize the secure storage with encryption
   */
  async initialize(password?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Generate or derive encryption key
      if (password) {
        this.encryptionKey = await this.deriveKeyFromPassword(password);
      } else {
        // Use a default key for basic encryption (less secure but functional)
        this.encryptionKey = await this.generateKey();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      throw new Error('Secure storage initialization failed');
    }
  }

  /**
   * Generate a random encryption key
   */
  private async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private async deriveKeyFromPassword(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key using PBKDF2
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('chutes-ai-salt'), // In production, use a random salt
        iterations: this.config.keyDerivationRounds!,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encryptData(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized');
    }

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decryptData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized');
    }

    try {
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Compress data using simple LZ compression (if enabled)
   */
  private compressData(data: string): string {
    if (!this.config.enableCompression) return data;

    // Simple RLE compression for repeated characters
    let compressed = '';
    let count = 1;

    for (let i = 1; i <= data.length; i++) {
      if (data[i] === data[i - 1] && count < 255) {
        count++;
      } else {
        if (count > 3) {
          compressed += `\x00${String.fromCharCode(count)}${data[i - 1]}`;
        } else {
          compressed += data[i - 1].repeat(count);
        }
        count = 1;
      }
    }

    return compressed.length < data.length ? compressed : data;
  }

  /**
   * Decompress data
   */
  private decompressData(data: string): string {
    if (!this.config.enableCompression) return data;

    let decompressed = '';
    let i = 0;

    while (i < data.length) {
      if (data[i] === '\x00') {
        const count = data.charCodeAt(i + 1);
        const char = data[i + 2];
        decompressed += char.repeat(count);
        i += 3;
      } else {
        decompressed += data[i];
        i++;
      }
    }

    return decompressed;
  }

  /**
   * Check if storage quota would be exceeded
   */
  private checkStorageQuota(data: string): boolean {
    try {
      const currentUsage = JSON.stringify(localStorage).length;
      const newDataSize = data.length * 2; // Account for base64 overhead
      const maxSize = this.config.maxStorageSize! * 1024 * 1024;

      return (currentUsage + newDataSize) <= maxSize;
    } catch {
      return true; // If we can't check, assume it's okay
    }
  }

  /**
   * Store encrypted data
   */
  async setItem(key: string, data: any, expiresIn?: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const serializedData = JSON.stringify(data);
    const compressedData = this.compressData(serializedData);

    // Check storage quota
    if (!this.checkStorageQuota(compressedData)) {
      throw new Error('Storage quota exceeded');
    }

    const checksum = this.generateChecksum(compressedData);
    const storageItem: StorageItem = {
      data: compressedData,
      timestamp: Date.now(),
      checksum,
      version: '1.0',
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined
    };

    const encryptedData = await this.encryptData(JSON.stringify(storageItem));
    localStorage.setItem(`chutes_secure_${key}`, encryptedData);
  }

  /**
   * Retrieve and decrypt data
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const encryptedData = localStorage.getItem(`chutes_secure_${key}`);
      if (!encryptedData) return null;

      const decryptedData = await this.decryptData(encryptedData);
      const storageItem: StorageItem = JSON.parse(decryptedData);

      // Check expiration
      if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
        await this.removeItem(key);
        return null;
      }

      // Verify checksum
      const currentChecksum = this.generateChecksum(storageItem.data);
      if (currentChecksum !== storageItem.checksum) {
        console.warn(`Data integrity check failed for key: ${key}`);
        await this.removeItem(key);
        return null;
      }

      const decompressedData = this.decompressData(storageItem.data);
      return JSON.parse(decompressedData);
    } catch (error) {
      console.error(`Failed to retrieve item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove encrypted data
   */
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(`chutes_secure_${key}`);
  }

  /**
   * Clear all encrypted data
   */
  async clear(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chutes_secure_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalItems: number;
    totalSize: number;
    lastModified: number;
  } {
    const keys = Object.keys(localStorage);
    const secureKeys = keys.filter(key => key.startsWith('chutes_secure_'));

    let totalSize = 0;
    let lastModified = 0;

    secureKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
        // Note: We can't get last modified from localStorage directly
      }
    });

    return {
      totalItems: secureKeys.length,
      totalSize,
      lastModified
    };
  }

  /**
   * Session Token Management
   */
  async createSessionToken(userId?: string, permissions: string[] = [], expiresIn: number = 24 * 60 * 60 * 1000): Promise<string> {
    const token: SessionToken = {
      token: this.generateSecureToken(),
      userId,
      expiresAt: Date.now() + expiresIn,
      permissions,
      metadata: {
        createdAt: Date.now(),
        userAgent: navigator.userAgent,
        ip: await this.getClientIP()
      }
    };

    await this.setItem('session_token', token, expiresIn);
    return token.token;
  }

  async validateSessionToken(token: string): Promise<SessionToken | null> {
    const storedToken: SessionToken | null = await this.getItem('session_token');

    if (!storedToken || storedToken.token !== token) {
      return null;
    }

    if (Date.now() > storedToken.expiresAt) {
      await this.removeItem('session_token');
      return null;
    }

    return storedToken;
  }

  async revokeSessionToken(): Promise<void> {
    await this.removeItem('session_token');
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => chars[byte % chars.length]).join('');
  }

  /**
   * Get client IP (best effort)
   */
  private async getClientIP(): Promise<string> {
    try {
      // This is a simplified approach - in production you'd use a service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SecureStorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if secure storage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
    } catch {
      return false;
    }
  }
}

export const secureStorage = SecureStorageManager.getInstance();

// React Hook for Secure Storage
export function useSecureStorage() {
  return {
    setItem: secureStorage.setItem.bind(secureStorage),
    getItem: secureStorage.getItem.bind(secureStorage),
    removeItem: secureStorage.removeItem.bind(secureStorage),
    clear: secureStorage.clear.bind(secureStorage),
    getStorageStats: secureStorage.getStorageStats.bind(secureStorage),
    createSessionToken: secureStorage.createSessionToken.bind(secureStorage),
    validateSessionToken: secureStorage.validateSessionToken.bind(secureStorage),
    revokeSessionToken: secureStorage.revokeSessionToken.bind(secureStorage),
    isAvailable: secureStorage.isAvailable.bind(secureStorage),
    initialize: secureStorage.initialize.bind(secureStorage)
  };
}

// Legacy localStorage wrapper for backward compatibility
export const legacyStorage = {
  getItem: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};
