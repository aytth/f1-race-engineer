const memoryCache = new Map<string, { data: unknown; expires: number }>();

export function getFromMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data as T;
  }
  memoryCache.delete(key);
  return null;
}

export function setInMemory(key: string, data: unknown, ttlMs: number): void {
  memoryCache.set(key, { data, expires: Date.now() + ttlMs });
}

export async function getFromKV<T>(kv: KVNamespace | undefined, key: string): Promise<T | null> {
  if (!kv) return null;
  return kv.get(key, 'json');
}

export async function setInKV(kv: KVNamespace | undefined, key: string, data: unknown, ttlSeconds: number): Promise<void> {
  if (!kv) return;
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
}
