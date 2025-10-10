# Headers Builder

A fluent, type-safe HTTP headers builder for modern JavaScript runtimes. Originally built for internal use in [BRPC](https://github.com/mateosuarezdev/brpc), a modern web framework for Bun. BRPC automatically handles headers for different procedures and file types, but this library lets you override defaults or create custom headers when needed. Now available as a standalone universal library that works with any framework.

## Features

- 🎯 **Type-safe** - Full TypeScript support with autocomplete
- ⚡ **Zero overhead** - Compiles to plain JavaScript objects
- 🔗 **Fluent API** - Chain methods for readable code
- 📦 **Smart presets** - Pre-configured headers for common scenarios
- 🔒 **Security built-in** - CORS, CSP, HSTS, and more
- 🎨 **ETag generation** - Automatic content hashing for cache validation
- 🚀 **Performance-focused** - Optimized cache strategies per content type
- 🌐 **Runtime agnostic** - Works with Bun, Node.js, Deno, and more

## Installation

```bash
# Bun
bun add @mateosuarezdev/headers-builder

# npm
npm install @mateosuarezdev/headers-builder

# pnpm
pnpm add @mateosuarezdev/headers-builder

# yarn
yarn add @mateosuarezdev/headers-builder
```

## Runtime Compatibility

Works seamlessly across all modern JavaScript runtimes:

- ✅ **Bun** - Optimized with native `Bun.hash()` for fastest performance
- ✅ **Node.js** (18+) - Uses Node's `crypto` module for hashing
- ✅ **Deno** - Full support with Web APIs
- ✅ **Cloudflare Workers** - Compatible with edge runtimes
- ✅ **Browsers** - Works in browser environments

The library automatically detects your runtime and uses the most efficient hashing implementation available.

## Quick Start

```typescript
import { buildHeaders, commonHeaders } from "@mateosuarezdev/headers-builder";

// Simple API response
const headers = buildHeaders()
  .contentType("json")
  .cache("API_RESPONSE")
  .cors()
  .build();

// Or use presets
const headers = commonHeaders.api();
```

**Works with any framework:**

```typescript
// BRPC (override automatic headers when needed)
const apiRoutes = {
  // BRPC handles headers automatically, but you can override
  index: procedure.query(async ({ ctx }) => {
    ctx.setHeaders(commonHeaders.api()); // Custom headers
    return "Hello from brpc";
  }),

  // Fine-grained control for specific needs
  users: procedure.query(async ({ ctx }) => {
    ctx.setHeaders(
      buildHeaders().contentType("json").cache("ONE_HOUR").cors().build()
    );
    return users;
  }),
};

// Bun
export default {
  fetch(req) {
    return new Response(data, { headers: commonHeaders.api() });
  },
};

// Node.js / Express
app.get("/api/users", (req, res) => {
  res.set(commonHeaders.api());
  res.json(users);
});

// Hono
app.get("/", (c) => {
  return c.json(data, { headers: commonHeaders.api() });
});

// Elysia
app.get("/", () => ({
  data,
  headers: commonHeaders.api(),
}));
```

## Why Use Headers Builder?

Managing HTTP headers manually is error-prone and verbose across all frameworks:

```typescript
// Before ❌
const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=300, s-maxage=900",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  ETag: `"${someHashFunction(content)}"`, // Different per runtime!
};

// After ✅
const headers = buildHeaders()
  .contentType("json")
  .cache("API_RESPONSE")
  .cors()
  .eTag(content) // Works everywhere automatically
  .build();
```

Headers Builder handles runtime differences for you, so your code works everywhere without changes.

## Core API

### Basic Usage

```typescript
import { buildHeaders } from "@mateosuarezdev/headers-builder";

const headers = buildHeaders().contentType("json").cache("ONE_HOUR").build();
```

### Content Type

Set content type with autocomplete:

```typescript
// From known types
buildHeaders().contentType("json"); // application/json
buildHeaders().contentType("html"); // text/html; charset=utf-8
buildHeaders().contentType("css"); // text/css

// From file path (auto-detects extension)
buildHeaders().filePath("style.css"); // text/css
buildHeaders().filePath("app.js"); // application/javascript

// Custom MIME type
buildHeaders().mimeType("application/vnd.api+json");
```

**Supported types:** `html`, `css`, `javascript`, `json`, `xml`, `text`, `csv`, `markdown`, `png`, `jpeg`, `gif`, `svg`, `webp`, `icon`, `woff`, `woff2`, `mp4`, `webm`, `pdf`, and more.

### Cache Strategies

Choose from pre-configured cache strategies:

```typescript
// Time-based strategies
buildHeaders().cache("ONE_YEAR"); // max-age=31536000
buildHeaders().cache("ONE_MONTH"); // max-age=2592000
buildHeaders().cache("ONE_DAY"); // max-age=86400
buildHeaders().cache("ONE_HOUR"); // max-age=3600
buildHeaders().cache("FIVE_MINUTES"); // max-age=300
buildHeaders().cache("NO_CACHE"); // no-cache, no-store

// Content-specific strategies
buildHeaders().cache("HASHED_ASSET"); // immutable, 1 year
buildHeaders().cache("JAVASCRIPT"); // 1 month with revalidation
buildHeaders().cache("API_RESPONSE"); // 5 min client, 15 min CDN
buildHeaders().cache("HTML_PAGE"); // 1 hour with revalidation
```

**Available strategies:**

- **Generic:** `NO_CACHE`, `ONE_YEAR`, `ONE_MONTH`, `ONE_WEEK`, `ONE_DAY`, `ONE_HOUR`, `FIVE_MINUTES`, `IMMUTABLE`
- **Content-specific:** `STYLESHEET`, `JAVASCRIPT`, `HASHED_ASSET`, `FONT`, `IMAGE`, `FAVICON`, `HTML_PAGE`, `API_RESPONSE`, `FEED`, `SITEMAP`, `MANIFEST`, `SERVICE_WORKER`, `MEDIA_STREAM`, `DOCUMENT`, `ARCHIVE`

### ETags

Automatic ETag generation with runtime-optimized content hashing:

```typescript
const content = JSON.stringify(data);

// Auto-generate from content (uses Bun.hash in Bun, crypto in Node.js, etc.)
buildHeaders().eTag(content);
// ETag: "a3f5b2c1"

// Provide explicit ETag
buildHeaders().eTag('"custom-etag"');

// Works with binary data
buildHeaders().eTag(buffer);

// Conditional - skips if undefined
buildHeaders().eTag(maybeContent); // safe even if undefined
```

**Runtime optimizations:**

- **Bun**: Uses ultra-fast `Bun.hash()`
- **Node.js**: Uses native `crypto` module
- **Others**: Fallback implementation

### CORS

Simple or customized CORS headers:

```typescript
// Simple CORS (allows all, no credentials)
buildHeaders().cors();

// Specific origin (credentials enabled by default)
buildHeaders().cors({
  origin: "https://example.com",
  methods: ["GET", "POST"],
  headers: ["Content-Type", "X-Custom-Header"],
  credentials: true, // default when origin is not "*"
  maxAge: 86400,
});

// Disable credentials for specific origin
buildHeaders().cors({
  origin: "https://example.com",
  credentials: false, // explicit override
});
```

**Multiple origins pattern:**

For multiple allowed origins, use the `getCorsOrigin` utility that automatically handles development and production environments:

```typescript
import { buildHeaders, getCorsOrigin } from "@mateosuarezdev/headers-builder";

const allowedOrigins = ["https://app.example.com", "https://admin.example.com"];

export function handleRequest(req: Request) {
  // Automatically allows localhost in dev, strict in production
  const origin = getCorsOrigin(req, allowedOrigins);

  return new Response(data, {
    headers: buildHeaders().contentType("json").cors({ origin }).build(),
  });
}
```

**getCorsOrigin behavior:**

Development mode (`NODE_ENV !== "production"`):

- ✅ Matches exact allowed origins
- ✅ Auto-allows `localhost`, `127.0.0.1`, `0.0.0.0` with any port
- ✅ Allows same hostname with different ports

Production mode (`NODE_ENV === "production"`):

- ✅ Matches exact allowed origins only
- ❌ Strict matching - no automatic localhost
- ❌ No port flexibility

```typescript
// Custom behavior (optional)
const origin = getCorsOrigin(req, allowedOrigins, {
  allowAnyLocalhost: false, // Disable localhost auto-allow
  allowAnyPort: false, // Disable port flexibility
});
```

**Smart credentials default:**

- `origin: "*"` → `credentials: false` (secure default)
- `origin: "https://..."` → `credentials: true` (likely needs auth)
- Works with `localhost` for development testing

### Security Headers

Built-in security best practices:

```typescript
// Default security headers
buildHeaders().security();
// Adds: HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

// Custom CSP
buildHeaders().security({
  csp: "default-src 'self'; script-src 'self' 'unsafe-inline'",
  hsts: 31536000,
  frameOptions: "DENY",
});

// Disable specific headers
buildHeaders().security({
  hsts: false,
  xssProtection: false,
});
```

### Additional Methods

```typescript
// Last-Modified
buildHeaders().lastModified(new Date());

// Content-Length (auto-calculated in build())
buildHeaders().contentLength(1024);

// Redirects
buildHeaders().redirect("https://example.com", true); // permanent
buildHeaders().redirect("https://example.com"); // temporary

// Vary
buildHeaders().vary("Accept-Encoding", "User-Agent");

// Compression
buildHeaders().compress("gzip");

// Custom headers
buildHeaders().custom("X-API-Version", "v2");
buildHeaders().customHeaders({
  "X-Request-ID": "123",
  "X-Custom": "value",
});
```

### Building Headers

```typescript
// As plain object
const headers = buildHeaders().contentType("json").build();

// With auto Content-Length
const headers = buildHeaders().contentType("json").build(content);

// As Web API Headers
const headers = buildHeaders().contentType("json").buildHeaders();
```

## Presets

Pre-configured headers for common scenarios:

### Static Assets

```typescript
import { commonHeaders } from "@mateosuarezdev/headers-builder";

// CSS files
commonHeaders.css(content);
// Content-Type: text/css
// Cache-Control: public, max-age=2592000, must-revalidate
// ETag: "hash"

// JavaScript files
commonHeaders.javascript(content);

// Hashed assets (with [hash] in filename)
commonHeaders.hashedAsset("app.[hash].js", content);
// Cache-Control: public, max-age=31536000, immutable

// Fonts
commonHeaders.font("font.woff2");
// Access-Control-Allow-Origin: *

// Images
commonHeaders.image("photo.jpg");

// Favicon
commonHeaders.favicon();
```

### API Responses

```typescript
// Standard API response
commonHeaders.api();
// Content-Type: application/json
// Cache-Control: public, max-age=300, s-maxage=900
// CORS enabled

// Expensive API query with ETag
commonHeaders.expensiveApi(content);

// Real-time API (no caching)
commonHeaders.realtime();
// Cache-Control: no-cache, no-store
```

### HTML Pages

```typescript
// Standard HTML page
commonHeaders.html();
// Security headers included

// Expensive HTML (reports, dashboards)
commonHeaders.expensiveHtml(content);
// Includes ETag for large content
```

### Special Files

```typescript
// PWA Manifest
commonHeaders.manifest(content);

// Service Worker
commonHeaders.serviceWorker();
// Always fresh, no caching

// Sitemap
commonHeaders.sitemap(content);

// RSS/Atom Feed
commonHeaders.feed(content, "rss");
commonHeaders.feed(content, "atom");
```

### Media

```typescript
// Video streaming
commonHeaders.video("movie.mp4");
// Accept-Ranges: bytes
// Cache-Control: no-cache, no-store

// Audio streaming
commonHeaders.audio("song.mp3");
```

### Documents

```typescript
// PDF (inline display)
commonHeaders.pdf(content);
// Content-Disposition: inline

// File download
commonHeaders.download("report.pdf", "path/to/file.pdf", content);
// Content-Disposition: attachment; filename="report.pdf"
```

### Security & Redirects

```typescript
// Security-focused headers
commonHeaders.secure();

// Redirects
commonHeaders.permanentRedirect("https://example.com");
commonHeaders.temporaryRedirect("https://example.com");
```

## Real-World Examples

### BRPC

BRPC automatically sets appropriate headers for different procedure types and file responses, but you can override them for custom behavior:

```typescript
import { buildHeaders, commonHeaders } from "@mateosuarezdev/headers-builder";

const apiRoutes = {
  // Override BRPC's automatic headers for custom caching
  getUsers: procedure.query(async ({ ctx }) => {
    ctx.setHeaders(commonHeaders.api());
    return await db.query("SELECT * FROM users");
  }),

  // Add ETags for expensive queries
  getReport: procedure.query(async ({ ctx }) => {
    const report = await generateReport();
    const content = JSON.stringify(report);

    ctx.setHeaders(commonHeaders.expensiveApi(content));
    return report;
  }),

  // Custom CORS for specific endpoints
  updateUser: procedure.mutation(async ({ ctx }) => {
    ctx.setHeaders(
      buildHeaders()
        .contentType("json")
        .cache("NO_CACHE")
        .cors({ origin: "https://app.example.com", credentials: true })
        .build()
    );
    return await updateUser();
  }),

  // Fine-tune security headers
  adminPanel: procedure.query(async ({ ctx }) => {
    ctx.setHeaders(
      buildHeaders()
        .contentType("html")
        .security({
          csp: "default-src 'self'; script-src 'self' 'unsafe-inline'",
          hsts: 31536000,
        })
        .build()
    );
    return renderAdminPanel();
  }),
};
```

### API Endpoint

```typescript
export async function getUsers(req: Request) {
  const users = await db.query("SELECT * FROM users");
  const content = JSON.stringify(users);

  return new Response(content, {
    headers: commonHeaders.api(),
  });
}
```

### Static File Server

```typescript
export async function serveStatic(req: Request) {
  const url = new URL(req.url);
  const file = await Bun.file(`./public${url.pathname}`);

  return new Response(file, {
    headers: buildHeaders().filePath(url.pathname).cache("ONE_MONTH").build(),
  });
}
```

### Hashed Assets with ETag

```typescript
export async function serveBundledJS(req: Request) {
  const content = await Bun.file("./dist/app.[hash].js").text();

  return new Response(content, {
    headers: commonHeaders.hashedAsset("app.[hash].js", content),
  });
}
```

### Protected API with CORS

```typescript
import { buildHeaders, getCorsOrigin } from "@mateosuarezdev/headers-builder";

const allowedOrigins = ["https://app.example.com", "https://admin.example.com"];

export async function updateUser(req: Request) {
  // Auto-handles dev/prod environments
  const origin = getCorsOrigin(req, allowedOrigins);

  const data = await req.json();
  await db.update(data);

  return new Response(JSON.stringify({ success: true }), {
    headers: buildHeaders()
      .contentType("json")
      .cache("NO_CACHE")
      .cors({ origin }) // credentials: true by default
      .build(),
  });
}
```

### Secure HTML Page

```typescript
export async function serveDashboard(req: Request) {
  const html = await renderDashboard();

  return new Response(html, {
    headers: buildHeaders()
      .contentType("html")
      .cache("HTML_PAGE")
      .security({
        csp: "default-src 'self'; script-src 'self' https://cdn.example.com",
      })
      .build(),
  });
}
```

### File Download

```typescript
export async function downloadReport(req: Request) {
  const report = await generatePDFReport();

  return new Response(report, {
    headers: commonHeaders.download("monthly-report.pdf", "reports/report.pdf"),
  });
}
```

### Conditional Requests with ETag

```typescript
export async function getArticle(req: Request) {
  const article = await db.getArticle(id);
  const content = JSON.stringify(article);

  const headers = buildHeaders()
    .contentType("json")
    .cache("ONE_HOUR")
    .eTag(content)
    .build();

  // Check If-None-Match
  const clientETag = req.headers.get("If-None-Match");
  if (clientETag === headers["ETag"]) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(content, { headers });
}
```

## TypeScript Support

Fully typed for excellent IDE support:

```typescript
import type {
  CacheStrategy,
  ContentTypeInput,
} from "@mateosuarezdev/headers-builder";

const strategy: CacheStrategy = "ONE_DAY";
const type: ContentTypeInput = "json";
```

## Cache Strategy Reference

| Strategy       | Cache-Control                            | Use Case                      |
| -------------- | ---------------------------------------- | ----------------------------- |
| `NO_CACHE`     | `no-cache, no-store, must-revalidate`    | Dynamic content, always fresh |
| `FIVE_MINUTES` | `public, max-age=300`                    | Frequently updated content    |
| `ONE_HOUR`     | `public, max-age=3600, must-revalidate`  | Semi-dynamic content          |
| `ONE_DAY`      | `public, max-age=86400, must-revalidate` | Daily updated content         |
| `ONE_WEEK`     | `public, max-age=604800`                 | Weekly updated content        |
| `ONE_MONTH`    | `public, max-age=2592000`                | Static resources              |
| `ONE_YEAR`     | `public, max-age=31536000`               | Rarely changing assets        |
| `IMMUTABLE`    | `public, max-age=31536000, immutable`    | Never changing assets         |
| `API_RESPONSE` | `public, max-age=300, s-maxage=900`      | API with CDN                  |
| `HASHED_ASSET` | `public, max-age=31536000, immutable`    | Versioned assets              |

## Best Practices

### 1. Use Presets When Possible

```typescript
// Good ✅
return new Response(css, { headers: commonHeaders.css(css) });

// Verbose ❌
return new Response(css, {
  headers: buildHeaders()
    .contentType("css")
    .cache("STYLESHEET")
    .eTag(css)
    .build(),
});
```

### 2. ETag for Expensive Content

```typescript
// Large API responses
commonHeaders.expensiveApi(content);

// Heavy HTML reports
commonHeaders.expensiveHtml(content);

// But not for simple APIs
commonHeaders.api(); // No ETag needed for cheap queries
```

### 3. Match Cache to Content Lifecycle

```typescript
// Hashed assets - never change
commonHeaders.hashedAsset("app.[hash].js", content);

// Regular CSS - may update, needs revalidation
commonHeaders.css(content);

// API data - short cache with CDN
commonHeaders.api();
```

### 4. Security for User-Facing Content

```typescript
// Always for HTML pages
commonHeaders.html(); // includes security()

// Custom CSP for apps
buildHeaders()
  .contentType("html")
  .security({
    csp: "default-src 'self'; img-src 'self' https://cdn.example.com",
  })
  .build();
```

### 5. CORS Configuration

```typescript
import { buildHeaders, getCorsOrigin } from "@mateosuarezdev/headers-builder";

// Public API - allow all (no credentials)
commonHeaders.api();

// Protected API - environment-aware origin handling
const allowedOrigins = ["https://app.example.com"];

export function handleRequest(req: Request) {
  // Dev: allows localhost automatically
  // Prod: strict matching only
  const origin = getCorsOrigin(req, allowedOrigins);

  return new Response(data, {
    headers: buildHeaders()
      .contentType("json")
      .cors({ origin }) // credentials: true by default
      .build(),
  });
}
```

## Performance Tips

- **ETag generation adapts to runtime** - Bun is fastest, Node.js uses crypto, all are optimized
- **Presets are pre-configured** - No runtime overhead
- **Chain methods efficiently** - Each method returns `this`
- **Build once, reuse** - Cache header objects for repeated responses
- **Zero dependencies** - Pure JavaScript, works everywhere

## Quick Reference

```typescript
import {
  buildHeaders,
  commonHeaders,
  getCorsOrigin,
  quickHeaders,
} from "@mateosuarezdev/headers-builder";

// Common patterns
commonHeaders.api(); // API endpoint
commonHeaders.html(); // HTML page
commonHeaders.css(content); // CSS file
commonHeaders.javascript(content); // JS file
commonHeaders.image("path/to/img.png"); // Image
commonHeaders.download("file.pdf", "path"); // File download

// Quick helpers
quickHeaders("json"); // Simple JSON
quickHeaders("html", "ONE_DAY"); // HTML with cache

// CORS utility
getCorsOrigin(req, allowedOrigins); // Auto dev/prod origin matching

// Custom builder
buildHeaders()
  .contentType("json")
  .cache("ONE_HOUR")
  .cors()
  .eTag(content)
  .build();
```

## License

Custom Use License - Free to use for any purpose, but modifications and derivatives are not permitted. See [LICENSE](LICENSE) file for details.

## Contributing

Found a bug or have a feature request? Open an issue or submit a PR!

## Support

For issues and questions: https://github.com/mateosuarezdev/headers-builder/issues
