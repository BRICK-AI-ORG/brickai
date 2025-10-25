import type { SupabaseClient } from "@supabase/supabase-js";

type CacheEntry = {
  url: string;
  expiresAt: number;
};

const CACHE_TTL_MS = 55 * 60 * 1000; // 55 minutes to stay safely inside Supabase expiry
const cache = new Map<string, CacheEntry>();

function cacheKey(path: string) {
  return path;
}

export function getCachedSignedUrl(path: string): string | null {
  const entry = cache.get(cacheKey(path));
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(cacheKey(path));
    return null;
  }
  return entry.url;
}

export function invalidateSignedUrl(path: string) {
  cache.delete(cacheKey(path));
}

export async function ensureSignedUrls(
  client: SupabaseClient,
  bucket: string,
  paths: string[],
  expiresInSeconds = 60 * 60
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  const result = new Map<string, string>();
  const missing: string[] = [];

  unique.forEach((path) => {
    const cached = getCachedSignedUrl(path);
    if (cached) {
      result.set(path, cached);
    } else {
      missing.push(path);
    }
  });

  if (missing.length) {
    const { data, error } = await client.storage.from(bucket).createSignedUrls(missing, expiresInSeconds);
    if (error || !data) {
      throw error ?? new Error("Failed to generate signed urls");
    }

    data.forEach((entry, index) => {
      const requestedPath = missing[index];
      const signedUrl = entry?.signedUrl;
      if (!requestedPath || !signedUrl) return;
      cache.set(cacheKey(requestedPath), {
        url: signedUrl,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      result.set(requestedPath, signedUrl);
    });
  }

  return result;
}

export async function ensureSignedUrl(
  client: SupabaseClient,
  bucket: string,
  path: string,
  expiresInSeconds = 60 * 60
): Promise<string> {
  const cached = getCachedSignedUrl(path);
  if (cached) return cached;

  const map = await ensureSignedUrls(client, bucket, [path], expiresInSeconds);
  const url = map.get(path);
  if (!url) {
    throw new Error("Failed to generate signed url");
  }
  return url;
}
