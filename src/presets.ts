import { buildHeaders } from "./factory";

/**
 * Convenience functions for common header patterns
 */
export const commonHeaders = {
  // Static assets - ETags make sense here
  css: (content?: string) =>
    buildHeaders().contentType("css").cache("STYLESHEET").eTag(content),

  javascript: (content?: string) =>
    buildHeaders().contentType("javascript").cache("JAVASCRIPT").eTag(content),

  hashedAsset: (filePath: string, content?: string) =>
    buildHeaders().filePath(filePath).cache("HASHED_ASSET").eTag(content),

  font: (filePath: string) =>
    buildHeaders().filePath(filePath).cache("FONT").cors({ origin: "*" }),

  image: (filePath: string) => buildHeaders().filePath(filePath).cache("IMAGE"),

  favicon: () => buildHeaders().contentType("icon").cache("FAVICON"),

  // API responses - NO automatic ETags
  api: () => buildHeaders().contentType("json").cache("API_RESPONSE").cors(),

  // Expensive API queries - ETag optional but clear
  expensiveApi: (content?: string) =>
    buildHeaders()
      .contentType("json")
      .cache("API_RESPONSE")
      .cors()
      .eTag(content),

  // Real-time APIs - no caching at all
  realtime: () => buildHeaders().contentType("json").cache("NO_CACHE").cors(),

  // HTML and documents - ETag only for expensive/large content
  html: () => buildHeaders().contentType("html").cache("HTML_PAGE").security(),

  // Expensive HTML (like reports)
  expensiveHtml: (content?: string) =>
    buildHeaders()
      .contentType("html")
      .cache("HTML_PAGE")
      .security()
      .eTag(content),

  // Special files
  manifest: (content?: string) =>
    buildHeaders().contentType("json").cache("MANIFEST").eTag(content),

  serviceWorker: () =>
    buildHeaders().contentType("javascript").cache("SERVICE_WORKER"),

  sitemap: (content?: string) =>
    buildHeaders().contentType("xml").cache("SITEMAP").eTag(content),

  feed: (content?: string, type: "rss" | "atom" = "rss") =>
    buildHeaders()
      .contentType("xml")
      .cache("FEED")
      .eTag(content)
      .mimeType(
        type === "rss" ? "application/rss+xml" : "application/atom+xml"
      ),

  // Media - no ETags needed
  video: (filePath: string) =>
    buildHeaders()
      .filePath(filePath)
      .cache("MEDIA_STREAM")
      .custom("Accept-Ranges", "bytes"),

  audio: (filePath: string) =>
    buildHeaders()
      .filePath(filePath)
      .cache("MEDIA_STREAM")
      .custom("Accept-Ranges", "bytes"),

  // Documents - ETag only if explicitly provided
  pdf: (content?: string) =>
    buildHeaders()
      .contentType("pdf")
      .cache("DOCUMENT")
      .custom("Content-Disposition", "inline")
      .eTag(content),

  download: (filename: string, filePath: string, content?: string) =>
    buildHeaders()
      .filePath(filePath)
      .cache("ARCHIVE")
      .custom("Content-Disposition", `attachment; filename="${filename}"`)
      .eTag(content),

  // Security-focused
  secure: () =>
    buildHeaders()
      .security({
        csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
        hsts: 31536000,
      })
      .custom("X-Powered-By", "Bun"),

  // Redirect helpers
  permanentRedirect: (url: string) => buildHeaders().redirect(url, true),

  temporaryRedirect: (url: string) => buildHeaders().redirect(url, false),
};
