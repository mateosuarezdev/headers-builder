export type HeadersCacheStrategy =
  // Generic time-based strategies
  | "NO_CACHE"
  | "ONE_YEAR"
  | "ONE_MONTH"
  | "ONE_WEEK"
  | "ONE_DAY"
  | "ONE_HOUR"
  | "FIVE_MINUTES"
  | "API"
  | "IMMUTABLE"

  // Content-specific strategies
  | "STYLESHEET" // CSS files - long cache with revalidation
  | "JAVASCRIPT" // JS files - long cache with revalidation
  | "HASHED_ASSET" // Assets with hash in filename - immutable
  | "FONT" // Web fonts - very long cache
  | "IMAGE" // Images - long cache
  | "FAVICON" // Favicons - very long cache
  | "HTML_PAGE" // HTML documents - short cache with revalidation
  | "API_RESPONSE" // API JSON responses - short cache
  | "FEED" // RSS/Atom feeds - medium cache
  | "SITEMAP" // XML sitemaps - daily cache
  | "MANIFEST" // PWA manifest - medium cache with revalidation
  | "SERVICE_WORKER" // Service workers - no cache (always fresh)
  | "MEDIA_STREAM" // Video/audio streaming - no cache
  | "DOCUMENT" // PDF/docs - medium cache
  | "ARCHIVE"; // ZIP/tar files - long cache

export type HeadersContentTypeInput =
  // Text & Code
  | "html"
  | "css"
  | "javascript"
  | "json"
  | "xml"
  | "text"
  | "csv"
  | "markdown"
  // Images
  | "png"
  | "jpeg"
  | "gif"
  | "svg"
  | "webp"
  | "icon"
  | "bmp"
  // Fonts
  | "woff"
  | "woff2"
  | "truetype"
  | "embedded-opentype"
  | "opentype"
  // Audio/Video
  | "mp4"
  | "webm"
  | "ogg"
  | "mpeg"
  | "wav"
  | "flac"
  // Documents
  | "pdf"
  | "zip"
  | "tar"
  | "gzip";
