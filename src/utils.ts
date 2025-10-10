/**
 * Hash function for ETags using Bun's built-in hashing
 */
// export function hashContent(
//   content: string | ArrayBuffer | Uint8Array
// ): string {
//   if (typeof content === "string") {
//     return Bun.hash(content).toString(16);
//   } else {
//     return Bun.hash(content).toString(16);
//   }
// }

/**
 * Hash function for ETags using Bun's built-in hashing
 * in Bun, crypto in node, and a fallback
 * for environments without crypto
 */
export function hashContent(
  content: string | ArrayBuffer | Uint8Array
): string {
  // Bun (fastest)
  if (typeof Bun !== "undefined" && Bun.hash) {
    return Bun.hash(content).toString(16);
  }

  // Node.js
  try {
    const crypto = require("crypto");
    let buffer: Buffer;

    if (typeof content === "string") {
      buffer = Buffer.from(content);
    } else if (content instanceof ArrayBuffer) {
      buffer = Buffer.from(new Uint8Array(content));
    } else {
      buffer = Buffer.from(content);
    }

    return crypto.createHash("md5").update(buffer).digest("hex");
  } catch {
    // Fallback for environments without crypto (unlikely)
    const bytes =
      typeof content === "string"
        ? new TextEncoder().encode(content)
        : content instanceof ArrayBuffer
        ? new Uint8Array(content)
        : content;

    let hash = 0;
    for (let i = 0; i < bytes.length; i++) {
      hash = (hash << 5) - hash + bytes[i];
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, "0");
  }
}

/**
 * Internal utility for handling CORS origins with automatic dev mode detection
 * In development: allows ALL origins automatically
 * In production: strict matching only
 * Empty array: returns the request origin (for full-stack apps on same domain)
 * @internal
 */
export function getCorsOrigin(
  req: Request,
  allowedOrigins: string[],
  options?: {
    allowAll?: boolean; // Auto: true in dev, false in prod
  }
): string {
  const requestOrigin = req.headers.get("Origin");

  // Detect environment
  const isDev = process.env.NODE_ENV !== "production";
  const allowAll = options?.allowAll ?? isDev;

  // Development mode: accept any origin
  if (allowAll && requestOrigin) {
    return requestOrigin;
  }

  // Empty array: for full-stack apps, echo back the request origin
  // If no origin header (same-origin), return "*" (harmless)
  if (allowedOrigins.length === 0) {
    return requestOrigin || "*";
  }

  // No Origin header (same-origin request)
  if (!requestOrigin) {
    return allowedOrigins[0];
  }

  // Direct match - always allowed
  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // No match in production, return first allowed origin
  return allowedOrigins[0];
}
