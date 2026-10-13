import { parse } from "tldts";

function normalizeTenantSlug(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  // dash.hasan → hasan | dash.hasan.mel.iq → hasan
  if (trimmed.startsWith("dash.")) {
    const rest = trimmed.slice("dash.".length);
    return rest.split(".")[0] ?? "";
  }
  // hasan.mel.iq → hasan
  if (trimmed.includes(".")) {
    return trimmed.split(".")[0] ?? "";
  }
  return trimmed;
}

/**
 * Resolve the store tenant slug.
 *
 * Priority:
 * 1. Hostname (`dash.hasan.mel.iq` → `hasan`)
 * 2. `VITE_TENANT_SUBDOMAIN` (local/dev on localhost)
 */
export function getTenantSubdomain(
  hostname: string = typeof window !== "undefined" ? window.location.hostname : "",
): string {
  if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
    const { subdomain } = parse(hostname);
    if (subdomain) {
      return normalizeTenantSlug(subdomain);
    }
  }

  const fromEnv = String(import.meta.env.VITE_TENANT_SUBDOMAIN ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (fromEnv) return normalizeTenantSlug(fromEnv);

  return "";
}

/**
 * Login URL after a platform-slug rename.
 *
 * Production hosts are `dash.{slug}.mel.iq` — swapping the slug keeps the
 * merchant on the same product surface. Localhost has no tenant in the host,
 * so we stay on `/login` and let the caller toast the new public host.
 */
export function getLoginUrlAfterSlugRename(
  newSlug: string,
  hostname: string = typeof window !== "undefined" ? window.location.hostname : "",
  protocol: string = typeof window !== "undefined" ? window.location.protocol : "https:",
): string {
  const slug = normalizeTenantSlug(newSlug);
  if (!slug) return "/login";

  if (
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  ) {
    return "/login";
  }

  // dash.hasan.mel.iq → dash.{slug}.mel.iq
  if (hostname.startsWith("dash.")) {
    const rest = hostname.slice("dash.".length);
    const parts = rest.split(".");
    parts[0] = slug;
    return `${protocol}//dash.${parts.join(".")}/login`;
  }

  // hasan.mel.iq (storefront-style) → dash.{slug}.mel.iq
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    parts[0] = slug;
    return `${protocol}//dash.${parts.join(".")}/login`;
  }

  return "/login";
}
