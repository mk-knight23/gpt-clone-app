// Security and Validation Utilities for CHUTES AI Chat

export interface SecurityConfig {
  maxMessageLength: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  rateLimitWindow: number; // milliseconds
  maxRequestsPerWindow: number;
  enableCSP: boolean;
  sanitizeHTML: boolean;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private rateLimitMap = new Map<string, RateLimitEntry>();
  private blockedIPs = new Set<string>();
  private suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /fetch\s*\(/gi,
    /XMLHttpRequest/gi
  ];

  constructor() {
    this.config = {
      maxMessageLength: 10000,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf', 'text/plain', 'text/markdown', 'application/json',
        'text/javascript', 'text/typescript', 'text/jsx', 'text/tsx',
        'text/python', 'text/html', 'text/css', 'text/sql',
        'text/java', 'text/cpp', 'text/c', 'text/rust', 'text/go'
      ],
      rateLimitWindow: 60000, // 1 minute
      maxRequestsPerWindow: 30,
      enableCSP: true,
      sanitizeHTML: true
    };
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Input Validation
  validateMessage(content: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check message length
    if (content.length > this.config.maxMessageLength) {
      result.errors.push(`Message too long. Maximum ${this.config.maxMessageLength} characters allowed.`);
      result.valid = false;
    }

    // Check for empty message
    if (!content.trim()) {
      result.errors.push('Message cannot be empty.');
      result.valid = false;
    }

    // Check for suspicious patterns
    const suspiciousContent = this.detectSuspiciousContent(content);
    if (suspiciousContent.length > 0) {
      result.warnings.push('Message contains potentially suspicious content.');
    }

    // Check for excessive special characters
    const specialCharRatio = this.calculateSpecialCharRatio(content);
    if (specialCharRatio > 0.3) {
      result.warnings.push('Message contains many special characters.');
    }

    // Check for repeated characters (potential spam)
    if (this.hasExcessiveRepeatingChars(content)) {
      result.warnings.push('Message contains excessive repeating characters.');
    }

    return result;
  }

  validateFile(file: File): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check file size
    if (file.size > this.config.maxFileSize) {
      result.errors.push(`File too large. Maximum ${this.config.maxFileSize / 1024 / 1024}MB allowed.`);
      result.valid = false;
    }

    // Check file type
    if (!this.config.allowedFileTypes.includes(file.type)) {
      // Check by extension as fallback
      const extension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'sql', 'java', 'cpp', 'c', 'rs', 'go'];
      
      if (!extension || !allowedExtensions.includes(extension)) {
        result.errors.push(`File type not allowed. Supported types: ${allowedExtensions.join(', ')}`);
        result.valid = false;
      }
    }

    // Check for suspicious file names
    if (this.isSuspiciousFileName(file.name)) {
      result.warnings.push('File name appears suspicious.');
    }

    // Check for executable files
    if (this.isExecutableFile(file.name)) {
      result.errors.push('Executable files are not allowed.');
      result.valid = false;
    }

    return result;
  }

  // Rate Limiting
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);

    if (!entry) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow
      });
      return true;
    }

    if (now > entry.resetTime) {
      // Reset window
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow
      });
      return true;
    }

    if (entry.count >= this.config.maxRequestsPerWindow) {
      return false; // Rate limit exceeded
    }

    entry.count++;
    return true;
  }

  getRateLimitStatus(identifier: string): { remaining: number; resetTime: number } {
    const entry = this.rateLimitMap.get(identifier);
    if (!entry) {
      return { remaining: this.config.maxRequestsPerWindow, resetTime: Date.now() + this.config.rateLimitWindow };
    }

    return {
      remaining: Math.max(0, this.config.maxRequestsPerWindow - entry.count),
      resetTime: entry.resetTime
    };
  }

  // Content Sanitization
  sanitizeHTML(input: string): string {
    if (!this.config.sanitizeHTML) return input;

    // Remove script tags and their content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // Remove eval() calls
    sanitized = sanitized.replace(/eval\s*\(/gi, '');
    
    // Remove dangerous object references
    sanitized = sanitized.replace(/document\./gi, '');
    sanitized = sanitized.replace(/window\./gi, '');
    
    return sanitized;
  }

  sanitizeUserInput(input: string): string {
    return this.sanitizeHTML(input.trim());
  }

  // Content Detection
  private detectSuspiciousContent(content: string): string[] {
    const detections: string[] = [];
    
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        detections.push(pattern.source);
      }
    }

    return detections;
  }

  private calculateSpecialCharRatio(content: string): number {
    const specialChars = content.match(/[^a-zA-Z0-9\s]/g);
    return specialChars ? specialChars.length / content.length : 0;
  }

  private hasExcessiveRepeatingChars(content: string): boolean {
    // Check for sequences of 5+ repeated characters
    return /(.)\1{4,}/.test(content);
  }

  private isSuspiciousFileName(fileName: string): boolean {
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i,
      /^\./,
      /\.\./,
      /[<>:"|?*]/,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(fileName));
  }

  private isExecutableFile(fileName: string): boolean {
    const executableExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.app', '.deb', '.rpm'];
    return executableExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  // Content Security Policy
  generateCSP(): string {
    if (!this.config.enableCSP) return '';

    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  // IP Blocking
  blockIP(ip: string, duration: number = 3600000): void { // 1 hour default
    this.blockedIPs.add(ip);
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, duration);
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Utility Methods
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    
    return result;
  }

  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || this.generateSecureToken(16);
    const encoder = new TextEncoder();
    const data = encoder.encode(password + actualSalt);
    
    // Simple hash (in production, use a proper hashing library like bcrypt)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return {
      hash: Math.abs(hash).toString(16),
      salt: actualSalt
    };
  }

  // Cleanup
  cleanup(): void {
    const now = Date.now();
    
    // Clean up expired rate limit entries
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

export const security = SecurityManager.getInstance();

// React Hook for Security
export function useSecurity() {
  return {
    validateMessage: security.validateMessage.bind(security),
    validateFile: security.validateFile.bind(security),
    checkRateLimit: security.checkRateLimit.bind(security),
    getRateLimitStatus: security.getRateLimitStatus.bind(security),
    sanitizeInput: security.sanitizeUserInput.bind(security),
    generateCSP: security.generateCSP.bind(security),
    blockIP: security.blockIP.bind(security),
    isIPBlocked: security.isIPBlocked.bind(security),
    updateConfig: security.updateConfig.bind(security),
    getConfig: security.getConfig.bind(security),
    generateSecureToken: security.generateSecureToken.bind(security),
    hashPassword: security.hashPassword.bind(security),
    cleanup: security.cleanup.bind(security)
  };
}