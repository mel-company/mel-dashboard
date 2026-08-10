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
