import { HeadersBuilder } from "./headers-builder";
import type { HeadersCacheStrategy, HeadersContentTypeInput } from "./types";

/**
 * Create a new headers builder
 * @example
 * const h = buildHeaders()
 *   .contentType("json")
 *   .cache("API_RESPONSE")
 *   .cors()
 *   .build()
 */
export function buildHeaders(): HeadersBuilder {
  return new HeadersBuilder();
}

/**
 * Example for simple JSON responses
 * @example
 * return new Response(data, { headers: quickHeaders("json") })
 */
export function quickHeaders(
  type: HeadersContentTypeInput,
  cache?: HeadersCacheStrategy
): Record<string, string> {
  const builder = buildHeaders().contentType(type);
  if (cache) {
    builder.cache(cache);
  }
  return builder.build();
}
