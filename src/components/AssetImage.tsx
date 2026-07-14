import { useEffect, useMemo, useState } from "react";
import { coerceImagePath, resolveAssetBaseUrl } from "@/utils/image-url";
import { cn } from "@/lib/utils";

function encodeSegmentRaw(segment: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

function repairUtf8Mojibake(segment: string): string {
  if (!/[\u00C0-\u00FF]/.test(segment)) return segment;
  try {
    const bytes = Uint8Array.from(segment, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (decoded && decoded !== segment) return decoded;
  } catch {
    /* keep original */
  }
  return segment;
}

function encodePath(path: string, repair: boolean): string {
  return path
    .replace(/^\/+/, "")
    .split("/")
    .filter((s) => s.length > 0)
    .map((segment) =>
      encodeSegmentRaw(repair ? repairUtf8Mojibake(segment) : segment),
    )
    .join("/");
}

/** Candidate URLs for an asset key — repaired Arabic + original encoding. */
export function buildAssetUrlCandidates(
  image?: unknown,
  baseUrl?: string | null,
): string[] {
  const trimmed = coerceImagePath(image);
  if (!trimmed) return [];

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return [trimmed];
  }

  const base = resolveAssetBaseUrl(baseUrl);
  const repaired = `${base}/${encodePath(trimmed, true)}`;
  const raw = `${base}/${encodePath(trimmed, false)}`;

  if (raw === repaired) return [raw];
  return [repaired, raw];
}

type AssetImageProps = {
  image?: unknown;
  baseUrl?: string | null;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
  /** Eager for above-the-fold hero images. Default: lazy */
  priority?: boolean;
};

/**
 * Lazy asset image with a simple fade-in, and mojibake/raw URL retry.
 */
export function AssetImage({
  image,
  baseUrl,
  alt = "",
  className,
  fallback = null,
  priority = false,
}: AssetImageProps) {
  const candidates = useMemo(
    () => buildAssetUrlCandidates(image, baseUrl),
    [image, baseUrl],
  );
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const sourceKey = `${coerceImagePath(image)}|${baseUrl ?? ""}`;

  useEffect(() => {
    setIndex(0);
    setLoaded(false);
  }, [sourceKey]);

  const src = candidates[index];
  if (!src) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(
        "transition-opacity duration-300 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setLoaded(false);
        setIndex((i) =>
          i + 1 < candidates.length ? i + 1 : candidates.length,
        );
      }}
    />
  );
}

export function hasAssetImage(image?: unknown): boolean {
  return Boolean(coerceImagePath(image));
}
