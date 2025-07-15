import { createHash } from 'crypto';
import { logger } from '../utils/logger';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTtl = 3600000; // 1 hour in milliseconds
  private readonly maxCacheSize = 1000;

  /**
   * Generate cache key from input data
   */
  private generateKey(prefix: string, data: any): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(data));
    return `${prefix}:${hash.digest('hex')}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.timestamp + entry.ttl;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.info(`Cache cleanup: removed ${removedCount} expired entries`);
    }
  }

  /**
   * Ensure cache doesn't exceed maximum size
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.maxCacheSize) return;

    // Remove oldest entries
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));

    logger.info(`Cache size enforcement: removed ${toRemove.length} old entries`);
  }

  /**
   * Get cached AI response for photo analysis
   */
  async getCachedPhotoAnalysis(imageBuffer: Buffer): Promise<any | null> {
    try {
      const key = this.generateKey('photo', imageBuffer);
      const entry = this.cache.get(key);

      if (!entry || this.isExpired(entry)) {
        return null;
      }

      logger.info(`Cache hit for photo analysis: ${key}`);
      return entry.data;
    } catch (error) {
      logger.error('Error getting cached photo analysis:', error);
      return null;
    }
  }

  /**
   * Cache AI response for photo analysis
   */
  async setCachedPhotoAnalysis(imageBuffer: Buffer, data: any, ttl?: number): Promise<void> {
    try {
      const key = this.generateKey('photo', imageBuffer);
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTtl
      };

      this.cache.set(key, entry);
      this.enforceMaxSize();
      this.cleanup();

      logger.info(`Cached photo analysis: ${key}`);
    } catch (error) {
      logger.error('Error caching photo analysis:', error);
    }
  }

  /**
   * Get cached AI response for URL analysis
   */
  async getCachedUrlAnalysis(url: string): Promise<any | null> {
    try {
      const key = this.generateKey('url', url);
      const entry = this.cache.get(key);

      if (!entry || this.isExpired(entry)) {
        return null;
      }

      logger.info(`Cache hit for URL analysis: ${key}`);
      return entry.data;
    } catch (error) {
      logger.error('Error getting cached URL analysis:', error);
      return null;
    }
  }

  /**
   * Cache AI response for URL analysis
   */
  async setCachedUrlAnalysis(url: string, data: any, ttl?: number): Promise<void> {
    try {
      const key = this.generateKey('url', url);
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTtl
      };

      this.cache.set(key, entry);
      this.enforceMaxSize();
      this.cleanup();

      logger.info(`Cached URL analysis: ${key}`);
    } catch (error) {
      logger.error('Error caching URL analysis:', error);
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }

  /**
   * Manually trigger cleanup
   */
  performCleanup(): void {
    this.cleanup();
  }
}

export const cacheService = new CacheService();

// Schedule periodic cleanup
setInterval(() => {
  cacheService.performCleanup();
}, 300000); // Every 5 minutes