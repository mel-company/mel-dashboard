import { parse } from "tldts";

/**
 * Resolve the store tenant subdomain from the current host.
 *
 * Dashboard hosts use `dash.{store}.mel.iq` — the API expects `{store}` only
 * (e.g. `dash.hasan.mel.iq` → `hasan`).
 */
export function getTenantSubdomain(
  hostname: string = typeof window !== "undefined" ? window.location.hostname : "",
): string {
  if (!hostname) return "";

  const { subdomain } = parse(hostname);
  if (!subdomain) return "";

  // dash.hasan → hasan | dash.my-shop → my-shop
  if (subdomain.startsWith("dash.")) {
    return subdomain.slice("dash.".length);
  }

  return subdomain;
}
