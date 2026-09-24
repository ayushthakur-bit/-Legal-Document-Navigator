import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

/**
 * High-performance In-Memory LRU Cache with Time-To-Live (TTL)
 */
export class MemoryAnalysisCache<T> {
  private cache = new Map<string, { value: T; expiresAt: number }>();
  private maxEntries: number;
  private ttlMs: number;

  constructor(maxEntries = 100, ttlMs = 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  public generateKey(prefix: string, content: string): string {
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    return `${prefix}:${hash}`;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order (delete & re-insert)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  public set(key: string, value: T, customTtlMs?: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (customTtlMs ?? this.ttlMs),
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// Global Singleton Cache instances
export const analysisCache = new MemoryAnalysisCache<any>(100, 60 * 60 * 1000);
export const qnaCache = new MemoryAnalysisCache<any>(200, 30 * 60 * 1000);

/**
 * Comprehensive HTTP Security Headers Middleware
 * Configured to allow AI Studio sandboxed iframe preview embedding
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Legacy XSS filter protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Strict Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Remove X-Powered-By header to avoid framework fingerprinting
  res.removeHeader("X-Powered-By");

  next();
}

/**
 * Sliding Window In-Memory Rate Limiter Middleware
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class InMemoryRateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 15 * 60 * 1000, maxRequests = 120) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of stale client records every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [ip, record] of this.records.entries()) {
        if (now > record.resetTime) {
          this.records.delete(ip);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Extract IP address safely
      const forwarded = req.headers["x-forwarded-for"];
      const clientIp = typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : req.socket.remoteAddress || "127.0.0.1";

      const now = Date.now();
      let record = this.records.get(clientIp);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.records.set(clientIp, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, this.maxRequests - record.count);
      const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader("X-RateLimit-Limit", this.maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", resetSeconds.toString());

      if (record.count > this.maxRequests) {
        res.setHeader("Retry-After", resetSeconds.toString());
        return res.status(429).json({
          error: "Too Many Requests",
          message: `API rate limit exceeded. Please try again in ${resetSeconds} seconds.`,
          retryAfter: resetSeconds,
        });
      }

      next();
    };
  }

  public reset(): void {
    this.records.clear();
  }
}

export const apiRateLimiter = new InMemoryRateLimiter(15 * 60 * 1000, 150);

/**
 * Validates and sanitizes analyze document request body
 */
export function validateAnalyzePayload(body: any): { valid: boolean; error?: string; data?: { documentText: string; documentTitle: string; documentType: string } } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request payload. Expected JSON object." };
  }

  const { documentText, documentTitle, documentType } = body;

  if (!documentText || typeof documentText !== "string") {
    return { valid: false, error: "Field 'documentText' must be a non-empty string." };
  }

  const trimmedText = documentText.trim();
  if (trimmedText.length < 10) {
    return { valid: false, error: "Document text is too short. Please provide at least 10 characters." };
  }

  if (trimmedText.length > 500000) {
    return { valid: false, error: "Document text exceeds maximum size limit of 500,000 characters." };
  }

  const sanitizedTitle = typeof documentTitle === "string" && documentTitle.trim()
    ? documentTitle.trim().slice(0, 200).replace(/[<>]/g, "")
    : "Legal Document";

  const sanitizedType = typeof documentType === "string" && documentType.trim()
    ? documentType.trim().slice(0, 50).replace(/[<>]/g, "")
    : "general";

  return {
    valid: true,
    data: {
      documentText: trimmedText,
      documentTitle: sanitizedTitle,
      documentType: sanitizedType,
    },
  };
}

/**
 * Validates and sanitizes Q&A request body
 */
export function validateAskPayload(body: any): { valid: boolean; error?: string; data?: { question: string; documentText: string; documentTitle: string } } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request payload. Expected JSON object." };
  }

  const { question, documentText, documentTitle } = body;

  if (!question || typeof question !== "string" || !question.trim()) {
    return { valid: false, error: "Field 'question' must be a non-empty string." };
  }

  if (question.trim().length > 1000) {
    return { valid: false, error: "Question cannot exceed 1,000 characters." };
  }

  if (!documentText || typeof documentText !== "string" || !documentText.trim()) {
    return { valid: false, error: "Field 'documentText' is required to answer question in context." };
  }

  return {
    valid: true,
    data: {
      question: question.trim().replace(/[<>]/g, ""),
      documentText: documentText.trim(),
      documentTitle: typeof documentTitle === "string" ? documentTitle.trim().slice(0, 200) : "Legal Document",
    },
  };
}
