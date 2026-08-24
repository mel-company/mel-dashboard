function cleanEnvUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  return value.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
}

export function resolveAssetBaseUrl(explicitBase?: string | null): string {
  const explicit = cleanEnvUrl(explicitBase ?? undefined);
  if (explicit) return explicit;

  const publicUrl = cleanEnvUrl(import.meta.env.VITE_PUBLIC_URL);
  if (publicUrl) return publicUrl;

  const apiBase = cleanEnvUrl(import.meta.env.VITE_API_BASE_URL);
  if (apiBase) {
    // Relative proxies like "/api/v1" strip to "" — not a usable asset host.
    const stripped = apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    if (stripped && !stripped.startsWith("/")) return stripped;
  }

  return "https://api.mel.iq";
}

export function coerceImagePath(image: unknown): string {
  if (typeof image === "string") return image.trim();
  if (image && typeof image === "object") {
    const record = image as Record<string, unknown>;
    for (const key of ["url", "path", "key", "src"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
}

function repairUtf8Mojibake(segment: string): string {
  if (!/[\u00C0-\u00FF]/.test(segment)) return segment;

  try {
    const bytes = Uint8Array.from(segment, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (decoded && decoded !== segment) return decoded;
  } catch {
    // Keep the original segment when it is not mojibake.
  }

  return segment;
}

function encodePathSegment(segment: string): string {
  const repaired = repairUtf8Mojibake(segment);

  try {
    return encodeURIComponent(decodeURIComponent(repaired));
  } catch {
    return encodeURIComponent(repaired);
  }
}

function encodeAssetPath(path: string, repair = true): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) =>
      repair ? encodePathSegment(segment) : encodePathSegmentRaw(segment),
    )
    .join("/");
}

function encodePathSegmentRaw(segment: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

/**
 * Pull `stores/...` out of relative keys or full R2 / CDN URLs
 * (including private signed `r2.cloudflarestorage.com` links).
 */
export function extractStoresAssetPath(urlOrPath: string): string | null {
  const trimmed = urlOrPath.trim();
  if (!trimmed) return null;

  const withoutQuery = trimmed.split("?")[0] ?? trimmed;

  try {
    const path = /^https?:\/\//i.test(withoutQuery)
      ? new URL(withoutQuery).pathname.replace(/^\/+/, "")
      : withoutQuery.replace(/^\/+/, "");

    const idx = path.toLowerCase().indexOf("stores/");
    if (idx >= 0) return path.slice(idx);
  } catch {
    return null;
  }

  return null;
}

function isPrivateOrSignedR2Url(url: string): boolean {
  return (
    /r2\.cloudflarestorage\.com/i.test(url) || /[?&]X-Amz-/i.test(url)
  );
}

function normalizeAssetHost(url: string, baseUrl?: string | null): string {
  const storesPath = extractStoresAssetPath(url);
  if (storesPath && (isPrivateOrSignedR2Url(url) || baseUrl || cleanEnvUrl(import.meta.env.VITE_PUBLIC_URL))) {
    const base = resolveAssetBaseUrl(baseUrl);
    return `${base}/${encodeAssetPath(storesPath)}`;
  }

  const publicUrl = cleanEnvUrl(import.meta.env.VITE_PUBLIC_URL);
  if (!publicUrl) return url;

  if (/^https?:\/\/[^/]+\.r2\.dev\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/^\/+/, "");
      return `${publicUrl}/${encodeAssetPath(path)}`;
    } catch {
      return url;
    }
  }

  return url;
}

function buildAssetUrl(image: string, baseUrl?: string | null): string {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return normalizeAssetHost(image, baseUrl);
  }

  const storesPath = extractStoresAssetPath(image) ?? image.replace(/^\/+/, "");
  const base = resolveAssetBaseUrl(baseUrl);
  return `${base}/${encodeAssetPath(storesPath)}`;
}

export const getImageUrl = (
  image?: unknown,
  baseUrl?: string | null,
): string => {
  const trimmed = coerceImagePath(image);
  if (!trimmed) return "";

  return buildAssetUrl(trimmed, baseUrl);
};

/** Prefer public CDN URL, then encoding variants, then original signed URL. */
export function buildAssetUrlCandidates(
  image?: unknown,
  baseUrl?: string | null,
): string[] {
  const trimmed = coerceImagePath(image);
  if (!trimmed) return [];

  const out: string[] = [];
  const push = (url: string) => {
    if (url && !out.includes(url)) out.push(url);
  };

  const storesPath = extractStoresAssetPath(trimmed);
  if (storesPath) {
    const base = resolveAssetBaseUrl(baseUrl);
    push(`${base}/${encodeAssetPath(storesPath, true)}`);
    push(`${base}/${encodeAssetPath(storesPath, false)}`);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    push(trimmed);
  } else if (!storesPath) {
    const base = resolveAssetBaseUrl(baseUrl);
    push(`${base}/${encodeAssetPath(trimmed.replace(/^\/+/, ""), true)}`);
    push(`${base}/${encodeAssetPath(trimmed.replace(/^\/+/, ""), false)}`);
  }

  return out;
}
