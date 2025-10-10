import type { HeadersCacheStrategy } from "./types";

export const CACHE_CONFIGS: Record<
  HeadersCacheStrategy,
  { cacheControl: string; expires?: string }
> = {
  // Generic time-based strategies
  NO_CACHE: {
    cacheControl: "no-cache, no-store, must-revalidate",
    expires: new Date(0).toUTCString(),
  },
  ONE_YEAR: {
    cacheControl: "public, max-age=31536000",
    expires: new Date(Date.now() + 31536000 * 1000).toUTCString(),
  },
  IMMUTABLE: {
    cacheControl: "public, max-age=31536000, immutable",
    expires: new Date(Date.now() + 31536000 * 1000).toUTCString(),
  },
  ONE_MONTH: {
    cacheControl: "public, max-age=2592000",
  },
  ONE_WEEK: {
    cacheControl: "public, max-age=604800",
  },
  ONE_DAY: {
    cacheControl: "public, max-age=86400, must-revalidate",
  },
  ONE_HOUR: {
    cacheControl: "public, max-age=3600, must-revalidate",
  },
  FIVE_MINUTES: {
    cacheControl: "public, max-age=300",
  },
  API: {
    cacheControl: "public, max-age=300, s-maxage=3600",
  },

  // Content-specific strategies
  STYLESHEET: {
    cacheControl: "public, max-age=2592000, must-revalidate",
  },
  JAVASCRIPT: {
    cacheControl: "public, max-age=2592000, must-revalidate",
  },
  HASHED_ASSET: {
    cacheControl: "public, max-age=31536000, immutable",
    expires: new Date(Date.now() + 31536000 * 1000).toUTCString(),
  },
  FONT: {
    cacheControl: "public, max-age=31536000",
    expires: new Date(Date.now() + 31536000 * 1000).toUTCString(),
  },
  IMAGE: {
    cacheControl: "public, max-age=2592000",
  },
  FAVICON: {
    cacheControl: "public, max-age=31536000",
    expires: new Date(Date.now() + 31536000 * 1000).toUTCString(),
  },
  HTML_PAGE: {
    cacheControl: "public, max-age=3600, must-revalidate",
  },
  API_RESPONSE: {
    cacheControl: "public, max-age=300, s-maxage=900",
  },
  FEED: {
    cacheControl: "public, max-age=3600",
  },
  SITEMAP: {
    cacheControl: "public, max-age=86400",
  },
  MANIFEST: {
    cacheControl: "public, max-age=86400, must-revalidate",
  },
  SERVICE_WORKER: {
    cacheControl: "no-cache, no-store, must-revalidate",
    expires: new Date(0).toUTCString(),
  },
  MEDIA_STREAM: {
    cacheControl: "no-cache, no-store",
  },
  DOCUMENT: {
    cacheControl: "public, max-age=86400",
  },
  ARCHIVE: {
    cacheControl: "public, max-age=604800",
  },
};

export function getCacheConfig(strategy: HeadersCacheStrategy) {
  return CACHE_CONFIGS[strategy];
}
