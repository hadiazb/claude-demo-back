import { CachePort } from '@shared/cache/domain/ports/cache.port';

interface CacheEntry {
  value: unknown;
  expiresAt?: number;
}

export class InMemoryCacheAdapter implements CachePort {
  private store = new Map<string, CacheEntry>();

  get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(null);
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value as T);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const entry: CacheEntry = { value };
    if (ttlSeconds) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
    this.store.set(key, entry);
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  deleteByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
    return Promise.resolve();
  }

  exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(false);
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(-2);
    if (!entry.expiresAt) return Promise.resolve(-1);
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return Promise.resolve(remaining > 0 ? remaining : -2);
  }

  clear(): void {
    this.store.clear();
  }
}
