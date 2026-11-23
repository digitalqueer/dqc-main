// Server-only: helpers for the responses that aren't server functions (the
// share cards, the feed).
import { getServerEnv } from "./env.server";

/**
 * The site's public origin, for absolute links. SITE_URL (or BETTER_AUTH_URL)
 * wins over the request, which behind a proxy may say http:// or an internal
 * host.
 */
export function resolveSiteOrigin(request_url: string) {
  const configured = getServerEnv().siteUrl;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.origin;
      }
    } catch {
      // Fall through to the request's origin.
    }
    console.warn(`Ignoring SITE_URL "${configured}": not an http(s) URL.`);
  }
  return new URL(request_url).origin;
}

/** A strong ETag for a response body (or anything that determines it). */
export async function etagFor(body: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(body),
  );
  const hex = Array.from(new Uint8Array(digest).slice(0, 16), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `"${hex}"`;
}

/** Whether an If-None-Match header already has this version. */
export function matchesEtag(if_none_match: string | null, etag: string) {
  if (!if_none_match) return false;
  return if_none_match
    .split(",")
    .map((tag) => tag.trim().replace(/^W\//, ""))
    .some((tag) => tag === "*" || tag === etag);
}
