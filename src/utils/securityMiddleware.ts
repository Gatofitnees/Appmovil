import { logSecurityEvent } from './securityLogger';

export class EnhancedRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number; blocked: boolean }> = new Map();
  private readonly maxAttempts: number;
  private readonly timeWindow: number;
  private readonly blockDuration: number;

  constructor(maxAttempts: number = 5, timeWindow: number = 300000, blockDuration: number = 900000) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow; // 5 minutes default
    this.blockDuration = blockDuration; // 15 minutes block default
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.timeWindow, blocked: false });
      return true;
    }

    // Check if still blocked
    if (record.blocked && now < record.resetTime) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'rate_limit_blocked_attempt',
        details: identifier,
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return false;
    }

    // Reset if time window expired
    if (now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.timeWindow, blocked: false });
      return true;
    }

    // Check if exceeded attempts
    if (record.count >= this.maxAttempts) {
      // Block the identifier
      this.attempts.set(identifier, {
        count: record.count + 1,
        resetTime: now + this.blockDuration,
        blocked: true
      });
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'rate_limit_exceeded',
        details: `${identifier} blocked for ${this.blockDuration}ms`,
        severity: 'high',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
      return false;
    }

    // Increment attempt count
    record.count++;
    this.attempts.set(identifier, record);
    
    if (record.count > this.maxAttempts * 0.8) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'rate_limit_warning',
        details: `${identifier} approaching limit: ${record.count}/${this.maxAttempts}`,
        severity: 'medium',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        location: typeof window !== 'undefined' ? window.location.href : undefined
      });
    }
    
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || record.blocked) return 0;
    return Math.max(0, this.maxAttempts - record.count);
  }

  getTimeToReset(identifier: string): number {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    if (!record || now > record.resetTime) return 0;
    return record.resetTime - now;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'rate_limit_reset',
      details: identifier,
      severity: 'low',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      location: typeof window !== 'undefined' ? window.location.href : undefined
    });
  }
}

export const getSecurityHeaders = (): Record<string, string> => {
  return {
    // Content Security Policy - Enhanced
    'Content-Security-Policy': [
      "default-src 'self' capacitor: http://localhost https://mwgnpexeymgpzibnkiof.supabase.co https://*.supabase.co https://www.youtube.com https://www.youtube-nocookie.com data: blob:",
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.youtube.com https://www.youtube-nocookie.com",
      "img-src 'self' data: blob: https: https://mwgnpexeymgpzibnkiof.supabase.co https://i.ytimg.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://mwgnpexeymgpzibnkiof.supabase.co wss://mwgnpexeymgpzibnkiof.supabase.co https://www.youtube.com https://*.googlevideo.com",
      "media-src 'self' blob: https://www.youtube.com https://*.googlevideo.com",
      "frame-src 'self' capacitor: http://localhost https://mwgnpexeymgpzibnkiof.supabase.co https://*.supabase.co https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com",
      "object-src 'self' https://mwgnpexeymgpzibnkiof.supabase.co https://*.supabase.co data: blob:",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; '),
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };
};

export const sanitizeUserInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove script tags and event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^"'\s>]+/gi, '')
    // Remove potentially dangerous HTML
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    // Remove data URLs that could contain scripts
    .replace(/data:(?!image\/[a-z]+;base64,)[^;,]*[;,]/gi, '')
    // Trim and limit length
    .trim()
    .substring(0, maxLength);
};

export const validateOrigin = (origin: string, allowedOrigins?: string[]): boolean => {
  const defaultAllowed = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mwgnpexeymgpzibnkiof.supabase.co'
  ];
  
  const allowed = allowedOrigins || defaultAllowed;
  return allowed.includes(origin);
};

export const createSecurityFingerprint = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  const components = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.language,
    navigator.platform
  ];
  
  return btoa(components.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

export const detectSuspiciousActivity = (
  userAgent: string,
  requestCount: number,
  timeWindow: number
): boolean => {
  // Check for suspicious user agents
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /requests/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'suspicious_user_agent',
      details: userAgent,
      severity: 'medium',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      location: typeof window !== 'undefined' ? window.location.href : undefined
    });
    return true;
  }
  
  // Check for unusual request frequency
  const requestsPerMinute = (requestCount / timeWindow) * 60000;
  if (requestsPerMinute > 60) { // More than 1 request per second
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'suspicious_request_frequency',
      details: `${requestsPerMinute} req/min`,
      severity: 'high',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      location: typeof window !== 'undefined' ? window.location.href : undefined
    });
    return true;
  }
  
  return false;
};

// Global rate limiters for different operations
export const authRateLimiter = new EnhancedRateLimiter(5, 300000, 900000); // 5 attempts per 5 min, 15 min block
export const fileUploadRateLimiter = new EnhancedRateLimiter(10, 600000, 1800000); // 10 uploads per 10 min, 30 min block
export const apiRateLimiter = new EnhancedRateLimiter(100, 60000, 300000); // 100 requests per minute, 5 min block
export const webhookRateLimiter = new EnhancedRateLimiter(20, 300000, 1800000); // 20 webhooks per 5 min, 30 min block
