import { getCacheConfig } from "./cache-strategies";
import { getMimeType } from "./mime-types";
import type { HeadersCacheStrategy, HeadersContentTypeInput } from "./types";
import { hashContent } from "./utils";

export class HeadersBuilder {
  private headers: Record<string, string> = {};

  /**
   * Set content type from known extension types (with full TypeScript autocomplete)
   * @example
   * headers().contentType("json").build()
   * // Returns: { "Content-Type": "application/json" }
   */
  contentType(type: HeadersContentTypeInput): HeadersBuilder {
    this.headers["Content-Type"] = getMimeType(type);
    return this;
  }

  /**
   * Set content type from file path - auto-detects extension or falls back to octet-stream
   * @example
   * headers().filePath("style.css").build()
   * // Returns: { "Content-Type": "text/css" }
   */
  filePath(path: string): HeadersBuilder {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    this.headers["Content-Type"] = getMimeType(ext as any);
    return this;
  }

  /**
   * Set content type using raw MIME type string (for custom/unknown types)
   * @example
   * headers().mimeType("application/vnd.api+json").build()
   */
  mimeType(mimeType: string): HeadersBuilder {
    this.headers["Content-Type"] = mimeType;
    return this;
  }

  /**
   * Set cache control headers based on strategy
   * @example
   * headers().cache("ONE_DAY").build()
   * // Returns: { "Cache-Control": "public, max-age=86400, must-revalidate" }
   */
  cache(strategy: HeadersCacheStrategy): HeadersBuilder {
    const { cacheControl, expires } = getCacheConfig(strategy);

    this.headers["Cache-Control"] = cacheControl;
    if (expires) {
      this.headers["Expires"] = expires;
    }

    return this;
  }

  /**
   * Add ETag header - auto-generates from content or accepts explicit value
   * Pass undefined to skip setting ETag (useful for optional patterns)
   * @example
   * // Generate from content
   * headers().eTag("my content").build()
   *
   * // Use explicit ETag
   * headers().eTag('"abc123"').build()
   *
   * // Conditional usage
   * headers().eTag(content).build() // works even if content is undefined
   */
  eTag(contentOrETag?: string | ArrayBuffer | Uint8Array): HeadersBuilder {
    if (!contentOrETag) {
      // Skip setting ETag if undefined/null
      return this;
    }

    let etag: string;
    if (typeof contentOrETag === "string" && contentOrETag.startsWith('"')) {
      // Already formatted ETag
      etag = contentOrETag;
    } else {
      // Generate ETag from content
      etag = `"${hashContent(contentOrETag)}"`;
    }

    this.headers["ETag"] = etag;
    return this;
  }

  /**
   * Set Last-Modified header
   * @example
   * headers().lastModified(new Date()).build()
   */
  lastModified(date: Date): HeadersBuilder {
    this.headers["Last-Modified"] = date.toUTCString();
    return this;
  }

  /**
   * Set Content-Length header
   * @example
   * headers().contentLength(1024).build()
   */
  contentLength(bytes: number): HeadersBuilder {
    this.headers["Content-Length"] = bytes.toString();
    return this;
  }

  /**
   * Set redirect headers (Location + appropriate status should be set in response)
   * @example
   * // Permanent redirect (301)
   * headers().redirect("https://example.com", true).build()
   *
   * // Temporary redirect (302)
   * headers().redirect("https://example.com").build()
   */
  redirect(url: string, permanent: boolean = false): HeadersBuilder {
    this.headers["Location"] = url;
    // Note: Status code should be set separately in your response
    // This just sets the header. The status hint is stored for reference.
    this.headers["X-Redirect-Type"] = permanent ? "permanent" : "temporary";
    return this;
  }

  /**
   * Set CORS headers
   * @example
   * // Simple CORS
   * headers().cors().build()
   *
   * // Custom CORS
   * headers().cors({
   *   origin: allowedOrigin,
   *   credentials: true
   * }).build()
   */
  cors({
    origin = "*",
    methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    headers = ["Content-Type", "Authorization"],
    maxAge = 86400,
    credentials,
  }: {
    origin?: string;
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
    maxAge?: number;
  } = {}): HeadersBuilder {
    // Smart default: credentials true if origin is specific
    // But NEVER allow credentials with wildcard (browsers reject it)
    const allowCredentials = credentials ?? origin !== "*";

    // Validate: can't have credentials with wildcard
    if (allowCredentials && origin === "*") {
      throw new Error(
        'CORS: Cannot use credentials with wildcard origin "*". ' +
          "Specify an exact origin or set credentials to false."
      );
    }

    this.headers["Access-Control-Allow-Origin"] = origin;
    this.headers["Access-Control-Allow-Methods"] = methods.join(", ");
    this.headers["Access-Control-Allow-Headers"] = headers.join(", ");

    if (allowCredentials) {
      this.headers["Access-Control-Allow-Credentials"] = "true";
    }

    this.headers["Access-Control-Max-Age"] = maxAge.toString();

    return this;
  }

  /**
   * Set security headers
   * @example
   * // Default security headers
   * headers().security().build()
   *
   * // Custom CSP
   * headers().security({
   *   csp: "default-src 'self'",
   *   hsts: 31536000
   * }).build()
   */
  security(options?: {
    csp?: string;
    hsts?: boolean | number;
    noSniff?: boolean;
    frameOptions?: "DENY" | "SAMEORIGIN" | string;
    xssProtection?: boolean;
  }): HeadersBuilder {
    const opts = {
      hsts: true,
      noSniff: true,
      frameOptions: "SAMEORIGIN" as const,
      xssProtection: true,
      ...options,
    };

    if (opts.csp) {
      this.headers["Content-Security-Policy"] = opts.csp;
    }

    if (opts.hsts) {
      const maxAge = typeof opts.hsts === "number" ? opts.hsts : 31536000;
      this.headers[
        "Strict-Transport-Security"
      ] = `max-age=${maxAge}; includeSubDomains`;
    }

    if (opts.noSniff) {
      this.headers["X-Content-Type-Options"] = "nosniff";
    }

    if (opts.frameOptions) {
      this.headers["X-Frame-Options"] = opts.frameOptions;
    }

    if (opts.xssProtection) {
      this.headers["X-XSS-Protection"] = "1; mode=block";
    }

    return this;
  }

  /**
   * Add custom header
   * @example
   * headers().custom("X-API-Version", "v2").build()
   */
  custom(name: string, value: string): HeadersBuilder {
    this.headers[name] = value;
    return this;
  }

  /**
   * Set multiple custom headers
   * @example
   * headers().customHeaders({
   *   "X-API-Version": "v2",
   *   "X-Request-ID": "123"
   * }).build()
   */
  customHeaders(headers: Record<string, string>): HeadersBuilder {
    Object.assign(this.headers, headers);
    return this;
  }

  /**
   * Add Vary header
   * @example
   * headers().vary("Accept-Encoding", "User-Agent").build()
   */
  vary(...fields: string[]): HeadersBuilder {
    const existing = this.headers["Vary"];
    const newFields = existing
      ? `${existing}, ${fields.join(", ")}`
      : fields.join(", ");
    this.headers["Vary"] = newFields;
    return this;
  }

  /**
   * Set compression hint
   * @example
   * headers().compress("gzip").build()
   */
  compress(encoding?: "gzip" | "br" | "deflate"): HeadersBuilder {
    if (encoding) {
      this.headers["Content-Encoding"] = encoding;
    }
    return this;
  }

  /**
   * Build the headers object
   * @example
   * const headers = headers().contentType("json").build()
   */
  build(content?: string | ArrayBuffer | Uint8Array): Record<string, string> {
    const result = { ...this.headers };

    // Auto-set Content-Length if content provided and not already set
    if (content && !result["Content-Length"]) {
      const length =
        typeof content === "string"
          ? new TextEncoder().encode(content).length
          : content.byteLength;
      result["Content-Length"] = length.toString();
    }

    return result;
  }

  /**
   * Build as Web API Headers object
   * @example
   * const headers = headers().contentType("json").buildHeaders()
   */
  buildHeaders(content?: string | ArrayBuffer | Uint8Array): Headers {
    return new Headers(this.build(content));
  }
}
