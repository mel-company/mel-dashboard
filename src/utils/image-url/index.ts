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
    return apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
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

function encodeAssetPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodePathSegment)
    .join("/");
}

function normalizeAssetHost(url: string): string {
  const publicUrl = cleanEnvUrl(import.meta.env.VITE_PUBLIC_URL);
  if (!publicUrl) return url;

  const storesMatch = url.match(/^(?:https?:\/\/[^/]+)?\/?(stores\/.*)$/i);
  if (storesMatch) {
    return `${publicUrl}/${encodeAssetPath(storesMatch[1])}`;
  }

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
    return normalizeAssetHost(image);
  }

  const base = resolveAssetBaseUrl(baseUrl);
  const path = encodeAssetPath(image.replace(/^\/+/, ""));
  return `${base}/${path}`;
}

export const getImageUrl = (
  image?: unknown,
  baseUrl?: string | null,
): string => {
  const trimmed = coerceImagePath(image);
  if (!trimmed) return "";

  return buildAssetUrl(trimmed, baseUrl);
};
